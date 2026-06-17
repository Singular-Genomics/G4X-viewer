# UMAP filter

---

<br>

This section describes how to use the UMAP filtering tool to select and visualize cell populations based on their position within the UMAP embedding.

## reference image

![G4X Viewer](../images/umap_controls.png)

<br>

The UMAP filter is displayed as a resizable pop-up window with its own set of interactive controls. Selected cell populations can be applied directly to the main viewer, allowing you to focus on specific regions of the UMAP embedding.

## features

- <b><u>Plotting Controls:</u></b>

      These controls determine how the UMAP embedding is displayed within the pop-up window.

      - **Point Size:** Manually adjust the size of displayed points by entering a floating-point value between **1** and **10**.
      - **Subsampling:** Reduces the number of displayed points by the specified scale factor. Valid values range from **2** to **20**, with a default value of **2**.

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
      - **Double-click** a cluster to display only that cluster while hiding all others.

- <b><u>Select ROI:</u></b>

      After selecting the **Box Select** tool, navigate to the desired area of the plot and draw a box around the cells you would like to filter.

      The selection box remains visible until a new selection is made or the filter is cleared. The X- and Y-axis boundaries of the selected region are displayed at the bottom of the plot.

- <b><u>Apply/Clear Filter:</u></b>

      Once you are satisfied with your ROI selection, click **APPLY** to display the selected cells in the main G4X Viewer window.

      The filter remains active until you reopen the UMAP Filter tool and click **CLEAR**. UMAP filtering behaves like any other segmentation filter and can be combined with other viewer filtering features.

<br>

--8<-- "_core/_partials/end_cap.md"