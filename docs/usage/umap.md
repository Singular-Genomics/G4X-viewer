# UMAP filter
---

<br>
This section focuses on uploading your data and toggling which layers you want visible at any given time.

## reference image


![G4X Viewer](../images/umap_controls.png)

<br>

This section explains how to use the UMAP filter controls to change which cells are displayed based on a subpopulation of the UMAP embedding that you select. This will appear as a resizable pop-up window with independent interactions that can be applied back to your loaded image.

## features

- <b><u>Plotting Controls:</u></b>

      These controls determine how the UMAP embedding is displayed in the pop-out window.

      - **Point Size** allows you to manually enter a floating-point value between **1 and 10** to scale the displayed points.
      - **Subsampling** reduces the number of displayed points by the specified scale factor. Valid values range from **2 to 20**, with a default value of **2**.

- <b><u>Plot Interactions:</u></b>

      This menu provides a variety of standard Plotly interactions, including:

      - Downloading the plot
      - Zooming in and out
      - Zooming to a selected area
      - Panning across the plot
      - Selecting a region of interest (ROI)
      - Resetting the plot axes

      For filtering, the most important tool is **Box Select**, highlighted in the reference image. This tool is used to select a subpopulation of cells.

      To make selections more precise, you can also interact with the plot legend:

      - **Single-click** a cluster to hide or show it.
      - **Double-click** a cluster to display only that cluster and hide all others.

- <b><u>Select ROI:</u></b>

      After selecting the **Box Select** tool, navigate to the desired area of the plot and draw a box around the cells you would like to filter.

      The selection box will remain visible until a new selection is made or the filter is cleared. The X- and Y-axis boundaries of the selected region are displayed at the bottom of the plot.

- <b><u>Apply/Clear Filter:</u></b>

      Once you are satisfied with your ROI selection, click **APPLY** to display the selected cells in the main G4X Viewer window.

      The filter remains active until you reopen the UMAP Filter tool and click **CLEAR**. This filter behaves like any other segmentation filter and can be combined with other viewer filtering features.

<br>

--8<-- "_core/_partials/end_cap.md"