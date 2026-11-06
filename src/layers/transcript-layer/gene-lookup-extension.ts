import { Layer, LayerExtension } from '@deck.gl/core';
import type { Texture } from '@luma.gl/core';
import type { ShaderModule } from '@luma.gl/shadertools';

/**
 * GPU gene filtering + coloring for point layers.
 *
 * Each point carries one uint16 gene index (static, uploaded once with the tile). A small RGBA8 lookup texture,
 * one texel per gene (rgb = color, a = 255 when the gene passes the filter else 0), is sampled in the vertex shader:
 *  - mode 'visible':   genes passing the filter are drawn with their color, everything else is clipped
 *  - mode 'discarded': genes failing the filter are drawn (outline layer), everything else is clipped
 * Changing the gene filter or colormap therefore rewrites O(genes) texels and never touches per-point buffers.
 */

export const GENE_LOOKUP_TEXTURE_WIDTH = 1024;
/** 1024 x 64 texels cover every possible uint16 gene index */
export const GENE_LOOKUP_TEXTURE_HEIGHT = 64;

const uniformBlock = /* glsl */ `\
uniform geneLookupUniforms {
  float discardedMode;
} geneLookup;
`;

const vs = /* glsl */ `\
${uniformBlock}
uniform sampler2D geneLookupTexture;
in float instanceGeneIndices;

vec4 geneLookup_fetch() {
  // unorm16 attribute: value / 65535
  int gene = int(instanceGeneIndices * 65535.0 + 0.5);
  return texelFetch(geneLookupTexture, ivec2(gene & ${GENE_LOOKUP_TEXTURE_WIDTH - 1}, gene >> 10), 0);
}
`;

type GeneLookupModuleProps = {
  discardedMode: number;
  geneLookupTexture: Texture;
};

const geneLookupModule = {
  name: 'geneLookup',
  vs,
  uniformTypes: { discardedMode: 'f32' },
  inject: {
    'vs:DECKGL_FILTER_GL_POSITION': /* glsl */ `
      {
        bool geneVisible = geneLookup_fetch().a > 0.5;
        if (geneVisible == (geneLookup.discardedMode > 0.5)) {
          position = vec4(1.0e4, 1.0e4, 1.0e4, 1.0); // clipped
        }
      }
    `,
    'vs:DECKGL_FILTER_COLOR': /* glsl */ `
      color.rgb = geneLookup.discardedMode > 0.5 ? vec3(0.933) : geneLookup_fetch().rgb;
    `
  }
} as const satisfies ShaderModule<GeneLookupModuleProps>;

export type GeneLookupExtensionProps = {
  /** Texture produced by `createGeneLookupTexture` / filled with `fillGeneLookup` */
  geneLookupTexture?: Texture | null;
  /** Bumped by the owner whenever the texture contents changed (triggers a redraw) */
  geneLookupVersion?: number;
  geneLookupMode?: 'visible' | 'discarded';
};

const defaultProps = {
  geneLookupTexture: { type: 'object', value: null, compare: 0 },
  geneLookupVersion: 0,
  geneLookupMode: 'visible',
  getGeneIndex: { type: 'accessor', value: 0 }
};

export class GeneLookupExtension extends LayerExtension {
  static extensionName = 'GeneLookupExtension';
  static defaultProps = defaultProps;

  getShaders() {
    return { modules: [geneLookupModule] };
  }

  initializeState(this: Layer<GeneLookupExtensionProps>) {
    this.getAttributeManager()?.addInstanced({
      instanceGeneIndices: {
        size: 1,
        type: 'unorm16',
        accessor: 'getGeneIndex'
      }
    });
  }

  draw(this: Layer<GeneLookupExtensionProps>) {
    const { geneLookupTexture, geneLookupMode } = this.props;
    if (!geneLookupTexture) return;
    this.setShaderModuleProps({
      geneLookup: { geneLookupTexture, discardedMode: geneLookupMode === 'discarded' ? 1 : 0 }
    });
  }
}

export function createGeneLookupTexture(device: { createTexture: (props: any) => Texture }): Texture {
  return device.createTexture({
    width: GENE_LOOKUP_TEXTURE_WIDTH,
    height: GENE_LOOKUP_TEXTURE_HEIGHT,
    format: 'rgba8unorm',
    sampler: {
      minFilter: 'nearest',
      magFilter: 'nearest',
      addressModeU: 'clamp-to-edge',
      addressModeV: 'clamp-to-edge'
    },
    data: new Uint8Array(GENE_LOOKUP_TEXTURE_WIDTH * GENE_LOOKUP_TEXTURE_HEIGHT * 4)
  });
}

const WHITE = [255, 255, 255];

/** O(genes): rewrites one texel per gene; genes beyond `names.length` stay transparent (hidden). */
export function fillGeneLookup(
  texture: Texture,
  names: readonly string[],
  colors: Record<string, number[]>,
  isVisible: (name: string) => boolean
) {
  // upload the whole (256 KB) texture: copyImageData expects a full-size buffer
  const rows = GENE_LOOKUP_TEXTURE_HEIGHT;
  const data = new Uint8Array(rows * GENE_LOOKUP_TEXTURE_WIDTH * 4);
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const c = colors[name] ?? WHITE;
    data[i * 4] = c[0];
    data[i * 4 + 1] = c[1];
    data[i * 4 + 2] = c[2];
    data[i * 4 + 3] = isVisible(name) ? 255 : 0;
  }
  texture.copyImageData({ data, width: GENE_LOOKUP_TEXTURE_WIDTH, height: rows, x: 0, y: 0 } as any);
}
