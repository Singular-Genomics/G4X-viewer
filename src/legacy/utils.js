import { fromBlob, fromUrl } from 'geotiff';
import {
  loadOmeTiff,
  DEPRECATED_loadBioformatsZarr,
  loadOmeZarr,
  loadOmeZarrFromStore,
  loadMultiTiff,
  getChannelStats
} from '@hms-dbmi/viv';
import axios from 'axios';
import { HexToRgb } from '../shared/components/GxColorPicker/GxColorPicker.helpers';

export const GLOBAL_SLIDER_DIMENSION_FIELDS = /** @type {const} */ (['z', 't']);

const MAX_CHANNELS_FOR_SNACKBAR_WARNING = 40;

/**
 * Guesses whether string URL or File is for an OME-TIFF image.
 * @param {string | File} urlOrFile
 */
function isOmeTiff(urlOrFile) {
  if (Array.isArray(urlOrFile)) return false; // local Zarr is array of File Objects
  const name = typeof urlOrFile === 'string' ? urlOrFile : urlOrFile.name;
  return name.includes('ome.tiff') || name.includes('ome.tif') || name.includes('.companion.ome');
}

/**
 * Gets an array of filenames for a multi tiff input.
 * @param {string | File | File[]} urlOrFiles
 */
function getMultiTiffFilenames(urlOrFiles) {
  if (Array.isArray(urlOrFiles)) {
    return urlOrFiles.map((f) => f.name);
  } else if (urlOrFiles instanceof File) {
    return [urlOrFiles.name];
  } else {
    return urlOrFiles.split(',');
  }
}

/**
 * Guesses whether string URL or File is one or multiple standard TIFF images.
 * @param {string | File | File[]} urlOrFiles
 */
function isMultiTiff(urlOrFiles) {
  const filenames = getMultiTiffFilenames(urlOrFiles);
  for (const filename of filenames) {
    const lowerCaseName = filename.toLowerCase();
    if (!(lowerCaseName.includes('.tiff') || lowerCaseName.includes('.tif'))) return false;
  }
  return true;
}

/**
 * Turns an input string of one or many urls, file, or file array into a uniform array.
 * @param {string | File | File[]} urlOrFiles
 */
async function generateMultiTiffFileArray(urlOrFiles) {
  if (Array.isArray(urlOrFiles)) {
    return urlOrFiles;
  } else if (urlOrFiles instanceof File) {
    return [urlOrFiles];
  } else {
    return urlOrFiles.split(',');
  }
}

/**
 * Gets the basic image count for a TIFF using geotiff's getImageCount.
 * @param {string | File} src
 */
async function getTiffImageCount(src) {
  const from = typeof src === 'string' ? fromUrl : fromBlob;
  const tiff = await from(src);
  return tiff.getImageCount();
}

/**
 * Guesses whether string URL or File is one or multiple standard TIFF images.
 * @param {string | File | File[]} urlOrFiles
 */
async function generateMultiTiffSources(urlOrFiles) {
  const multiTiffFiles = await generateMultiTiffFileArray(urlOrFiles);
  const sources = [];
  let c = 0;
  for (const tiffFile of multiTiffFiles) {
    const selections = [];
    const numImages = await getTiffImageCount(tiffFile);
    for (let i = 0; i < numImages; i++) {
      selections.push({ c, z: 0, t: 0 });
      c += 1;
    }
    sources.push([selections, tiffFile]);
  }
  return sources;
}

class UnsupportedBrowserError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnsupportedBrowserError';
  }
}

async function getTotalImageCount(sources) {
  const firstOmeTiffImage = sources[0];
  const firstPixelSource = firstOmeTiffImage.data[0];
  const representativeGeoTiffImage = await firstPixelSource._indexer({
    c: 0,
    z: 0,
    t: 0
  });
  const hasSubIFDs = Boolean(representativeGeoTiffImage?.fileDirectory?.SubIFDs);

  // Non-Bioformats6 pyramids use Image tags for pyramid levels and do not have offsets
  // built in to the format for them, hence the ternary.

  if (hasSubIFDs) {
    return sources.reduce((sum, { metadata }) => {
      const { SizeC, SizeT, SizeZ } = metadata.Pixels;
      const numImagesPerResolution = SizeC * SizeT * SizeZ;
      return numImagesPerResolution + sum;
    }, 1);
  }

  const levels = firstOmeTiffImage.data.length;
  const { SizeC, SizeT, SizeZ } = firstOmeTiffImage.metadata.Pixels;
  const numImagesPerResolution = SizeC * SizeT * SizeZ;
  return numImagesPerResolution * levels;
}

