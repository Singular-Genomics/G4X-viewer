# flow cytometry filter
---

<br>

This section describes how to use the flow cytometry filtering tool to select and visualize cell populations based on protein expression patterns.

## reference image

![G4X Viewer](../images/flow_controls.png)

<br>

## features

- <b><u>Protein Channel (X/Y):</u></b>

      Select two protein channels to compare cell-level protein intensity values.

      Protein intensity is calculated using the mean intensity across all pixels within each cell. The same protein channel cannot be selected for both axes.

- <b><u>Plot Settings:</u></b>

      You can access plot customization options by clicking the gear icon in the upper-right corner of the window. Available settings include:

      - Graph type
      - Color scale
      - Number of bins
      - Subsampling
      - Point size
      - Logarithmic scaling
      - Additional plot display options

- <b><u>Plot Interactions:</u></b>

      This menu provides a variety of standard Plotly interactions. For filtering, the most important tool is **Box Select**, highlighted in the reference image. This tool is used to select a subpopulation of cells for downstream filtering. All interactions are detailed below:

      - **Box Select:** Used to select cells to filter for segmentation display
      - **Zoom Mode:** Allow dynamic scrolling in and out to change plot zoom level.
      - **Zoom In:** Zooms in at set intervals.
      - **Zoom Out:** Zooms out at set intervals.
      - **Pan View:** Changes the mode to allow panning around the image with your cursor.
      - **Autoscale Axes:** Autoscales axes to display all dots in the viewing area.
      - **Reset View:** Return to default view for the plot.
      - **Screenshot:** Takes a screenshot of the displayed plot area (without the tools and other UI elements displayed).

- <b><u>Selected Box:</u></b>

      After selecting the **Box Select** tool, you can then use your cursor the left click and drag to create a box around the cells you wish to filter for. This display shows an example of a box you may choose to select on this flow cytometry display.

- <b><u>Box Coordinates:</u></b>

      This series of numbers describe the X and Y ranges of the box that you are applying the filter to. You can manually update these values if you desire.

- <b><u>Apply/Clear Filter:</u></b>

      Once you are satisfied with your box selection, click **APPLY** to display the selected cells in the main G4X Viewer window.

      The filter remains active until you reopen the Flow Cytometry Filter tool and click **CLEAR**. Flow cytometry filtering behaves like any other segmentation filter and can be combined with other viewer filtering features.

<br>

--8<-- "_core/_partials/end_cap.md"