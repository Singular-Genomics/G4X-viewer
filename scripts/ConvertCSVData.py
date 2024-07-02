# ======================== ALGORITHM DESCRIPTION ==============================

# The following are the steps required to parse a trasncript csv file and converted it in to a desired data structure 
# used by the G4X Viewer fo rendering a metada layer on cell images.

# 1.[X] Define the algorithm requirements including the
#   - [X] (Required) Input path to the CSV file containing data.
#   - [X] (Required) Output directory path and name.
#   - [X] (Optional) Path to colormap CSV file.
#   - [X] (Optional) Number of levels.
#   - [X] (Optional) Size of the image (X,Y resolution) <- If not provided can be derived from data points maximum values. 
#   - [X] (Optional) Desired minimum tiles size (lowest level of zoom).

# 2. [X] Load in the CSV data to a Pandas Data Frame object.

# 3. [X] Load colormap data from the CSV data

# 4.[X] Calcualte all derevitave requirements for the process icluding:
#   - [X] (If not loaded from CSV) Generate a colormap based on the gene name filed.
#   - [X] (If not specified by user) Calculate image/transcript resolution.
#   - [X] Number of tiles for X and Y axis.
#   - [X] Number all levels to minimize.

# 5. [X] Save config.json file with transcript layer configuration.

# 6. [X] Initialize an empty dictionary for all expeceted tiles.

# 7. [X] Iterate through each point an calculate it's target tile index base on its position and tile size and appened it to matchng field in the dictionary.
#       (This process should be mutiprocessed for better efficiency)
#       Data fields include: [x_pixel_coordinate] | [y_pixel_coordinate] | [gene_name] | [cell_id]

# 8. [X] Save the generated data to the output directory in a hierarchical structure.

# 9. [X] Generated pyramidal data structure by generating a subset of data points from each of the four compoenent subtiles.
#       At each level save the data to its layer level specific output subdirectory (in the same structure and naming convention as at stap 5)

# ================================ END =========================================

import pandas
import click
import os
import math
import logging
import numpy
import random
import json
import numpy as np
import MetadataSchema_pb2 as MetadataSchema
from tqdm import tqdm

logger = logging.getLogger(__name__)
logging.basicConfig(
  format='[%(levelname)s][%(asctime)s] %(message)s',
  datefmt='%m/%d/%Y %I:%M:%S',
  level=logging.INFO
)

class NumpyEncoder(json.JSONEncoder):
    """ Custom encoder for numpy data types """
    def default(self, obj):
        if isinstance(obj, (np.int_, np.intc, np.intp, np.int8,
                            np.int16, np.int32, np.int64, np.uint8,
                            np.uint16, np.uint32, np.uint64)):

            return int(obj)

        elif isinstance(obj, (np.float_, np.float16, np.float32, np.float64)):
            return float(obj)

        elif isinstance(obj, (np.complex_, np.complex64, np.complex128)):
            return {'real': obj.real, 'imag': obj.imag}

        elif isinstance(obj, (np.ndarray,)):
            return obj.tolist()

        elif isinstance(obj, (np.bool_)):
            return bool(obj)

        elif isinstance(obj, (np.void)): 
            return None

        return json.JSONEncoder.default(self, obj)


def ReadColorMapFromCSV(colormap_csv_data: str) -> dict[str, list[int]] | None:
  csv_colormap_data = pandas.read_csv(colormap_csv_data, compression="infer")
  if not csv_colormap_data.empty:
    logger.info("CSV Colormap data laoded successfully")
  else:
    logger.warning("Failed to load CSV colormap data")
    return None

  color_map = {}
  for _, row in csv_colormap_data.iterrows():
    gene_name, color_hex = row["gene"], row["color"]
    color_rgb = tuple(int(color_hex.lstrip("#")[i:i+2], 16) for i in (0, 2, 4))
    color_map.update({gene_name: color_rgb})
    
  return color_map


def GenerateColorMap(csv_data: pandas.DataFrame) -> dict[str, list[int]]:
  color_map = {}
  for gene_name in csv_data["gene_name"].unique():
    color_map.update({ gene_name: numpy.random.choice(range(255), size=3).tolist()})

  logger.info(f"Generated a custom color map of {len(color_map)} colors.")
  return color_map


