export const CellMasksSchema = {
  nested: {
    SingleMask: {
      fields: {
        vertices: {
          rule: "repeated",
          type: "double",
          id: 1
        },
        color: {
          rule: "repeated",
          type: "uint32",
          id: 2,
          options: {
            packed: "true"
          }
        },
        area: {
          type: "string",
          id: 3
        },
        totalCounts: {
          type: "string",
          id: 4
        }, 
        totalGenes: {
          type: "string",
          id: 5
        },
        cellId: {
          type: "string",
          id: 6
        }
      }
    },
    ColormapEntry: {
      fields: {
        cellName: {
          type: "string",
          id: 1
        },
        color: {
          rule: "repeated",
          type: "uint32",
          id: 2,
          options: {
            packed: "true"
          }
        }
      }
    },
    CellMasks: {
      fields: {
        cellMasks: {
          rule: "repeated",
          type: "SingleMask",
          id: 1
        },
        colormap: {
          rule: "repeated",
          type: "ColormapEntry",
          id: 2
        },
        numberOfCells: {
          type: "uint32",
          id: 3
        }
      }
    }
  }
}

