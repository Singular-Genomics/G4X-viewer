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
        cellName: {
          type: "string",
          id: 3
        },
        cellId: {
          type: "string",
          id: 4
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