def GetPyramidTilesConfigData(image_resolution: tuple[int, int], tile_size: int) -> tuple[int, int]:
  num_tiles_x = math.ceil(image_resolution[0] / tile_size)
  num_tiles_y = math.ceil(image_resolution[1] / tile_size)
  
  if not num_tiles_x % 2 == 0:
    num_tiles_x += 1
    
  if not num_tiles_y % 2 == 0:
    num_tiles_y += 1

  return num_tiles_x, num_tiles_y


def GetPyramidLevelsConfigData(image_resolution: tuple[int, int], tile_size: int, min_tiles_number: int = 16) -> int:
  min_num_levels = 0
  
  current_level = 1
  while min_num_levels == 0:
    level_tile_size = tile_size * pow(2, current_level)
    level_tiles_x = math.ceil(image_resolution[0] / level_tile_size)
    level_tiles_y = math.ceil(image_resolution[1] / level_tile_size)
    if not level_tiles_x % 2 == 0:
      level_tiles_x += 1
    if not level_tiles_y % 2 == 0:
      level_tiles_y += 1
    if level_tiles_x * level_tiles_y <= min_tiles_number:
      min_num_levels = current_level
      break
    current_level += 1
    
  return min_num_levels


def GenerateInitialTiles(number_of_tiles_x: int, number_of_tiles_y: int, tile_size: int, levels: int, csv_data: pandas.DataFrame, colorMap: dict):
  
  # Initialize empty data structure
  tile_x_data = {}
  for tile_x_index in range(number_of_tiles_x):
    tile_y_data = {}
    for tile_y_index in range(number_of_tiles_y):
      tile_y_data.update({tile_y_index: {
        "points": []
      }})
    
    tile_x_data.update({tile_x_index: tile_y_data})
  
  # Categorize
  points_omitted = {
    "count": 0,
    "points": [],
  } 
  
  # for _, row in tqdm(csv_data.iterrows()):
  for row_index in tqdm(range(len(csv_data.index))):
    row = csv_data.loc[row_index]
    x, y = row['x_pixel_coordinate'], row['y_pixel_coordinate']
    tile_x_coord = int( x / tile_size)
    tile_y_coord = int( y / tile_size)
    
    try:
      current_parsed_point = {
        "position": [row['y_pixel_coordinate'], row['x_pixel_coordinate']],
        "color": colorMap[row['gene_name']],
        "gene_name": row['gene_name'],
        "cell_id": row['cell_id'],
      }
      
      tile_x_data[tile_x_coord][tile_y_coord]['points'].append(current_parsed_point)
    except:
      points_omitted['count'] += 1
      points_omitted['points'].append([row['cell_id'], x, y, tile_x_coord, tile_y_coord])
      continue
    
  if not points_omitted == 0:
    logging.warning(f"{len(points_omitted)} points have been omitted")
    with open('omittedPoints.json', 'w') as json_file:
        json.dump(points_omitted, json_file, indent=4, cls=NumpyEncoder)
  else:
    logging.info(f"Successfully parse all points")
    
  return {levels: tile_x_data}


