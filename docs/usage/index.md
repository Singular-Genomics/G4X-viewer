# G4X Viewer Usage

---

This page describes how to visualize and interact with the core outputs of a G4X run using the G4X Viewer. It assumes that you have access to the viewer either through a local installation or via the hosted application at [g4x-viewer.singulargenomics.com](https://g4x-viewer.singulargenomics.com).

To begin exploring your data, first load your sample into the viewer. Each G4X sample output contains a `/g4x-viewer/` directory, which is described in detail in the [G4X Viewer output documentation](https://docs.singulargenomics.com/g4x_data/output_files/g4x_viewer/).

The files contained within this directory vary slightly between transcript-only and multiomics experiments, but all supported output formats are compatible with the G4X Viewer.

Each file contributes a specific interactive layer to the visualization, enabling simultaneous exploration of transcripts, cell segmentations, protein images, and fH&E imagery. The sections below provide detailed guidance for loading data, configuring display settings, and using the available analysis and filtering tools.

## [source files](./source_files.md)

Learn how to load G4X data into the viewer and manage layer visibility using the available layer controls.

## [on-screen controls](./on_screen_controls.md)

Learn how to use the viewer's on-screen tools, including ROI selection, screenshot capture, polygon management, and other interactive controls.

## [protein](./protein.md)

Learn how to customize protein visualizations, including channel selection, color assignment, display ranges, channel isolation, and related settings.

## [fH&E](./fhe.md)

Learn how to load, display, and adjust the fH&E image layer.

## [transcript](./transcript.md)

Learn how to customize transcript visualization, including transcript display density, color settings, filtering options, and transcript-specific controls.

## [segmentation](./segmentation.md)

Learn how to customize cell segmentation displays, adjust mask appearance, and apply cell-level filtering based on clustering, protein expression, transcript abundance, and other analysis outputs.

## [UMAP filter](./umap.md)

Learn how to use the UMAP filtering tool to select and visualize cell populations based on their position within the UMAP embedding.

## [flow cytometry filter](./flow_cytometry.md)

Learn how to use the flow cytometry filtering tool to identify and visualize cell populations based on protein expression distributions.

--8<-- "_core/_partials/end_cap.md"
