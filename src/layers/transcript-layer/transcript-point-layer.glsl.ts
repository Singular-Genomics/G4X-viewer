import type { ShaderModule } from '@luma.gl/shadertools';

const uniformBlock = /* glsl */ `\
uniform transcriptPointUniforms {
  vec4 color;
  float radiusPixels;
  float lineWidth;
  float stroked;
  float filled;
  float antialiasing;
  float maxPointSize;
  highp int lineWidthUnits;
} transcriptPoint;
`;

export type TranscriptPointModuleProps = {
  color: [number, number, number, number];
  radiusPixels: number;
  lineWidth: number;
  stroked: number;
  filled: number;
  antialiasing: number;
  maxPointSize: number;
  lineWidthUnits: number;
};

export const transcriptPointUniforms = {
  name: 'transcriptPoint',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    color: 'vec4<f32>',
    radiusPixels: 'f32',
    lineWidth: 'f32',
    stroked: 'f32',
    filled: 'f32',
    antialiasing: 'f32',
    maxPointSize: 'f32',
    lineWidthUnits: 'i32'
  }
} as const satisfies ShaderModule<TranscriptPointModuleProps>;

export const vs = /* glsl */ `\
#version 300 es
#define SHADER_NAME transcript-point-layer-vertex-shader
in vec2 pointPositions;
in vec3 pickingColors;
out vec4 vColor;
flat out float vEdgeRadius;
flat out float vOuterRadius;
flat out float vInnerUnitRadius;
void main(void) {
  geometry.worldPosition = vec3(pointPositions, 0.0);
  geometry.pickingColor = pickingColors;
  float lineWidthPixels = project_size_to_pixel(transcriptPoint.lineWidth, transcriptPoint.lineWidthUnits);
  float outer = transcriptPoint.radiusPixels + transcriptPoint.stroked * lineWidthPixels / 2.0;
  vOuterRadius = outer;
  vEdgeRadius = transcriptPoint.antialiasing > 0.5 ? outer + SMOOTH_EDGE_RADIUS : outer;
  vInnerUnitRadius = 1.0 - transcriptPoint.stroked * lineWidthPixels / outer;
  gl_Position = project_position_to_clipspace(geometry.worldPosition, vec3(0.0), vec3(0.0), geometry.position);
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  gl_PointSize = min(2.0 * vEdgeRadius * project.devicePixelRatio, transcriptPoint.maxPointSize);
  vColor = vec4(transcriptPoint.color.rgb, transcriptPoint.color.a * layer.opacity);
  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;

export const fs = /* glsl */ `\
#version 300 es
#define SHADER_NAME transcript-point-layer-fragment-shader
precision highp float;
in vec4 vColor;
flat in float vEdgeRadius;
flat in float vOuterRadius;
flat in float vInnerUnitRadius;
out vec4 fragColor;
void main(void) {
  vec2 unitPosition = gl_PointCoord * 2.0 - 1.0;
  geometry.uv = unitPosition;
  float distToCenter = length(unitPosition) * vEdgeRadius;
  float inCircle = transcriptPoint.antialiasing > 0.5 ?
    smoothedge(distToCenter, vOuterRadius) :
    step(distToCenter, vOuterRadius);
  if (inCircle == 0.0) {
    discard;
  }
  float coverage = inCircle;
  if (transcriptPoint.stroked > 0.5 && transcriptPoint.filled < 0.5) {
    float isLine = transcriptPoint.antialiasing > 0.5 ?
      smoothedge(vInnerUnitRadius * vOuterRadius, distToCenter) :
      step(vInnerUnitRadius * vOuterRadius, distToCenter);
    if (isLine == 0.0) {
      discard;
    }
    coverage *= isLine;
  }
  fragColor = vec4(vColor.rgb, vColor.a * coverage);
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
