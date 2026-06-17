# segmentation layer

---

<br>

This section describes the controls available for visualizing and filtering cell segmentation data within the G4X Viewer.

## reference image

![G4X Viewer](../images/segmentation_controls.png)

<br>

## features

- <b><u>Segmentation Source:</u></b>

      This drop down menu will allow you to select which segmentation you wish to display the data for on the viewer. Currently, we provide only our nuclear expansion segmentation by default, but by using the [g4x-helpers](https://docs.singulargenomics.com/G4X-helpers/) toolkit, you can apply a new segmentation to the data that will appear in this drop down.

- <b><u>Cluster Source:</u></b>

      This drop down menu will allow you to select which clustering annotation you wish to display the data for on the viewer. Currently, we provide only our base leiden clustering by default, but by using the [g4x-helpers](https://docs.singulargenomics.com/G4X-helpers/) toolkit, you can upload a new cluster annotation layer to the data that will appear in this drop down.

- <b><u>Cell Fill Opacity:</u></b>

      Adjusts the transparency of cell fills when enabled. A value of **0** is fully transparent, while **100** is fully opaque.

- <b><u>Cell Boundary Toggle:</u></b>

      Toggles the display of cell boundaries (displayed as fully opaque lines) on the image. This toggle will trigger a warning that for larger data sets, this function can cause a crash due to being resource intensive.

- <b><u>Boundary Line Weight:</u></b>

      Toggles the display of cell boundaries (displayed as fully opaque lines) on the image. This toggle will trigger a warning that for larger data sets, this function can cause a crash due to being resource intensive.

- <b><u>Enable Cluster Filter:</u></b>

      Toggles the on and off the filter specified in the **Cluster Filter Settings** section.

- <b><u>Display Filtered Cells:</u></b>

      Toggles the on and off display of the cells that were specified by the various filters listed below. Filtered cells display as gray polygons in the cell mask layer. The **Display Filtered Cells** option is only interactable when a filter is actively applied to the image.

- <b><u>Import/Export Colormap:</u></b>

      Import or export segmentation visualization settings and colormap configurations.

      - **Import:** Click the button and select a previously saved JSON configuration file.
      - **Export:** Configure the segmentation settings as desired, then click **Export** and choose a save location and filename.

- <b><u>Cluster Filter Settings:</u></b>

      These features are all used to specify a specific filter state for cell mask overlays. They rely on the the clustering information as well as expression of protein or RNA species of interest. Clusters labeled **-1** were not assigned to a cluster, typically due to filtering or quality-control processes in our on-board analysis.

      - **Search Clusters:** This search bar can be used to look through the clusters, based on the input cluster names. Manually updating cluster names will allow naming using cell types, etc.
      - **Toggle All:** Toggles selection of all clusters on/off.
      - **Toggle Cluster:** Toggles selection for a single cluster.
      - **Show Selected:** Hide all non-selected clusters.
      - **Change Channel Color:** Change the color selection for a given cluster.
      - **Clusters Change Page:** If there are too many clusters to display at once, this will change the page displayed.
      - **Apply Filter:** Applies the current filter to the displayed image.
      - **Clear Filter:** Clears the current filter from the displayed image.

- <b><u>UMAP Filter:</u></b>

      Opens the UMAP filtering interface, allowing you to select cell populations based on their position within the UMAP embedding.

      See [UMAP filter](umap.md) for additional details.

- <b><u>Flow Cytometry Filter:</u></b>

      Opens the flow cytometry filtering interface, allowing you to select cell populations based on protein expression distributions.

      See [flow cytometry filter](flow_cytometry.md) for additional details.

<br>

--8<-- "_core/_partials/end_cap.md"