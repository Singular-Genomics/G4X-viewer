# segmentation layer

---

<br>

This section describes the controls available for visualizing and filtering cell segmentation data within the G4X Viewer.

## reference image

![segmentation layer controls](../images/segmentation_controls.png)

<br>

## features

- <b><u>Segmentation Source:</u></b>

      Selects which segmentation source is displayed in the viewer. By default, the viewer provides nuclear expansion segmentation. You can use the [g4x-helpers](https://docs.singulargenomics.com/G4X-helpers/) toolkit to apply additional segmentations that appear in this drop-down menu.

- <b><u>Cluster Source:</u></b>

      Selects which clustering annotation is displayed in the viewer. By default, the viewer provides base Leiden clustering. You can use the [g4x-helpers](https://docs.singulargenomics.com/G4X-helpers/) toolkit to upload additional cluster annotation layers that appear in this drop-down menu.

- <b><u>Cell Fill Opacity:</u></b>

      Adjusts the transparency of cell fills when enabled. A value of **0** is fully transparent, while **100** is fully opaque.

- <b><u>Cell Boundary Toggle:</u></b>

      Shows or hides cell boundaries, which are displayed as fully opaque lines. This toggle triggers a warning because displaying boundaries for large datasets can be resource intensive and may cause browser instability or crashes.

- <b><u>Boundary Line Weight:</u></b>

      Adjusts the thickness of displayed cell boundary lines.

- <b><u>Enable Cluster Filter:</u></b>

      Enables or disables the filter specified in the **Cluster Filter Settings** section.

- <b><u>Display Filtered Cells:</u></b>

      Shows or hides cells specified by the filters below. Filtered cells display as gray polygons in the cell mask layer. The **Display Filtered Cells** option is available only when a filter is actively applied to the image.

- <b><u>Import/Export Colormap:</u></b>

      Import or export segmentation visualization settings and colormap configurations.

      - **Import:** Click the button and select a previously saved JSON configuration file.
      - **Export:** Configure the segmentation settings as desired, then click **Export** and choose a save location and filename.

- <b><u>Cluster Filter Settings:</u></b>

      These features specify the filter state for cell mask overlays. They rely on clustering information and expression of protein or RNA species of interest. Clusters labeled **-1** were not assigned to a cluster, typically due to filtering or quality-control processes in onboard analysis.

      - **Search Clusters:** Search clusters based on cluster names. Manually updated cluster names can be used to label cell types or other annotations.
      - **Toggle All:** Toggles selection of all clusters on or off.
      - **Toggle Cluster:** Toggles selection for a single cluster.
      - **Show Selected:** Hides all non-selected clusters.
      - **Change Channel Color:** Changes the color selection for a given cluster.
      - **Change Page:** Changes the displayed page when there are too many clusters to display at once.
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
