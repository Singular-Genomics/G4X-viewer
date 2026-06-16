# transcript layer
---

<br>
This first section focuses on uploading your data and toggling which layers you want visible at any given time.

## reference image


![G4X Viewer](../images/transcript_controls.png)

<br><div class="viewer-card viewer-orange">

This section explains the functions to manipulate and change the transcript layer visualizations. All transcripts are displayed independent of whether or not they have been assigned to a cell.

<ol class="viewer-feature-list">
  <li><strong>Transcript Sub-sampling Controls</strong>
  In a typical experiment, there will be >1 million transcripts obtained. Transcript sub-sampling is done to allow normal PCs to render the transcript spots in real time without crashing. By default, the G4X Viewer performs dynamic down sampling as you zoom and pan about the image. There are two controls to manually change these settings.
  <br>
  <br>
  The first is a toggle which enables you to control this feature instead of letting our software independently perform down sampling to ensure responsiveness of the software. When you turn this on, a warning will pop up, notifying you that increasing the percentage of displayed transcripts can cause your browser to crash. The second control is a stepped slider that allows you to increase the percentage of transcripts displayed from 0.16% to 100%. We don't advise turning this to greater than 20% unless you've already restricted the transcripts displayed to a subset of transcript species.
  <br></li>

  <li><strong>Edit point size</strong>
  This setting enables changing of the size of dots for each transcript. It applies to all displayed transcripts. It can be changed by typing a number into the text box or by using the slider.
  <br></li>

  <li><strong>Transcript Filter Toggles</strong>
  The "Enable Filters" toggle turns on and off the filter that you've selected in the Transcript Filter Controls section below. The "Show Discarded" filter will display all content which was filtered out, but with white dots to indicate that it was removed.
  <br></li>

  <li><strong>Import/Export Transcript Settings</strong>
  This setting allows the import and export of all settings pertaining to your transcript filters. This includes color mapping and transcript species displayed. To import, click the button and navigate to the JSON file you've saved on your PC. To export, set up with the parameters/settings that you like, then click export, choosing a save location and name on your PC.
  <br></li>

  <li><strong>Transcript Filter Controls</strong>
  Filtering of transcripts can be done either by scrolling through the alphabetized list or using the search bar. To add or remove a gene to your filter list, click the left-hand check box. Checked transcript species will display when the "APPLY" button is clicked or the "Enable Filter" toggle is turned on. Clearing the filter can be done with the "CLEAR" button. Clicking "Show active filters only" will display only selected transcript species, hiding all non-selected ones.
  <br></li>

</ol>

</div>