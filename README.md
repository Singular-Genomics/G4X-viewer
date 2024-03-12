# G4x Viewer - Proof of concpet 

This repository is a proof concept for the G4X Viewer application based on the 
[Avivator](https://avivator.gehlenborglab.org/)  viewer created using the [Viv](https://github.com/hms-dbmi/viv) JavaScript library.

## Setup
1. After opening the project directory run:
	```bash
    npm install --legacy-peer-deps
	```
2. Run the application:
    ```bash
    npm run dev
    ```
> The application will automatically load an example image delivered by the Viv library

## Preparing custom data
1. Download the `bftools` CLI tools from [OME Website](https://www.openmicroscopy.org/bio-formats/downloads/).

2. Run the following commnad:
    ```
    ./bfconvert -tilex 512 -tiley 512 -pyramid-resolutions 4 -pyramid-scale 2 <input_file_path>.tiff <output_file_path>.ome.tiff
    ```

    The main neccessary option include

    - `-tilex` TILE_X `-tiley` TILE_Y 

        The TILE_X, TILE_Y values determine the maximum width and height of each tile. Although all images larger than 4096x4096px will be saved as a set of tiles, the default automatically calculated tile size may excced Java heap memory. 

    - `-pyramid-resolutions` RESOLUTIONS `-pyramid-scale` SCALE

        The RESOLUTIONS value is used to determine the number subresolution levels that will be calculated fo the image using the SCALE value (e.g. with the values RESOLUTIONS = 4 and SCALE = 2 the output file will contain 4 reoslution layers, each concurent layer scaled down by a factor of 2).

> [!IMPORTANT] 
> Remember to always specify the output format to be of `.ome.tiff` file as the `bfconvert` tool requires to specify the output file format in the given output path. 

> [!TIP]
> More on `bfconvert` tool options can be found [here](https://docs.openmicroscopy.org/bio-formats/6.0.1/users/comlinetools/conversion.html)

3. Load in the converted OME.Tiff file into G4X Viewer using the `Choose file` button in the controller sidebar menu