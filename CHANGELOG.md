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
- General UI improvements and polish, including tooltips, layout, and wording
