# protein layer
---

<br>

This section describes the controls available for visualizing and customizing protein image displays within the G4X Viewer.

## reference image

![G4X Viewer](../images/protein_controls.png)

<br>

## features

- <b><u>Protein Color Palette:</u></b>

      Select the color palette used to display protein images. Available palettes are based on standard Plotly color schemes.

- <b><u>Overview Image Toggle:</u></b>

      Toggles the visibility of the overview image window in the lower-left corner of the viewer.

      The overview image provides a zoomed-out view of the entire sample and displays a red bounding box indicating the currently visible region of the viewer.

- <b><u>Lens Tool:</u></b>

      Enables the protein lens visualization tool.

      When activated, a selection panel appears, allowing you to choose a protein channel. The selected channel is displayed in color within the lens area, while all other active protein channels are shown in grayscale.

      The lens follows your cursor as you move across the sample and remains active until the tool is disabled.

- <b><u>Import/Export Protein Settings:</u></b>

      Import or export protein visualization settings.

      We recommend configuring your preferred protein display settings, exporting them, and reusing the saved configuration for future samples.

      - **Import:** Click the button and select a previously saved JSON configuration file.
      - **Export:** Configure the protein settings as desired, then click **Export** and choose a save location and filename.

- <b><u>Protein Channel Settings:</u></b>

      Protein channels include several configurable options that allow you to customize how protein data is displayed and interpreted.

      - **Channel Toggle:** Enables or disables the selected protein channel.
      - **Protein Channel:** Select the protein channel to display.
      - **Color Selection:** Click the three vertical dots next to the channel dropdown to choose a display color.
      - **Current Position Intensity:** Displays the intensity value at the current cursor location for the selected protein channel. Values for all active channels are displayed simultaneously.
      - **Set Protein Min/Max:** Adjust the display intensity range by entering values manually or using the slider control.
      - **Isolate Protein Channel:** Displays only the selected protein channel while hiding all others.
      - **Add/Remove Channel:** Click **+ Add Channel** at the bottom of the panel to add a channel. To remove a channel, click the **×** button in the upper-right corner of the channel settings panel.

<br>

--8<-- "_core/_partials/end_cap.md"