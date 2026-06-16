# UMAP filter
---

<br>
This section focuses on uploading your data and toggling which layers you want visible at any given time.

## reference image


![G4X Viewer](../images/umap_controls.png)

<br>

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