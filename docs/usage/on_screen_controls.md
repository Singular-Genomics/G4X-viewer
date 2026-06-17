# on-screen controls

---

<br>

This section describes the buttons and interactive tools that are available directly within the viewer window. Additional information about many of these features can be found in the [dashboard](../dashboard/index.md) section.

## reference image

![G4X Viewer](../images/on_screen_controls.png)

<br>

## features

- <b><u>Screenshot Tool:</u></b>

      Capture screenshots directly from the viewer and save them to your local device.

      Screenshots include only the current viewing area and exclude viewer interface elements such as side panels, menus, and buttons.

- <b><u>Import/Export Polygons:</u></b>

      Import or export ROI polygons and their associated metadata.

      Exported files can include:

      - Polygon vertices
      - ROI metadata
      - ROI contents

      Supported export formats include **JSON** and **CSV**. Exported polygon coordinates can be imported later to restore previously saved ROIs.

- <b><u>Draw Polygon (ROI Selection):</u></b>

      Create custom regions of interest (ROIs) for analysis and export.

      To draw an ROI:

      1. Click **Draw Polygon**.
      2. Left-click within the image to place the first vertex.
      3. Continue left-clicking to add additional vertices and refine the polygon shape.
      4. Double-click the starting vertex to close and finalize the ROI.

      There is no limit to the number of ROIs that can be created.

      Once completed, the ROI is automatically analyzed for the cells, transcripts, and proteins contained within its boundaries. ROIs can be edited, imported, exported, and used for downstream analysis.

!!! tip "Multi-tissue Blocks (TMA-like Samples)"

    ROI selection is particularly useful for samples containing multiple independent tissue regions, such as tissue microarrays (TMAs).

    Individual tissue punches can be outlined separately, allowing independent export of transcripts and cell IDs for downstream analysis.

<br>

--8<-- "_core/_partials/end_cap.md"