def GeneratePyramidData(parsed_csv_data: dict, levels, image_resolution, tile_size):
  for level_index in reversed(range(levels)):
    current_tile_size = tile_size * pow(2, (levels - level_index))
    x_num_of_tiles = math.ceil(image_resolution[0] / current_tile_size)
    y_num_of_tiles = math.ceil(image_resolution[1] / current_tile_size)
    
    logger.info(f"""
      --- Generating data for pyramid level: {level_index}
      --- Current tile size: {current_tile_size}
      --- Number of tiles: X-{x_num_of_tiles} | Y-{y_num_of_tiles}
    """)
    
    if not x_num_of_tiles % 2 == 0:
      x_num_of_tiles += 1
    if not y_num_of_tiles % 2 == 0:
      y_num_of_tiles += 1

    tile_x_data = {}
    for tile_x_index in tqdm(range(x_num_of_tiles)):
      tile_y_data = {}
      for tile_y_index in range(y_num_of_tiles):
        try:
          sub_tile_0_points = np.array(parsed_csv_data[level_index + 1][tile_x_index * 2][tile_y_index * 2]['points'])
          sub_tile_1_points = np.array(parsed_csv_data[level_index + 1][(tile_x_index * 2) + 1][tile_y_index * 2]['points'])
          sub_tile_2_points = np.array(parsed_csv_data[level_index + 1][(tile_x_index * 2) + 1][(tile_y_index * 2) + 1]['points'])
          sub_tile_3_points = np.array(parsed_csv_data[level_index + 1][tile_x_index * 2][(tile_y_index * 2) + 1]['points'])

          sparse_points = sub_tile_0_points[np.random.choice(len(sub_tile_0_points), int(len(sub_tile_0_points) * 0.2), replace=False)].tolist() + \
                          sub_tile_1_points[np.random.choice(len(sub_tile_1_points), int(len(sub_tile_1_points) * 0.2), replace=False)].tolist() + \
                          sub_tile_2_points[np.random.choice(len(sub_tile_2_points), int(len(sub_tile_2_points) * 0.2), replace=False)].tolist() + \
                          sub_tile_3_points[np.random.choice(len(sub_tile_3_points), int(len(sub_tile_3_points) * 0.2), replace=False)].tolist()

          tile_y_data.update({
            tile_y_index: { 
              "points": sparse_points,
            }
          })
        except:
          tile_y_data.update({tile_y_index: { "points": [] }})
          continue
    
      tile_x_data.update({tile_x_index: tile_y_data})
    parsed_csv_data.update({level_index: tile_x_data})
  
  return parsed_csv_data


def SaveMultiFiles(outputMetadataValues: dict, outputDirPath: str, outputDirName: str):
  if not os.path.isdir(outputDirPath):
    return False, "Given output directory is invalid"
  
  fullOutputDirPath = os.path.join(outputDirPath, outputDirName)

  for level, level_data in outputMetadataValues.items():
    for y_coord, y_coord_data in level_data.items():
      for x_coord, x_coord_data in y_coord_data.items():
        try:
          points = x_coord_data['points']
          outputTileData = MetadataSchema.TileData()

          for point in points:
            outputPointData = outputTileData.pointsData.add()
            
            try:
              outputPointData.position.extend(point['position'])
              outputPointData.color.extend(point['color'])
              outputPointData.geneName = point['gene_name']
              outputPointData.cellId = f"{point['cell_id']}"
            except:
              continue

          tileOutputDirPath = os.path.join(fullOutputDirPath, f"{level}", f"{y_coord}")
          os.makedirs(tileOutputDirPath, exist_ok=True)
          with open(os.path.join(tileOutputDirPath, f"{x_coord}.bin"), "wb") as file:
            file.write(outputTileData.SerializeToString())

        except:
          continue


def SaveConfigurationFile(outputDirPath: str, image_resolution: tuple[int, int] , min_tile_size: int, number_of_levels: int, colorMap: dict):
  start_tile_size = min_tile_size * pow(2, number_of_levels)
  
  config_data = {
    "layer_height": image_resolution[0],
    "layer_width": image_resolution[1],
    "layers": number_of_levels,
    "tile_size": start_tile_size,
    "color_map": [{"gene_name": key, "color": value} for key, value in colorMap.items()]
  }
  
  if not os.path.exists(outputDirPath):
    os.makedirs(outputDirPath)
  
  with open(os.path.join(outputDirPath, 'config.json'), 'w') as json_file:
        json.dump(config_data, json_file)
  

