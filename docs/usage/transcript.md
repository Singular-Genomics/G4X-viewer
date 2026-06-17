# transcript layer

---

<br>

This section describes the controls available for visualizing and filtering transcript data within the G4X Viewer.

## reference image

![G4X Viewer](../images/transcript_controls.png)

## features

- <b><u>Subsampling Toggle:</u></b>

      Most G4X datasets contain more than 100 million transcripts. Transcript sub-sampling reduces rendering load and helps maintain viewer responsiveness on standard desktop computers. By default, the G4X Viewer automatically adjusts transcript density as you zoom and pan throughout the image for responsive exploration of your data. This toggle allows your to enable manual adjustment of the displayed transcript percentage.

- <b><u>% Transcripts Displayed:</u></b>
      
      Adjusts the percentage of displayed transcripts from **0.16%** to **100%**. When manual control is enabled, a warning is displayed indicating that rendering large numbers of transcripts may cause browser instability or crashes.

      We recommend keeping the display percentage below **20%** unless transcript display has already been restricted to a subset of transcript species.

- <b><u>Tx Spot Size:</u></b>

      Adjusts the size of transcript markers displayed in the viewer. Point size can be modified by entering a value directly into the text field or by using the slider control. Changes are applied to all displayed transcripts.

- <b><u>Enable Tx Filter:</u></b>

      Toggles the on and off the filter specified in the **Transcript Filter Settings** section.

- <b><u>Display Filtered Tx:</u></b>

      Toggles the on and off display of the transcript species that were specified by the various filters listed below. Filtered transcripts display as gray polygons in the cell mask layer. The **Display Filtered Tx** option is only interactable when a filter is actively applied to the image.

- <b><u>Import/Export Colormap:</u></b>

      Import or export segmentation visualization settings and colormap configurations.

      - **Import:** Click the button and select a previously saved JSON configuration file.
      - **Export:** Configure the segmentation settings as desired, then click **Export** and choose a save location and filename.

- <b><u>Transcript Filter Settings:</u></b>

      These features are all used to specify a specific filter state for transcript overlays. All transcripts are displayed regardless of whether or not they are assigned to a cell.

      - **Search Genes:** This search bar can be used to look through the gene species identified in your data.
      - **Toggle All:** Toggles selection of all genes on/off.
      - **Toggle Gene:** Toggles selection for a single gene.
      - **Change Gene Color:** Change the color selection for a given gene.
      - **Show Selected:** Hide all non-selected clusters.
      - **Clusters Change Page:** If there are too many clusters to display at once, this will change the page displayed.
      - **Apply Filter:** Applies the current filter to the displayed image.
      - **Clear Filter:** Clears the current filter from the displayed image.

<br>

--8<-- "_core/_partials/end_cap.md"