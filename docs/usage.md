<br>

# Usage
---

This page will detail how to view the core output images from a G4X run on the viewer. This page assumes that you have access to the viewer either through local download or our hosted URL.

Once you have opened the viewer, you will see that the G4X viewer has two mode to interact with your data: multi-file upload and single file upload. Only the multi-file upload is supported with default outputs from the G4X, and utilizes the files located in the `/g4x-viewer/` directory, described in detail in [data output](https://docs.singulargenomics.com/g4x_data/g4x_output/) portion of our docuemntation. The specific output files differ slightly based on whether your data is from a transcript-only run or a multiomics run.

Each file in the viewer adds a specific, interactable layer of information for you to explore. To begin, you must load in a [protein image file](./usage.md#protein-images), named `<sample_id>.ome.tiff`. Loading in images in the viewer is simple. You can either drag files from your file navigation window into the right-hand pane for the corresponding file type or you can click in the associated region labeled "Upload image file" to browse local files for upload.

![G4X Viewer](./images/viewer_instance.png)

!!! tip
    The viewer works best when you are trying to interact with files saved locally. A remote host will often have much higher latency and may fail to load your images in a reasonable amount of time.



<br>

## protein images
---

In order to begin interacting with the viewer, a protein image file in the .OME.TIFF format must be loaded into the viewer instance. The protein image file acts as the base upon which all subsequent layers are displayed. Protein image files can be dropped into the panel on the right side of your viewer window, in the region labeled "Image File Name." The viewer will allow you to upload either the `<sample_id>.ome.tiff` or the `<sample_id>_he.ome.tiff` to get started, though we recommended using the `<sample_id>.ome.tiff` file which contains the full set of protein images for a given run.

Uploading this file enables interaction with the [View Settings], [Protein Channel Settings], and the [Brightfield Image Settings].

<br>

## transcript file
---


<br>

## cell segmentation
---


<br>

## fH&E stain
---

<br>

## sample metadata
---

The sample metadata is a the file called `<sample_id>_run_metadata.json` that contains a variety of metadata for your experiment, including .

This file is not necessary to upload in order to utilize the other features of the viewer, but can be useful for identifying things like the .

--8<-- "_core/_partials/end_cap.md"