# Project: Asambleas en el CPC - Informational Website

## 1. Project Overview

This project is a single-page informational website for attendees of the "Asambleas en el Centro Provincial de Convenciones (CPC)". It is designed to be a comprehensive guide, providing information on logistics, venue layout, and event-specific details.

The site is structured as a vertical-scrolling page with distinct, themed sections for different topics (Transportation, Auditoriums, Food, etc.). Its most prominent feature is a highly detailed and interactive floor plan of the convention center.

The project is built with standard web technologies (HTML, CSS, JavaScript) and leverages the Bootstrap 5 framework for layout and components. It has no server-side backend and is intended to be hosted as a static site (e.g., on GitHub Pages).

## 2. Technologies & Libraries

- **HTML5**: Main structure of the website.
- **CSS3**: Custom styling and theming.
- **JavaScript (ES6+)**: Handles all interactivity.
- **Bootstrap 5.3.3**: Core CSS/JS framework for layout, components (modals, accordions), and grid system.
- **Leaflet.js 1.9.4**: A JavaScript library for creating interactive maps. It is used as the engine for the floor plan viewer.
- **bs5-lightbox 1.8.3**: A Bootstrap 5 compatible lightbox library for the image gallery.
- **Google Fonts**: Used for the "Cabin" font family.
- **Material Symbols/Icons**: Used for all icons throughout the site.
- **Google Sheets**: Used as a simple, external database for dynamic data like parking garage lists and bus routes.

## 3. File Structure & Key Components

This is a static site with a flat file structure. The key files are:

- **`index.html`**: The single entry point for the entire application. It contains the HTML structure for all sections and modals.
- **`styles.css`**: The main stylesheet. It contains all custom styling, including a sophisticated theming system.
- **`script.js`**: Handles all general page interactivity.
- **`plano.js`**: Contains all the JavaScript logic specifically for the interactive floor plan feature.
- **`plano.svg`**: A detailed SVG vector graphic of the convention center's two floors. This file is critical for the floor plan feature.
- **`plano-config.json`**: The configuration and data file for `plano.js`. It defines map layers, floor details, and the content for all interactive pop-ups on the floor plan.
- **`hack.js`**: A special utility file containing a single function. **This file should not be modified.**

---

## 4. Core Features & Logic

### 4.1. Section Theming System (`styles.css`)

The website uses a dynamic theming system based on the currently visible section.

- Each `<section>` has a `.snap-section` class and a unique class like `.section-transporte`.
- In `styles.css`, each section-specific class defines a set of CSS variables (`--section-theme-color`, `--section-theme-bg-color`, etc.).
- Generic component styles (like `.btn-theme` and `.accordion-button`) use these variables.
- When a section scrolls into view, its theme colors are automatically applied to the components within it. This is managed by an `IntersectionObserver` in `script.js`.

### 4.2. Interactive Floor Plan (`plano.js` + `plano.svg` + `plano-config.json`)

This is the most complex feature of the site. It is a self-contained module that runs in a fullscreen modal.

- **How it Works**:
    1.  **`plano.js`** uses **Leaflet.js** to create a pannable and zoomable map canvas.
    2.  It fetches and overlays the **`plano.svg`** file onto the Leaflet map.
    3.  It fetches **`plano-config.json`** to get all settings, layer definitions, floor details, and the text/HTML content for every interactive point.
    4.  The SVG file (`plano.svg`) has its elements organized into groups (`<g>`) with specific IDs that correspond to the layers and floors defined in the config file.
- **Controlling the Map**:
    - The global function `plano(floor, layer, elementId)` is the primary way to interact with the map from `index.html`.
    - **`floor`**: `0` for Ground Floor, `1` for Upper Floor.
    - **`layer`**: A string key from the `layers` object in `plano-config.json` (e.g., 'departamentos', 'evacuacion').
    - **`elementId`**: The base ID of an element to highlight (e.g., 'AuditorioPrincipal'). The script will find the corresponding icon (`icoAuditorioPrincipalPA`) and highlight (`hlAuditorioPrincipalPA`) elements in the SVG.
- **Modifying the Map**:
    - **To add a new interactive point**:
        1.  Add a new icon element (e.g., `<g id="icoNewPointPB">...`) to the correct layer group in **`plano.svg`**.
        2.  Optionally, add a highlight shape (e.g., `<g id="hlNewPointPB">...`).
        3.  Add a new entry in the `informacion` object in **`plano-config.json`** with the key "NewPoint" (the base ID). This entry should contain the `title` and `content` for the pop-up.
    - **To change pop-up content**: Edit the corresponding entry in the `informacion` object in `plano-config.json`.

### 4.3. Dynamic Data from Google Sheets (`script.js`)

The site fetches live data for parking and bus routes from a public Google Sheet.

- The `fuentesDatos` object in `script.js` contains the URLs and configuration for each data source.
- The `mostrarDatos(tipo)` function is called when a user clicks a button (e.g., "Listado de cocheras").
- It fetches the data from the Google Sheet URL (which uses the `/gviz/tq` endpoint to get JSON output), processes it, and populates a table inside a modal.
- **To update this data, you only need to edit the Google Sheet itself.** No code changes are required.

### 4.4. Map Links & Sharing (`script.js`)

- The `abrirMapa(rawCoords, nombre, share)` function handles all external map links.
- If `share` is `false` (default), it attempts to open the location in the native maps app on mobile or Google Maps in a new tab on desktop.
- If `share` is `true`, it uses the Web Share API (`navigator.share`) to open a native sharing dialog. On desktop, it falls back to copying the Google Maps URL to the clipboard.

## 5. Development Guidelines & Conventions

- **Button Styling**: To create a primary button that matches the section's theme, use the classes `btn btn-primary btn-theme`. The `.btn-theme` class applies the custom, section-aware styles.
- **Do Not Modify `hack.js`**: This file is isolated for a specific purpose and should not be altered.
- **Data Management**: For simple, tabular data, prefer using the existing Google Sheets integration. For content related to the floor plan, use `plano-config.json`. For static page content, edit `index.html`.
- **Dependencies**: All main libraries (Bootstrap, Leaflet) are loaded via CDN. There is no local build process or package manager (like npm).

This documentation provides a comprehensive overview for maintaining and extending the project. By understanding the separation of concerns between the different files and the data-driven nature of the core features, future development should be straightforward.