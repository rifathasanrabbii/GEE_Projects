# GEE_Projects
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/rifathasanrabbii/GEE_Projects)

This repository contains a collection of Google Earth Engine (GEE) scripts for various geospatial analyses, primarily focusing on environmental and land-use monitoring in Bangladesh.

## How to Use

Each folder contains a self-contained GEE script. To run an analysis:
1.  Navigate to the script file on GitHub.
2.  Copy the entire code.
3.  Paste the code into the [Google Earth Engine Code Editor](https://code.earthengine.google.com/).
4.  Click "Run" to execute the script and view the results.

---

## Projects

### 1. Land Transformation Timelapse: Dhaka (1990-2025)

This script generates a timelapse video visualizing urban growth and land-use changes in Dhaka, Bangladesh, from 1990 to 2025. It creates a compelling animation of the city's expansion over 35 years.

-   **Data:** Landsat 4, 5, 7, 8, & 9 Surface Reflectance collections.
-   **Methodology:**
    -   Harmonizes spectral bands across different Landsat sensors for a consistent time-series.
    -   Creates cloud-free annual median composites using dry season imagery.
    -   Uses a SWIR1-NIR-Red band combination (`['MIR', 'PIR', 'RED']`) to effectively highlight urban areas and vegetation.
    -   Overlays the corresponding year on each frame of the animation.
-   **Output:** An animated timelapse preview in the GEE console and code to export a high-resolution video to Google Drive.
-   **Script:** [`Land Transformation/land_transformation.js`](Land%20Transformation/land_transformation.js)

### 2. Coastal Soil Salinity Mapping

This script produces a high-impact map visualizing soil salinity intensity for the coastal districts of Barguna and Patuakhali. The analysis focuses on the 2024 dry season when salt accumulation is most prominent.

-   **Data:** Copernicus Sentinel-2 SR Harmonized.
-   **Methodology:**
    -   Calculates a Salinity Index (SI) using the formula `sqrt(Blue * Red)`.
    -   Applies cloud, cirrus, and water masks (using NDWI) to isolate terrestrial soil surfaces.
    -   Generates a median composite for the 2024 dry season (January-May).
    -   Includes a comprehensive UI with a title, a legend for salinity intensity (Low, Moderate, High), and a time-series chart showing salinity trends from 2021-2024.
-   **Output:** An interactive map with professional UI elements and a multi-year trend chart.
-   **Script:** [`Salinity Mapping/salinity_mapping.js`](Salinity%20Mapping/salinity_mapping.js)

### 3. Land Use Change Detection: Barishal Division

This analysis identifies and maps changes in land use and land cover (LULC) within the Barishal Division of Bangladesh by comparing the years 2015 and 2025.

-   **Data:** Google Dynamic World V1.
-   **Methodology:**
    -   Generates LULC composites for 2015 and 2025 by calculating the `mode` (most frequent classification) of the Dynamic World collection.
    -   Performs a pixel-by-pixel comparison of the two annual maps to create a binary change map highlighting areas where the LULC class has changed.
    -   Adds an interactive map legend for the nine Dynamic World classes.
-   **Output:** Three map layers: LULC for 2015, LULC for 2025, and a binary map showing areas of change.
-   **Script:** [`Land Use Change Detection/land_use_change.js`](Land%20Use%20Change%20Detection/land_use_change.js)

### 4. River Network Extraction

This utility script extracts river network data for the Barguna and Patuakhali districts from a global hydrography dataset, preparing it for use in other GIS software.

-   **Data:** HydroAtlas RiverAtlas v10.
-   **Methodology:**
    -   Filters the global dataset to the specified study area.
    -   Selects a minimal set of essential attributes (e.g., River ID, connectivity, stream order) to create a clean and lightweight featureset.
-   **Output:** Code to export the cleaned river features as a Shapefile (`.shp`) to the user's Google Drive.
-   **Script:** [`River Detection/river_detection.js`](River%20Detection/river_detection.js)