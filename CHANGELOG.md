# Changelog

All notable changes to this project are documented in this file.

## [4.0.0] - 2026-10-13

### Breaking Changes

- Viewer now requires data to be in the new Zarr format - old data will need to be converted using G4X Helpers

### New Features

- Added settings sharing via a full URL or a copyable settings string, covering all sidebar settings and camera position
- Added local folder loading of Zarr datasets directly from your machine
- Added support for pasting a Zarr URL directly into the file name field
- Added a changelog modal that shows what is new when a new version is first opened
- Added mobile view with mobile layer controls
- Added multi-segmentation support
- Added dropdown channel groups
- Added single channel mode and expanded/contracted switches to channel settings
- Added option to visualize segmentation mask strokes
- Added layer toggle checkboxes to section headers
- Added a warning when ROI drawing hides the overview minimap
- Added the option to cancel an in-progress ROI drawing with a right click
- Overview now uses the H&E image when the brightfield layer is enabled
- Transcripts and cells are now loaded on demand for faster initial load
- Cell detection in ROIs now uses cell centroids instead of full polygon containment
- Channel settings import/export now uses a flat JSON format with validation and includes solo mode, with backwards compatibility for existing files
- Unified ROI export with a Notes column, Polygon renamed to ROI, and descriptive labels
- Unified the color picker into a consistent implementation across the app
- Added full Viewer documentation covering dashboard and core viewer functionality

### Improvements & Fixes

- Fixed crashes when loading large cell datasets and optimized cell filtering
- Fixed ROI detection for Zarr transcripts
- Fixed the exported total ROI count for transcripts and cells
- Improved Zarr URL validation and error messages
- Faster transcript loading by skipping tile attribute requests that always failed
- Matched UMAP legend order to the cell table and optimized the cytometry worker
- Sample info panel items are now ordered as defined in the Zarr metadata
- Genes are now sorted by gene order from transcript attributes
- Gene name filter toggle is now enabled automatically when applying transcript point filters
- Limited the default channel count on load
- Allowed transcript point size below 1
- Inverted the transcript slider direction
- Nuclear channel is now always listed first in the channel dropdown
- ROIs are now re-detected when enabling layers
- Channel controls are locked while loading, preventing a stuck lock during rapid channel switching
- Fixed the source input keeping a stale value when switching between cloud and local loading
- Improved dashboard ROI error messaging with a docs link and empty states
- Improved summary report loading and error handling
- Fixed handling of symlinked images in local Zarr datasets
- Disabled browser caching for Zarr requests
- Fixed social links
- General UI improvements and polish, including tooltips, layout, and wording
