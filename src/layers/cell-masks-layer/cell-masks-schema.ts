export const CellMasksSchema = {
  nested: {
    UmapEntry: {
      fields: {
        umapY: {
          type: 'double',
          id: 1
        },
        umapX: {
          type: 'double',
          id: 2
        }
      }
    },
    SingleMask: {
      fields: {
        vertices: {
          rule: 'repeated',
          type: 'double',
          id: 1
        },
        color: {
          rule: 'repeated',
          type: 'uint32',
          id: 2,
          options: {
            packed: 'true'
          }
        },
        area: {
          type: 'string',
          id: 3
        },
        totalCounts: {
          type: 'string',
          id: 4
        },
        totalGenes: {
          type: 'string',
          id: 5
        },
        cellId: {
          type: 'string',
          id: 6
        },
        clusterId: {
          type: 'string',
          id: 7
        },
        proteins: {
          rule: 'map',
          keyType: 'string',
          type: 'double',
          id: 8
        },
        umapValues: {
          type: 'UmapEntry',
          id: 9
        }
      }
    },
    ColormapEntry: {
      fields: {
        clusterId: {
          type: 'string',
          id: 1
        },
        color: {
          rule: 'repeated',
          type: 'uint32',
          id: 2,
          options: {
            packed: 'true'
          }
        }
      }
    },
    CellMasks: {
      fields: {
        cellMasks: {
          rule: 'repeated',
          type: 'SingleMask',
          id: 1
        },
        colormap: {
          rule: 'repeated',
          type: 'ColormapEntry',
          id: 2
        },
        numberOfCells: {
          type: 'uint32',
          id: 3
        }
      }
    }
  }
};
