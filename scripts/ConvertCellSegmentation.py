import pandas
import os
import CellMasksSchema_pb2 as CellMasksSchema
import logging
from tqdm import tqdm

'''
------------------------------------------------------------------
PKL file structure
  'xs': [[y[0] for y in x] for x in polygons],
  'ys': [[y[1] for y in x] for x in polygons],
  'colors': [random_color() for _ in range(len(cell_ids))],
  'cell_id': cell_ids,
  'area': areas,
  'centroid_x': centroid_x,
  'centroid_y': centroid_y,
  'total_tx': total_counts,
  'total_genes': total_genes
------------------------------------------------------------------
'''

logger = logging.getLogger(__name__)
logging.basicConfig(
  format='[%(levelname)s][%(asctime)s] %(message)s',
  datefmt='%m/%d/%Y %I:%M:%S',
  level=logging.INFO
)

def ConvertHexToRGB(hexCode: str) -> list[int]:
  stripedHex = hexCode.lstrip('#')
  return list(int(stripedHex[i:i+2], 16) for i in (0, 2, 4))

def SaveCellSegmentation(data, outputDirPath: str, outputFileName: str):
  if not os.path.isdir(outputDirPath):
    raise Exception('Givent output directory is invalid')
  
  outputCellSegmentation = CellMasksSchema.CellMasks()
  
  for index in tqdm(range(len(data['cell_id']))):
    try:
      cellPolygonPoints = [coord for pair in zip(data['ys'][index], data['xs'][index]) for coord in pair]
      cellPolygonColor = data['colors'][index]
      cellId = data['cell_id'][index]
      cellTotalCounts = data['total_tx'][index]
      cellTotalGenes = data['total_genes'][index]
      cellArea = data['area'][index]
    except Exception as e:
      logger.error(e)
      
    outputMaskData = outputCellSegmentation.cellMasks.add()
    outputMaskData.vertices.extend(cellPolygonPoints + cellPolygonPoints[:2])
    outputMaskData.color.extend(ConvertHexToRGB(cellPolygonColor))
    outputMaskData.cellId = str(cellId)
    outputMaskData.area = str(cellArea)
    outputMaskData.totalCounts = str(cellTotalCounts)
    outputMaskData.totalGenes = str(cellTotalGenes)
      
  with open(os.path.join(outputDirPath, f"{outputFileName}.bin"), 'wb') as file:
    file.write(outputCellSegmentation.SerializeToString())
  
  

def main():
  # Input path to the input PKL file will cell segmentation data.
  PKL_FILE_PATH = ""
  # Path to output directory where the transcribed file will be saved.
  # DEFAULT: The script run directory.
  OUTPUT_PATH = "./"
  # Name of the output file.
  # DEFAULT: The name of the input file.
  OUTPUT_NAME = None

  logger.info("Parsing input file data...")
  pkl_data = pandas.read_pickle(PKL_FILE_PATH)
  
  logger.info("Converting data to protobuff format...")
  if not OUTPUT_NAME or len(OUTPUT_NAME.strip()) == 0:
    OUTPUT_NAME = os.path.basename(PKL_FILE_PATH).split(".", 1)[0]
    
  SaveCellSegmentation(pkl_data, OUTPUT_PATH, OUTPUT_NAME)
  
  logger.info("Script ended succesfully")
  return

if __name__ == '__main__':
  os.system('clear')
  main()
  exit(0)