# flow cytometry filter
---

<br>
This section focuses on uploading your data and toggling which layers you want visible at any given time.

## reference image


![G4X Viewer](../images/flow_controls.png)

<br>

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