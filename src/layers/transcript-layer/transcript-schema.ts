export const TranscriptSchema = {
  nested: {
    PointData: {
      fields: {
        position: {
          rule: "repeated",
          type: "double",
          id: 1,
          options: {
            packed: true,
          },
        },
        color: {
          rule: "repeated",
          type: "uint32",
          id: 2,
          options: {
            packed: true,
          },
        },
        geneName: {
          type: "string",
          id: 3,
        },
        cellId: {
          type: "string",
          id: 4,
        },
      },
    },
    TileData: {
      fields: {
        pointsData: {
          rule: "repeated",
          type: "PointData",
          id: 1,
        },
        numberOfPoints: {
          type: "uint32",
          id: 2,
        },
      },
    },
    ColumnData: {
      fields: {
        columnTiles: {
          rule: "repeated",
          type: "TileData",
          id: 1,
        },
      },
    },
    LevelData: {
      fields: {
        levelColumns: {
          rule: "repeated",
          type: "ColumnData",
          id: 1,
        },
      },
    },
    Metadata: {
      fields: {
        level: {
          rule: "repeated",
          type: "LevelData",
          id: 1,
        },
      },
    },
  },
};
