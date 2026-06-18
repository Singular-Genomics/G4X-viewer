# protein layer
---

<br>

This section describes the controls available for visualizing and customizing protein image displays within the G4X Viewer.

## reference image

![G4X Viewer](../images/protein_controls.png)

<br>

## features

- <b><u>Color Palette:</u></b>

      Select the color palette used to display protein images. Available palettes are based on standard Plotly color schemes.


- <b><u>Lens Toggle:</u></b>

      Enables the protein lens visualization tool. When activated, a selection panel appears, allowing you to choose a protein channel to focus on with the **Lens** tool. The selected channel is displayed in color within the lens area (the lens tracks your cursor position), while all other active protein channels are displayed in grayscale.

- <b><u>Import/Export Protein Settings:</u></b>

      Import or export protein visualization settings.

      - **Import:** Click the button and select a previously saved JSON configuration file.
      - **Export:** Configure the segmentation settings as desired, then click **Export** and choose a save location and filename.

!!! tip "Find and save your preferred settings"
      We recommend configuring your preferred protein display settings once, then exporting and reusing the saved configuration for future samples to save time!

- <b><u>Protein Display Settings:</u></b>

      This section includes several configurable options that allow you to customize how protein data is displayed and interpreted.

      - **Select Target:** Enables or disables the selected protein channel.
      - **Toggle Visibility:** Enables or disables the selected protein channel.
      - **Cursor Intensity:** Displays the intensity value at the current cursor location for the specific protein channel. Values for all active channels are displayed simultaneously.
      - **Isolate Channel:** Displays only the selected protein channel while hiding all others.
      - **Channel Min/Max:** Adjust the display intensity range by entering values manually or using the slider control.
      - **Add Channel:** Adds an additional protein channel. A maximum of six protein channels are allowed simultaneously.
      - **Delete Channel:** Deletes the specific protein channel.
      - **Change Channel Color:** Allows selection of the channel color from a pre-set list of color options for the specific channel. Repeat color selections are allowed.
      - **Expand Range:** Expands the default protein intensity range slider to allow broader **Channel Min/Max** values to be set for the specific channel.
      - **Reset Default Range:** Resets **Channel Min/Max** values to default values for the specific channel.

<br>

--8<-- "_core/_partials/end_cap.md"