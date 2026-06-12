# G4X-Viewer usage
---

This page will detail how to view the core output images from a G4X run on the viewer. This page assumes that you have access to the viewer either through local download or our hosted [URL](https://g4x-viewer.singulargenomics.com).

Once you have opened the viewer, either locally or online, you will need to upload your data to begin interacting with it. Each sample output by the G4X contains a directory called `/g4x-viewer/`, described in detail in [data output](https://docs.singulargenomics.com/g4x_data/output_files/g4x_viewer/) portion of our documentation. The specific output files differ slightly based on whether your data is from a transcript-only run or a multiomics run, but they are all compatible with the G4X Viewer.

Each file in the viewer adds a specific, interactable layer of information for you to explore, allowing simultaneous visualization of RNA, segmentation, protein images, and our fH&E. Below, we'll go into a detailed explanation below of how to utilize the G4X-Viewer fully to explore your data.

## reference image
---

![G4X Viewer](./images/viewer_aggregate_image.png)

## source files and layer controls {: .viewer-section .viewer-red }


## protein layer settings {: .viewer-section .viewer-blue }


## fH&E layer settings {: .viewer-section .viewer-teal }

<div class="viewer-card viewer-teal">

This section explains the functions to manipulate and change the fH&ampE layer visualizations. Our fH&ampE is created from nuclear and cytoplasmic fluorescent stains and colored to match a traditional H&ampE visually.

<ol class="viewer-feature-list">
  <li><strong>fH&E Layer Opacity</strong>
  The layer opacity slider allows you to change the alpha/opacity value of the fH&ampE layer.
  <br></li>

  <li><strong>fH&E Upload and Toggle</strong>
  To load in your fH&ampE image, click the "ADD FH&ampE IMAGE" button or choose cloud upload and select a source file. Once a file is loaded in, you toggle the fH&ampE image by clicking the circle that appears in the top left of the box. Lastly, to remove the current fH&ampE image, click the "x" on the right side of the same interaction pane. 
  <br></li>
</ol>

</div>

## transcript layer settings {: .viewer-section .viewer-orange }


## segmentation layer settings {: .viewer-section .viewer-green }

<div class="viewer-card viewer-green">

This section explains the functions to manipulate and change the segmentation layer visualizations. The segmentation masks displayed are approximations of the pixel-level segmentation performed by Cellpose, and are displayed as a set of vertices. As such, they will differ slightly from the true segmentation masks used for analysis.

<ol class="viewer-feature-list">
  <li><strong>Cell Fill Toggle/Opacity</strong>
  Using the toggle, you can turn on the fill on the cell masks (on by default). If turned off, only outlines are present. When enabled, the slider enables control of opacity, where 0 means transparent and 100 means opaque.
  <br></li>

  <li><strong>Segmentation Filter Toggles</strong>
  These "Enable Filter" toggles enable you to turn on and off any cell-level filtering that you might choose to do, including cluster ID(s), UMAP, and flow cytometry filtering. When a filter is applied, you gain access to the "Show Discarded" toggle, which enables you to add back all data that was filtered as white cells, i.e. dissociated from their assigned clusters.
  <br></li>

  <li><strong>Import/Export Segmentation Settings</strong>
  This setting allows the import and export of all settings pertaining to your segmentation colormaps. To import, click the button and navigate to the JSON file you've saved on your PC. To export, set up with the parameters/settings that you like, then click export, choosing a save location and name on your PC.
  <br></li>

  <li><strong>Segmentation Filter Controls</strong>
  Filtering of cells can be done either by scrolling through the ordered list or by using the search bar. Cells labeled as -1 were not assigned a cluster, often due to filtering. To add or remove a cell cluster from your filter list, click the left-hand check box. Checked clusters will display when the "APPLY" button is clicked or the "Enable Filter" toggle is turned on. Clearing the filter can be done with the "CLEAR" button. Clicking "Show active filters only" will display only selected clusters, hiding all non-selected ones. 
  <br></li>

  <li><strong>Open UMAP Filter Panel</strong>
  See <a href="./usage/#umap-cell-filtering">UMAP cell filtering</a> for more details.
  <br></li>
  <li><strong>Open Flow Cytometry Filter Panel</strong>
  See <a href="./usage/#flow-cytometry-cell-filtering">Flow cytometry cell filtering</a> for more details.
  <br>
  </li>
</ol>

</div>

## UMAP cell filtering {: .viewer-section .viewer-purple }

<div class="viewer-card viewer-purple">

This section explains how to use the UMAP filter controls to change which cells are displayed based on a subpopulation of the UMAP embedding that you select. This will appear as a resizable pop-up window with independent interactions that can be applied back to your loaded image.

<ol class="viewer-feature-list">

  <li><strong>Plotting Controls</strong>
  These two elements control how the UMAP embedding visually appears in the pop out window. The first changes the point size by manually inputting a floating point number between 1 and 10 to scale dots by. The subsampling step will decrease the points displayed in the image by a scale factor equal to the number you input, ranging from 2 to 20 with a default of 2.
  <br></li>

  <li><strong>Plot Interactions</strong>
  This menu enables you to interact with the plot through a variety of functions including downloading the plot, zooming in/out (including on a specified area), panning across the image, selecting an ROI, and resetting axes. These are all standard plotly interactions.
  <br>
  <br>
  Of particular note for the filtering we apply is the "Box Select," highlighted in the reference image. We will use this to filter for a subpopulation of cells. In order to only select a specific population with more precision, you may also want to try clicking on the colored circles on the legend. A single click will hide/unhide the specific cluster you've chosen and double clicking will turn off all except the cluster you've chosen. 
  <br></li>

  <li><strong>Select ROI</strong>
  Once you have clicked on the "Box Select" tool, you can navigate to location in the image that you want and draw a box around the cells you would like to filter for. Once drawn, the box will stay in place until you draw another or clear the filter.  On the bottom it will also display the X/Y limits of your selected area.
  <br></li>

  <li><strong>Apply/Clear Filter</strong>
  Once you're happy with your ROI selection, you can then click "APPLY" to make your selection display on the original G4X Viewer window. This will persist until you reopen the UMAP filter tool and select "CLEAR." This filter will interact with the other features in the same way as any other segmentation filter.
  <br></li>

</ol>

</div>

## flow cytometry cell filtering {: .viewer-section .viewer-pink }

<div class="viewer-card viewer-pink">

This section explains how to use the flow cytometry filter controls to change which cells are displayed based on a subpopulation of the flow cytometry embedding that you select. This will appear as a resizable pop-up window with independent interactions that can be applied back to your loaded image.

<ol class="viewer-feature-list">
  <li><strong>Protein Channel Selection</strong>
  Here, you can choose any two proteins for which you want to compare cells-level intensity. The values used are mean intensity across all pixels in a cell. You cannot select the same protein quantification for both axes.
  <br></li>
  
  <li><strong>Plot Settings</strong>
  This menu is accessible by clicking the gear icon in the top right of the pane. Here, you can change many settings related to the way the plot looks. This includes graph type, colorscale, number of bins, subsampling, point size, logarithmic scaling, and more. Lastly, you can manually change the color scaling using the sliders along the bottom of the pane so that cells above or below a certain value will not be displayed on the plot.
  <br></li>
  
  <li><strong>Plot Interaction Menu</strong>
  This menu enables you to interact with the plot through a variety of functions including downloading the plot, zooming in/out (including on a specified area), panning across the image, selecting an ROI, and resetting axes. These are all standard plotly interactions.
  <br>
  <br>
  Of particular note for the filtering we apply is the "Box Select," highlighted in the reference image. We will use this to filter for a subpopulation of cells.
  <br></li>

  <li><strong>Select ROI</strong>
  Once you have clicked on the "Box Select" tool, you can navigate to location in the image that you want and draw a box around the cells you would like to filter for. Once drawn, the box will stay in place until you draw another or clear the filter.  On the bottom it will also display the X/Y limits of your selected area.
  <br></li>

  <li><strong>Apply/Clear Filter</strong>
  Once you're happy with your ROI selection, you can then click "APPLY" to make your selection display on the original G4X Viewer window. This will persist until you reopen the UMAP filter tool and select "CLEAR." This filter will interact with the other features in the same way as any other segmentation filter.
  <br></li>

</ol>

</div>

## on-screen features {: .viewer-section .viewer-gray }

<div class="viewer-card viewer-gray">

These features are 

<ol class="viewer-feature-list">
  <li><strong>Screenshot Tool</strong>
  This tool allows you to take screenshots directly from the viewer and save them to your local device. Screenshots display the current viewing area with all interaction elements removed (includes side panels, buttons). 
  <br></li>
  
  <li><strong>Import/Export Polygons</strong>
  These buttons allow you to take drawn ROIs and import or export their contents, vertices, and metadata as JSON/CSV files. If you draw ROIs that you like, then click export to download a CSV containing the vertex information
  Of particular note for the filtering we apply is the "Box Select," highlighted in the reference image. We will use this to filter for a subpopulation of cells.
  <br></li>

  <li><strong>Draw Polygon (ROI Selection)</strong>
  This tool enables ROI selection. There is no limit to the number of ROIs that can be drawn. Once the Draw Polygon button has been selected, an expanded menu will appear. To draw an ROI, left click the image area to place a vertex. Each subsequent left click will refine the polygon shape and extent by adding a vertex. The polygon finalizes when you double click the start vertex. Upon closure of the shape, your polygon will be analyzed for cells, transcripts, and protein information stored within it. ROIs can be edited, imported, exported, and used for analysis. More details on these processes can be found below and on the <a href="./dashboard.md">dashboard</a> page. 
  <br></li>

</ol>

</div>
!!! tip "Multi-tissue blocks (like-TMA)"
  
    The ROI selection feature is particularly useful for samples with multiple independent tissue punches (like TMAs) because it can allow independent export of the transcripts and cell IDS for each individual tissue punch for downstream analysis.

--8<-- "_core/_partials/end_cap.md"