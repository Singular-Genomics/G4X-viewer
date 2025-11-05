export const SegmentationFileSchema = {
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
          type: 'uint32',
          id: 1,
          options: {
            packed: 'true'
          }
        },
        area: {
          type: 'uint32',
          id: 2
        },
        totalCounts: {
          type: 'uint32',
          id: 3
        },
        totalGenes: {
          type: 'uint32',
          id: 4
        },
        cellId: {
          type: 'string',
          id: 5
        },
        clusterId: {
          type: 'string',
          id: 6
        },
        proteinValues: {
          rule: 'repeated',
          type: 'uint32',
          id: 7
        },
        nonzeroGeneIndices: {
          rule: 'repeated',
          type: 'uint32',
          id: 8
        },
        nonzeroGeneValues: {
          rule: 'repeated',
          type: 'uint32',
          id: 9
        },
        umapValues: {
          type: 'UmapEntry',
          id: 10
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
    Metadata: {
      fields: {
        proteinNames: {
          rule: 'repeated',
          type: 'string',
          id: 1
        },
        geneNames: {
          rule: 'repeated',
          type: 'string',
          id: 2
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
        metadata: {
          type: 'Metadata',
          id: 3
        },
        numberOfCells: {
          type: 'uint32',
          id: 4
        }
      }
    }
  }
};
