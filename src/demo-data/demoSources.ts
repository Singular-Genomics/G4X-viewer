const baseUrl = 'https://viv-demo.storage.googleapis.com';

const sources = [{
    path: 'Vanderbilt-Spraggins-Kidney-MxIF.ome.tif',
    description: 'OME-TIFF Kidney mxIF'
  }, {
    path: '12448_G1HR_Mesh003.ome.tif',
    description: 'OME-TIFF Covid-19 Primary Gut Epithelial Stem Cells'
  }, {
    path: 'LuCa-7color_Scan1/',
    description: 'Perkin Elmer LuCa-7color_Scan1.qptiff'
  }, {
    path: 'LuCa-7color_3x3component_data.ome.tif',
    description: 'Perkin Elmer LuCa-7color_3x3component_data.qptiff'
  }, {
    path: '2018-12-18_ASY_H2B_bud_05_3D_8_angles.ome.tif',
    description: 'idr0077'
  }, {
    path: 'brain.pyramid.ome.tif',
    description: 'idr0085'
  }, {
    path: 'idr0106.pyramid.ome.tif',
    description: 'idr0106'
  }
];

export const demoSources = sources.map(s => ({
  urlOrFile: `${baseUrl}/${s.path}`,
  description: s.description
}));
