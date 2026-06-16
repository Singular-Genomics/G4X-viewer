# on-screen controls
---

<br>

This section focuses on the buttons and UI elements which are present on the display window. Many of these are described in more detail in the [dashboard](../dashboard.md) section.

## reference image


![G4X Viewer](../images/on_screen_controls.png)

<br>

## features

- <b><u>Screenshot Tool:</u></b>

      Capture screenshots directly from the viewer and save them to your local device.

      Screenshots include the current viewing area while excluding viewer interface elements such as side panels, menus, and buttons.

- <b><u>Import/Export Polygons:</u></b>

      Import or export ROI polygons and their associated metadata.

      Exported files can include:

      - Polygon vertices
      - ROI metadata
      - ROI contents

      Supported export formats include **JSON** and **CSV**. Exported vertex coordinates can be reused later by importing the saved file back into the viewer.

- <b><u>Draw Polygon (ROI Selection):</u></b>

      Create custom regions of interest (ROIs) for analysis and export.

      To draw an ROI:

      1. Click **Draw Polygon**.
      2. Left-click within the image to place the first vertex.
      3. Continue left-clicking to add additional vertices and refine the polygon shape.
      4. Double-click the starting vertex to close and finalize the ROI.

      There is no limit to the number of ROIs that can be created.

      Once completed, the ROI is automatically analyzed for the cells, transcripts, and protein information contained within its boundaries. ROIs can be edited, imported, exported, and used for downstream analysis.

!!! tip "Multi-tissue Blocks (TMA-like Samples)"

    ROI selection is particularly useful for samples containing multiple independent tissue regions, such as tissue microarrays (TMAs).

    Individual tissue punches can be outlined separately, allowing independent export of transcripts and cell IDs for downstream analysis.

<br>
--8<-- "_core/_partials/end_cap.md"