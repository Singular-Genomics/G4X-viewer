import * as protobuf from 'protobufjs';

export const TranscriptFileSchema = {
  nested: {
    PointData: {
      fields: {
        position: {
          rule: 'repeated',
          type: 'double',
          id: 1,
          options: {
            packed: true
          }
        },
        geneName: {
          type: 'string',
          id: 2
        },
        cellId: {
          type: 'string',
          id: 3
        }
      }
    },
    TileData: {
      fields: {
        pointsData: {
          rule: 'repeated',
          type: 'PointData',
          id: 1
        },
        numberOfPoints: {
          type: 'uint32',
          id: 2
        }
      }
    },
    ColumnData: {
      fields: {
        columnTiles: {
          rule: 'repeated',
          type: 'TileData',
          id: 1
        }
      }
    },
    LevelData: {
      fields: {
        levelColumns: {
          rule: 'repeated',
          type: 'ColumnData',
          id: 1
        }
      }
    },
    Metadata: {
      fields: {
        level: {
          rule: 'repeated',
          type: 'LevelData',
          id: 1
        }
      }
    }
  }
};

type PointData = {
  position: number[];
  geneName?: string;
  cellId?: string;
};

type TileData = {
  pointsData?: PointData[];
  numberOfPoints?: number;
};

export const validateTranscriptFileSchema = async (files: File[]): Promise<boolean> => {
  const binFiles = files.filter((f: File) => f.name.endsWith('.bin')).slice(0, 2);

  if (binFiles.length === 0) {
    return true;
  }

  try {
    const protoRoot = protobuf.Root.fromJSON(TranscriptFileSchema);
    const TileDataType = protoRoot.lookupType('TileData');

    for (const binFile of binFiles) {
      const arrayBuffer = await binFile.arrayBuffer();
      const decoded = TileDataType.decode(new Uint8Array(arrayBuffer)) as unknown as TileData;

      if (!decoded.pointsData || decoded.pointsData.length === 0) {
        continue;
      }

      const firstPoint = decoded.pointsData[0];
      const { geneName } = firstPoint;

      if (!geneName) {
        return false;
      }

      const isValidGeneName = /^[A-Za-z0-9_\-.]+$/.test(geneName);

      if (!isValidGeneName) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error validating transcript file schema:', error);
    return false;
  }
};
