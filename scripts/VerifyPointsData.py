# ======================== ALGORITHM DESCRIPTION ==============================

# The following are the steps required to efficiently verify the correctnes of
# the ConvertCSVData.py script results

# 1. [X] Define the algorithm requirements including:
#   - [X] (Required) Input path to the original CSV file.
#   - [X] (Required) Input path to the directory with the converted binary files

# 2. [X] Load in the CSV data to Pandas Data Frame object.

# 3. [X] Load all the points data from protobuff binary files.

# 4. Iterate through all the loaded points from the converted binary files:
# -[] Find the matching point in the original CSV Data Frame object
# -[] If point exists, remove it from the data frame
# -[] If point does not exist add it to an array of INVALID POINTS

# 5. Check if any points remained in the original CSV Data Frame object
# -[] If any points remained, add them to array ood MISSING POINTS
# -[] If none points remained, continue

# 6. Print the statisticks. If required, dump results into a readable format file
# like JSON

# ================================ END =========================================
import pandas
import os
import pathlib
import logging
import MetadataSchema_pb2 as MetadataSchema
import json

from google.protobuf.json_format import MessageToDict
from tqdm import tqdm

logger = logging.getLogger(__name__)
logging.basicConfig(
  format='[%(levelname)s][%(asctime)s] %(message)s',
  datefmt='%m/%d/%Y %I:%M:%S',
  level=logging.INFO
)

def LoadPointsData(dir_path: str):
  if not os.path.isdir(dir_path):
    logger.error(f"Given path is not a directory: {dir_path}")
    exit(3)
    
  max_zoom_level = 0
  for item in os.listdir(dir_path):
    if not os.path.isdir(os.path.join(dir_path, item)):
      continue

    try:
      if int(item) > max_zoom_level:
        max_zoom_level = int(item)
    except:
      continue
  
  max_zoom_subdir = f"{dir_path}/{max_zoom_level}/"
  points_data = []
  
  for (root, _, files) in os.walk(max_zoom_subdir, topdown=True):
    if len(files) == 0:
      continue
      
    for file in files:
      if pathlib.Path(file).suffix != ".bin":
        continue
      
      single_tile_data = MetadataSchema.TileData()
      
      full_file_path = os.path.join(root, file)
      try:
        with open(full_file_path, mode="rb") as fd:
          single_tile_data.ParseFromString(fd.read())
        
        for point in single_tile_data.pointsData:
          points_data.append({
            "xPixelCoordinate": point.position[1],
            "yPixelCoordinate": point.position[0],
            "geneName": point.geneName,
            "cellId": int(point.cellId)
          })
          
      except Exception as error:
        logger.error(f"Failed to parse file {file}.\n {error}")
    
  logger.info(f"Successfully loaded {len(points_data)} points")
    
  return pandas.DataFrame(points_data)

def CompareDataSets(csv_data: pandas.DataFrame, points_data: pandas.DataFrame):
  merged_df = pandas.merge(
    csv_data, 
    points_data, 
    how='outer',
    left_on=['x_pixel_coordinate', 'y_pixel_coordinate', 'gene_name', 'cell_id'],
    right_on=['xPixelCoordinate', 'yPixelCoordinate', 'geneName', 'cellId'],
    indicator=True)
  
  # Filter rows that are only in the left DataFrame (original DataFrame)
  missing_in_right = merged_df[merged_df['_merge'] == 'left_only'].copy()

  # Filter rows that are only in the right DataFrame (array DataFrame)
  missing_in_left = merged_df[merged_df['_merge'] == 'right_only'].copy()

  # Drop the indicator column and reset the index for both DataFrames
  missing_in_right.drop(columns=['_merge', 'xPixelCoordinate', 'yPixelCoordinate', 'geneName', 'cellId'], inplace=True)
  missing_in_right.reset_index(drop=True, inplace=True)
  missing_in_left.drop(columns=['_merge', 'x_pixel_coordinate', 'y_pixel_coordinate', 'gene_name', 'cell_id'], inplace=True)
  missing_in_left.reset_index(drop=True, inplace=True)
  
  if not (missing_in_right.empty or missing_in_left.empty):
    number_of_errors = min(len(missing_in_left.index), len(missing_in_right.index))
    number_of_missing = len(missing_in_left.index) - len(missing_in_right.index)
    
    logger.warning(f"Discrepancies in data have been found.") 
    logger.warning(f"Number of invalid points: {number_of_errors}") 
    logger.warning(f"Number of missing points: {number_of_missing}")
  else:
    logger.info("No discrepancies have been found")
    
  return

def main() -> None:
  # ----------- REQUIRED ------------
  
  # Input path to the CSV file containing original transcript data from which data set wa created
  INPUT_CSV_FILE_PATH = ""
  # Input path to the directory with binary files created from the input CSV transcript.
  INPUT_POINT_DATA_DIR_PATH = ""
  
  if not INPUT_CSV_FILE_PATH:
    logger.error("No input CSV file has been specified")
    exit(1)
  
  logger.info("Loading data from CSV file....")
  if not INPUT_POINT_DATA_DIR_PATH:
    logger.error("No input point data directo")
  
  csv_data = pandas.read_csv(INPUT_CSV_FILE_PATH, compression='infer', index_col=0)
  if csv_data.empty:
    logger.error("Failed to load data from the CSV file")
    exit(2)
    
  logger.info("CSV Data Loaded sccessfully")
  
  logger.info("Loading points data binary files")
  points_data = LoadPointsData(INPUT_POINT_DATA_DIR_PATH)
  
  logger.info("Comparing data frames")
  CompareDataSets(csv_data, points_data)
  
  return

if __name__ == '__main__':
  main()
  exit(0)