/**
 * @param {unknown} e
 * @returns {e is Error & { issues: unknown }}
 */
function isZodError(e) {
  return e instanceof Error && 'issues' in e;
}

/** @param {string} url */
async function fetchSingleFileOmeTiffOffsets(url) {
  // No offsets for multifile OME-TIFFs
  if (url.includes('companion.ome')) {
    return undefined;
  }
  const offsetsUrl = url.replace(/ome\.tif(f?)/gi, 'offsets.json');
  try {
    const res = await axios.get(offsetsUrl);
    return res.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return undefined;
    }
    throw error;
  }
}

/**
 * Normalizes OME-NGFF `omero` attrs into the `Pixels.Channels` shape the app consumes.
 */
function omeroToPixels(omero) {
  const channels = omero?.channels ?? [];
  return {
    Pixels: {
      Channels: channels.map((c) => ({
        Name: c.label,
        SamplesPerPixel: 1,
        Color: c.color ? Object.values(HexToRgb(c.color)).concat(255) : undefined,
        Active: c.active ?? false,
        Window: c.window ?? undefined
      }))
    }
  };
}

/**
 * Given an image source, creates a PixelSource[] and returns XML-meta
 *
 * @param {string | File | File[]} urlOrFile
 * @param {} handleOffsetsNotFound
 * @param {*} handleLoaderError
 */
export async function createLoader(urlOrFile, handleOffsetsNotFound, handleLoaderError) {
  try {
    // Local OME-NGFF directory — either via FileSystemDirectoryHandle or pre-built store
    if (urlOrFile && urlOrFile.__localZarrStore) {
      const res = await loadOmeZarrFromStore(urlOrFile);
      return { data: res.data, metadata: omeroToPixels(res.metadata.omero) };
    }

    // OME-TIFF
    if (isOmeTiff(urlOrFile)) {
      if (urlOrFile instanceof File) {
        // TODO(2021-05-09): temporarily disable `pool` until inline worker module is fixed.
        const source = await loadOmeTiff(urlOrFile, {
          images: 'all',
          pool: false
        });
        return source;
      }

      const maybeOffsets = await fetchSingleFileOmeTiffOffsets(urlOrFile);

      // TODO(2021-05-06): temporarily disable `pool` until inline worker module is fixed.
      const source = await loadOmeTiff(urlOrFile, {
        offsets: maybeOffsets,
        images: 'all',
        pool: false
      });

      // Show a warning if the total number of channels/images exceeds a fixed amount.
      const totalImageCount = await getTotalImageCount(source);
      if (!maybeOffsets && totalImageCount > MAX_CHANNELS_FOR_SNACKBAR_WARNING) {
        handleOffsetsNotFound(true);
      }
      return source;
    }

    if (Array.isArray(urlOrFile) && typeof urlOrFile[0].arrayBuffer !== 'function') {
      throw new UnsupportedBrowserError(
        'Cannot upload a local Zarr or flat TIFF files with this browser. Try using Chrome, Firefox, or Microsoft Edge.'
      );
    }

    // Multiple flat tiffs
    if (isMultiTiff(urlOrFile)) {
      const mutiTiffSources = await generateMultiTiffSources(urlOrFile);
      const source = await loadMultiTiff(mutiTiffSources, {
        images: 'all',
        pool: false
      });
      return source;
    }

    const isOmeZarrPath =
      typeof urlOrFile === 'string' &&
      (urlOrFile.includes('/images/multiplex') || urlOrFile.includes('/images/h_and_e'));

    if (!isOmeZarrPath) {
      try {
        return await DEPRECATED_loadBioformatsZarr(urlOrFile);
      } catch (e) {
        if (isZodError(e)) {
          throw e;
        }
      }
    }

    const res = await loadOmeZarr(urlOrFile, { type: 'multiscales' });
    return { data: res.data, metadata: omeroToPixels(res.metadata.omero) };
  } catch (e) {
    if (e instanceof UnsupportedBrowserError) {
      handleLoaderError(e.message);
    } else {
      console.error(e);
      handleLoaderError(null);
    }
    return { data: null };
  }
}

// Get the last part of a url (minus query parameters) to be used
// as a display name for avivator.
export function getNameFromUrl(url) {
  return url.split('?')[0].split('/').slice(-1)[0];
}

