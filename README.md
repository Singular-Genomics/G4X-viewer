# <img src="src/assets/img/lightLogo.svg" alt="G4X Viewer Logo" style="margin-right: 10px;" height="50"> G4X Viewer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/Singular-Genomics/G4X-viewer)](https://github.com/Singular-Genomics/G4X-viewer/issues)
[![GitHub forks](https://img.shields.io/github/forks/Singular-Genomics/G4X-viewer)](https://github.com/Singular-Genomics/G4X-viewer/network)
[![GitHub stars](https://img.shields.io/github/stars/Singular-Genomics/G4X-viewer)](https://github.com/Singular-Genomics/G4X-viewer/stargazers)

## Table of Contents

- [About](#about)
- [Technologies](#technologies)
- [Demo](#demo)
- [Application Views](#application-views)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [Development Documentation](./docs/DEVELOPMENT.md)
- [License](#license)
- [Contact](#contact)
- [Acknowledgments](#acknowledgments)

## About

G4x Viewer is an advanced open source project designed to visualize imaging data using modern web technologies. The project is continuously evolving to provide an intuitive and flexible interface for the analysis and presentation of complex datasets. Inspired by the [Viv](https://github.com/hms-dbmi/viv) library, our goal is to push the boundaries of interactive data visualization in web applications.

## Technologies

G4x Viewer is built using:

- **[React](https://reactjs.org/)** – A library for building user interfaces
- **[Material-UI (MUI)](https://mui.com/)** – A collection of ready-to-use UI components
- **[DeckGL](https://deck.gl/)** – A framework for large-scale data visualization
- **[Viv](https://github.com/hms-dbmi/viv)** – A tool for visualizing image data
- **[Plotly.js](https://plotly.com/javascript/)** – A powerful charting library for interactive data visualization
- **[Zustand](https://github.com/pmndrs/zustand)** – A lightweight state management solution

For a complete list of dependencies, please refer to the `package.json` file.

## Demo

Below is a preview of the application:

![Application Preview](./public/demo-screenshot.png)

## Application Views

G4X Viewer provides two main views for comprehensive data analysis:

- **Viewer** – An interactive image viewer for spatial analysis of imaging data. Visualize multiple layers and channels, draw regions of interest (ROIs), and explore your data in detail with advanced visualization tools powered by DeckGL and Viv.

- **Dashboard** – A dedicated analytics view featuring interactive charts and graphs built with Plotly.js. Analyze data from defined ROIs through various visualization types including box plots, pie charts, bar charts, and heatmaps. The flexible grid layout allows you to arrange and customize charts according to your analytical needs.

## Getting Started

### Prerequisites

- **Node.js** (version 20.19 or higher)
- **npm**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Singular-Genomics/G4X-viewer.git
   ```
2. **Navigate to the project directory:**
   ```bash
   cd G4X-viewer
   ```
3. **Install the dependencies:**
   ```bash
   npm install
   ```
4. **Start the application:**
   ```bash
   npm run dev
   ```
   The application will launch on your local server. **Note:** The default Vite development server runs on [http://localhost:5173](http://localhost:5173). If this port is already in use, Vite will automatically select an available port and display it in the console.

## Contributing

We welcome contributions to enhance G4x Viewer!

**How to Contribute:**

- **Reporting Issues:** Use the [Issues](https://github.com/Singular-Genomics/G4X-viewer/issues) section to report bugs or propose new features.
- **Pull Requests:** Fork the repository, create a new branch for your changes, and submit a pull request with a detailed description of your modifications.

## License

G4x Viewer is licensed under the [MIT License](LICENSE). Please review the license for more details.

## Contact

For questions, support, or collaboration inquiries, please contact [care@singulargenomics.com](mailto:care@singulargenomics.com).

## Acknowledgments

Special thanks to:

- The creators of [Viv](https://github.com/hms-dbmi/viv) and other influential open source projects.
- The open source community for their ongoing support and contributions.