def main() -> None:
  
  ## ------- REQUIRED ----------
  # Input path to the CSV containing transcrit data to be converted.
  INPUT_CSV_FILE_PATH = ""
  
  ## ------- OPTIONAL ----------
  # Path to the output directory where the transcript directroy will be created.
  # DEFAULT: Use the input file directory
  OUTPUT_DIR_PATH = ""
  # Path to csv file containing colormap data.
  # DEFAULT: If not specified, random colors will be generated for each unique gene name value.
  COLORMAP_CSV_PATH = ""
  # Size of the image that will be split in to tiles (i.e. the region for which to clasify points in the CSV file).
  # DEFAULT: If not set, size will be calculated based on the maximum X, Y coordinates in the input CSV.
  IMAGE_RESOLUTION = ()
  # Size of the tile (in pixels) that will be used at maximum zoom level.
  # DEFAULT: The defualt size will fallback to 128px.
  MIN_TILE_SIZE = 512
  # Number of pyramid levels that will be generated for the points transcription (Does not include the 0 index level).
  # DEFAULT: If not specified the script will calculated so that the lowest resoultion level contains maximum of 16 tiles.
  NUMBER_OF_LEVELS = None
  
  
  if not INPUT_CSV_FILE_PATH:
    logger.error("No input CSV file has been specified")
    exit(1)

  logger.info("Loading data from CSV file....")
  csv_data = pandas.read_csv(INPUT_CSV_FILE_PATH, compression='infer')
  if csv_data.empty:
    logger.error("Failed to load data from the CSV file")
    exit(2)
  
  logger.info("Data Loaded sccessfully")

  if IMAGE_RESOLUTION == ():
    IMAGE_RESOLUTION = (int(csv_data['x_pixel_coordinate'].max()), int(csv_data['y_pixel_coordinate'].max()))
    logger.info(f"Max image resolution calculated from metadata: X:{IMAGE_RESOLUTION[0]} Y:{IMAGE_RESOLUTION[1]}")

  custom_color_map = {}
  if not COLORMAP_CSV_PATH:
    custom_color_map = GenerateColorMap(csv_data)
  else:
    custom_color_map = ReadColorMapFromCSV(COLORMAP_CSV_PATH)
    if custom_color_map is None:
      user_confirmation = click.confirm("Do you want to proceed with randomly generated points?")
      if not user_confirmation:
        exit(3)
        
      custom_color_map = GenerateColorMap(csv_data)
  
  num_tiles_x, num_tiles_y = GetPyramidTilesConfigData(IMAGE_RESOLUTION, MIN_TILE_SIZE)
  
  if not NUMBER_OF_LEVELS:
    NUMBER_OF_LEVELS = GetPyramidLevelsConfigData(IMAGE_RESOLUTION, MIN_TILE_SIZE)
  
  min_zoom_tiles_x = math.ceil(num_tiles_x / (pow(2, NUMBER_OF_LEVELS - 1)))
  min_zoom_tiles_y = math.ceil(num_tiles_y / (pow(2, NUMBER_OF_LEVELS - 1)))
  
  logger.info(f"""
    Final configurations for parsing:
      Image resolution: {IMAGE_RESOLUTION[0]} x {IMAGE_RESOLUTION[1]}
      Number of max zoom tiles: X - {num_tiles_x} | Y - {num_tiles_y}
      Number of min zoom tiles: X - {min_zoom_tiles_x} | Y - {min_zoom_tiles_y}
      Number of levels: {NUMBER_OF_LEVELS}
  """)
  
  user_confirmation = click.confirm('Do you accept the configuration?', default=True)
  if not user_confirmation:
    exit(1)
    
  input_file_name = os.path.basename(INPUT_CSV_FILE_PATH).split('.')[0]
  SaveConfigurationFile(os.path.join(OUTPUT_DIR_PATH, input_file_name), IMAGE_RESOLUTION, MIN_TILE_SIZE, NUMBER_OF_LEVELS, custom_color_map)
  
  logger.info("Parsing and classyfing tiles...")
  parsed_points_data = GenerateInitialTiles(num_tiles_x, num_tiles_y, MIN_TILE_SIZE, NUMBER_OF_LEVELS, csv_data, custom_color_map)
  
  logger.info("Generating pyramid structure...")
  pyramid_data = GeneratePyramidData(parsed_points_data, NUMBER_OF_LEVELS, IMAGE_RESOLUTION, MIN_TILE_SIZE)
  
  logger.info("Saving data...")
  SaveMultiFiles(pyramid_data, OUTPUT_DIR_PATH, input_file_name)
  
  logger.info("Script ended successfully")
  exit(0)

if __name__ == '__main__':
  os.system("clear")
  main()