/**
 * Return the midpoint of the global dimensions as a default selection.
 *
 * @param {{ name: string, size: number }[]} dimensions
 * @returns {{ [Key in typeof GLOBAL_SLIDER_DIMENSION_FIELDS[number]]?: number }
 */
function getDefaultGlobalSelection(dimensions) {
  const globalSelectableDimensions = dimensions.filter((d) =>
    GLOBAL_SLIDER_DIMENSION_FIELDS.includes(d.name.toLowerCase())
  );

  /** @type {{ [Key in typeof GLOBAL_SLIDER_DIMENSION_FIELDS[number]]?: number } */
  const selection = {};
  for (const dim of globalSelectableDimensions) {
    selection[dim.name] = Math.floor(dim.size / 2);
  }

  return selection;
}

function isGlobalOrXYDimension(name) {
  // normalize name to lowercase
  name = name.toLowerCase();
  return name === 'x' || name === 'y' || GLOBAL_SLIDER_DIMENSION_FIELDS.includes(name);
}

/**
 * @param {Array.<number>} shape loader shape
 */
export function isInterleaved(shape) {
  const lastDimSize = shape[shape.length - 1];
  return lastDimSize === 3 || lastDimSize === 4;
}

/**
 * @template A
 * @template B
 * @param {Array<A>} a
 * @param {Array<B>} b
 * @returns {Array<[A, B]>}
 */
function zip(a, b) {
  if (a.length !== b.length) {
    throw new Error('Array lengths must be equal');
  }
  return a.map((val, i) => [val, b[i]]);
}

// Create a default selection using the midpoint of the available global dimensions,
// and then the first four available selections from the first selectable channel.
/**
 *
 * @param {{ labels: string[], shape: number[] }} pixelSource
 */
export function buildDefaultSelection({ labels, shape }) {
  let selection = [];

  const dimensions = zip(labels, shape).map(([name, size]) => ({ name, size }));

  const globalSelection = getDefaultGlobalSelection(dimensions);

  // First non-global dimension with some sort of selectable values.
  const firstNonGlobalSelectableDimension = dimensions.find((dim) => !isGlobalOrXYDimension(dim.name));

  // If there are no additional selectable dimensions, return the global selection.
  if (!firstNonGlobalSelectableDimension) {
    return [globalSelection];
  }

  for (let i = 0; i < Math.min(4, firstNonGlobalSelectableDimension.size); i += 1) {
    selection.push({
      [firstNonGlobalSelectableDimension.name]: i,
      ...globalSelection
    });
  }

  if (isInterleaved(shape)) {
    return [{ ...selection[0], c: 0 }];
  }

  return selection;
}

export function range(length) {
  return [...Array(length).keys()];
}

export async function getSingleSelectionStats({ loader, selection }) {
  const data = Array.isArray(loader) ? loader[loader.length - 1] : loader;
  const raster = await data.getRaster({ selection });
  const selectionStats = getChannelStats(raster.data);
  const { domain, contrastLimits } = selectionStats;
  // Edge case: if the contrast limits are the same, set them to the domain.
  if (contrastLimits[0] === contrastLimits[1]) {
    contrastLimits[0] = domain[0];
    contrastLimits[1] = domain[1];
  }
  return { domain, contrastLimits };
}

export const getMultiSelectionStats = async ({ loader, selections }) => {
  const stats = await Promise.all(selections.map((selection) => getSingleSelectionStats({ loader, selection })));
  const domains = stats.map((stat) => stat.domain);
  const contrastLimits = stats.map((stat) => stat.contrastLimits);
  return { domains, contrastLimits };
};

/**
 * @param { import('../../src/loaders/omexml').OMEXML[0] } imgMeta
 */
export function guessRgb({ Pixels }) {
  const numChannels = Pixels.Channels.length;
  const { SamplesPerPixel } = Pixels.Channels[0];

  const is3Channel8Bit = numChannels === 3 && Pixels.Type === 'uint8';
  const interleavedRgb = Pixels.SizeC === 3 && numChannels === 1 && Pixels.Interleaved;

  return SamplesPerPixel === 3 || is3Channel8Bit || interleavedRgb;
}
export function truncateDecimalNumber(value, maxLength) {
  if (!value && value !== 0) return '';
  const stringValue = value.toString();
  return stringValue.length > maxLength ? stringValue.substring(0, maxLength).replace(/\.$/, '') : stringValue;
}
