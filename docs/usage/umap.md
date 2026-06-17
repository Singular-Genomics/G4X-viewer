# UMAP filter

---

<br>

This section describes how to use the UMAP filtering tool to select and visualize cell populations based on their position within the UMAP embedding.

## reference image

![G4X Viewer](../images/umap_controls.png)

<br>

The UMAP filter is displayed as a resizable pop-up window with its own set of interactive controls. Selected cell populations can be applied directly to the main viewer, allowing you to focus on specific regions of the UMAP embedding.

## features

- <b><u>Subsampling Factor:</u></b>

      Reduces the number of displayed points by the specified scale factor. Valid values range from **2** to **20**, with a default value of **2**.

- <b><u>Point Size:</u></b> 

      Manually adjust the size of displayed points by entering a floating-point value between **1** and **10**.

- <b><u>Plot Interactions:</u></b>

      This menu provides a variety of standard Plotly interactions. For filtering, the most important tool is **Box Select**, highlighted in the reference image. This tool is used to select a subpopulation of cells for downstream filtering. All interactions are detailed below:

      - **Screenshot:** Takes a screenshot of the displayed plot area (without the tools and other UI elements displayed).
      - **Zoom Mode:** Allow dynamic scrolling in and out to change plot zoom level.
      - **Pan View:** Changes the mode to allow panning around the image with your cursor.
      - **Box Select:** Used to select cells to filter for segmentation display
      - **Zoom In:** Zooms in at set intervals.
      - **Zoom Out:** Zooms out at set intervals.
      - **Autoscale Axes:** Autoscales axes to display all dots in the viewing area.
      - **Reset View:** Return to default view for the plot.

- <b><u>Toggle/Isolate Clusters:</u></b>

      When using the **Box Select** tool to filter cells, there are a few iteractions with the legend that may help you:

      - **Single-click** a cluster to hide or show it.
      - **Double-click** a cluster to display only that cluster while hiding all others.

- <b><u>Selected Box:</u></b>

      After selecting the **Box Select** tool, you can then use your cursor the left click and drag to create a box around the cells you wish to filter for. This display shows an example of a box you may choose to select on this UMAP embedding.

- <b><u>Box Coordinates:</u></b>

      This series of numbers describe the X and Y ranges of the box that you are applying the filter to. You can manually update these values if you desire.

- <b><u>Apply/Clear Filter:</u></b>

      Once you are satisfied with your ROI selection, click **APPLY** to display the selected cells in the main G4X Viewer window.

      The filter remains active until you reopen the UMAP Filter tool and click **CLEAR**. UMAP filtering behaves like any other segmentation filter and can be combined with other viewer filtering features.

<br>

--8<-- "_core/_partials/end_cap.md"