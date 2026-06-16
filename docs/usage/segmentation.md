# segmentation layer
---

<br>
This first section focuses on uploading your data and toggling which layers you want visible at any given time.

## reference image


![G4X Viewer](../images/segmentation_controls.png)

<br>

## features

- <b><u>Cell Fill Toggle/Opacity:</u></b>

      Controls the display of cell segmentation fills.

      - **Cell Fill Toggle:** Enables or disables the filled segmentation masks. When disabled, only cell outlines are displayed.
      - **Opacity Slider:** Adjusts the transparency of cell fills when enabled. A value of **0** is fully transparent, while **100** is fully opaque.

- <b><u>Segmentation Filter Toggles:</u></b>

      Enable or disable cell-level filtering applied within the viewer.

      Supported filters include:

      - Cluster ID filtering
      - UMAP filtering
      - Flow cytometry filtering

      When any filter is active, the **Show Discarded** option becomes available. This displays filtered cells as white segmentation masks, allowing you to visualize cells that have been excluded from the current filter selection.

- <b><u>Import/Export Segmentation Settings:</u></b>

      Import or export segmentation visualization settings and colormap configurations.

      - **Import:** Click the button and select a previously saved JSON configuration file.
      - **Export:** Configure the segmentation settings as desired, then click **Export** and choose a save location and filename.

- <b><u>Segmentation Filter Controls:</u></b>

      Filter cells by cluster assignment using either the searchable list or by manually browsing the available clusters.

      - Use the search bar to quickly locate specific clusters.
      - Clusters labeled **-1** were not assigned to a cluster, typically due to filtering or quality-control processes.
      - Select or deselect clusters using the checkbox next to each cluster ID.
      - Click **APPLY** or enable the filter toggle to display only the selected clusters.
      - Click **CLEAR** to remove all cluster selections and reset the filter.
      - Enable **Show Active Filters Only** to display only the currently selected clusters and hide all others.

- <b><u>Open UMAP Filter Panel:</u></b>

      Opens the UMAP filtering interface for selecting cell populations based on their UMAP embedding.

      See [UMAP Cell Filtering](umap.md) for additional details.

- <b><u>Open Flow Cytometry Filter Panel:</u></b>

      Opens the flow cytometry filtering interface for selecting cell populations based on protein expression distributions.

      See [Flow Cytometry Cell Filtering](flow_cytometry.md) for additional details.


<br>

--8<-- "_core/_partials/end_cap.md"