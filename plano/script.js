// 1. Define map bounds
const bounds = L.latLngBounds([
    [-31.72236, -60.526135], // Southwest
    [-31.72097, -60.52445]  // Northeast
]);

// 2. Initialize Leaflet map
const map = L.map('map', {
    maxBounds: bounds,
    maxZoom: 24,
    minZoom: 19,
    rotate: true,
    zoomControl: false // Disable default zoom control
}).setView(bounds.getCenter(), 19);

// 3. Add tile layer
L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    maxZoom: 24,
    maxNativeZoom: 20
}).addTo(map);

// --- GLOBAL VARIABLES ---
let definitions, layers, floors;
let floorLayers = {};
let btnPlantaAlta, btnPlantaBaja, layerSelectorBtn, layerSelectorDropdown, svgElement, layerTitleElement, floorSubtitleElement;
let currentLayer = 'departamentos'; // Default layer

// --- STATE MANAGEMENT ---
let currentActiveFloor = 0;
let highlightedElement = null;
let activeOffcanvas = null;

// --- FUNCTIONS ---
function clearHighlight() {
    if (highlightedElement) {
        highlightedElement.classList.remove('highlight');

        // Construct the ID of the corresponding 'hl' element
        const floorSuffix = getFloorSuffix();
        const iconBaseName = highlightedElement.id.replace(new RegExp(`^${definitions.prefixes.icon}`), '').replace(definitions.suffixes.floor, '');
        const hlElementId = `${definitions.prefixes.highlight}${iconBaseName}${floorSuffix}`;
        const hlElement = svgElement.querySelector(`#${hlElementId}`);

        // Hide the 'hl' element
        if (hlElement) {
            hlElement.style.display = 'none';
        }

        highlightedElement = null;
    }
}

function hideActiveOffcanvas() {
    if (activeOffcanvas) {
        activeOffcanvas.hide();
        // The 'hidden.bs.offcanvas' event will handle cleanup.
    }
}

function centerOnElement(element) {
    if (!element) return;

    const svg = element.ownerSVGElement;
    if (!svg) return;

    const bbox = element.getBBox();
    const ctm = element.getScreenCTM();
    const mapContainer = map.getContainer();
    const mapRect = mapContainer.getBoundingClientRect();

    // Define the four corners of the bounding box
    const corners = [
        { x: bbox.x, y: bbox.y },
        { x: bbox.x + bbox.width, y: bbox.y },
        { x: bbox.x + bbox.width, y: bbox.y + bbox.height },
        { x: bbox.x, y: bbox.y + bbox.height }
    ];

    const latLngs = corners.map(corner => {
        const pt = svg.createSVGPoint();
        pt.x = corner.x;
        pt.y = corner.y;

        // Transform the corner to screen coordinates
        const screenPoint = pt.matrixTransform(ctm);

        // Convert screen coordinates to map layer coordinates
        const layerPoint = L.point(screenPoint.x - mapRect.left, screenPoint.y - mapRect.top);

        // Convert layer point to a geographical coordinate
        return map.layerPointToLatLng(layerPoint);
    });

    // Create a bounding box that contains all four transformed corners
    const elementBounds = L.latLngBounds(latLngs);

    // Calculate padding for the offcanvas
    let padding = [0, 0]; // [x, y]
    if (activeOffcanvas && activeOffcanvas._element) {
        const offcanvasRect = activeOffcanvas._element.getBoundingClientRect();
        if (activeOffcanvas._element.classList.contains('offcanvas-bottom')) {
            padding[1] = offcanvasRect.height; // Bottom padding
        } else if (activeOffcanvas._element.classList.contains('offcanvas-end')) {
            padding[0] = offcanvasRect.width; // Right padding
        }
    }

    // Fit the map to the element's bounds with padding and zoom constraints
    map.fitBounds(elementBounds, {
        paddingTopLeft: [0, 0], // No padding on top-left
        paddingBottomRight: padding, // Apply padding to bottom-right
        maxZoom: 21
    });
}


function showAndHighlightIcon(iconId, offcanvasId) {
    const target = svgElement.querySelector(`#${iconId}`);
    if (!target) return;

    const offcanvasElement = document.getElementById(offcanvasId);
    if (!offcanvasElement) return;

    // If a different offcanvas is open, hide it first.
    if (activeOffcanvas && activeOffcanvas._element.id !== offcanvasId) {
        hideActiveOffcanvas();
    }
    
    clearHighlight();
    
    const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement);
    offcanvas.show();
    
    activeOffcanvas = offcanvas;
    highlightedElement = target;
    target.classList.add('highlight');

    // Construct the ID of the corresponding 'hl' element
    const floorSuffix = getFloorSuffix();
    const iconBaseName = iconId.replace(new RegExp(`^${definitions.prefixes.icon}`), '').replace(definitions.suffixes.floor, '');
    const hlElementId = `${definitions.prefixes.highlight}${iconBaseName}${floorSuffix}`;
    const hlElement = svgElement.querySelector(`#${hlElementId}`);

    // Show the 'hl' element
    if (hlElement) {
        hlElement.style.display = 'block';
    }

    // When the offcanvas is hidden, remove the highlight
    offcanvasElement.addEventListener('hidden.bs.offcanvas', function () {
        clearHighlight();
        if (activeOffcanvas && activeOffcanvas._element.id === offcanvasId) {
            activeOffcanvas = null;
        }
    }, { once: true });
}

// Helper function to get floor suffix
function getFloorSuffix() {
    return floors[currentActiveFloor].suffix;
}

function updateMapTitle() {
    const activeLayerItem = layerSelectorDropdown.querySelector('.dropdown-item.active');
    const layerText = activeLayerItem ? activeLayerItem.textContent : 'Cargando...';
    layerTitleElement.textContent = layerText;

    const floorText = floors[currentActiveFloor].name;
    floorSubtitleElement.textContent = floorText;
}

function updateLayerVisibility(isInitial) {
    const selectedLayer = layers[currentLayer];
    const floorSuffix = getFloorSuffix();
    const targetLayerId = definitions.prefixes.layer + selectedLayer.id + floorSuffix;

    for (const key in layers) {
        for (const floorKey in floors) {
            const floor = floors[floorKey];
            const layerId = definitions.prefixes.layer + layers[key].id + floor.suffix;
            const layer = svgElement.querySelector(`#${layerId}`);
            if (layer) {
                const isTarget = layer.id === targetLayerId;
                if (!isInitial) {
                    layer.classList.add('fade-transition');
                }
                layer.style.opacity = isTarget ? 1 : 0;
                if (isTarget) {
                    layer.style.display = 'block';
                } else {
                    if (!isInitial) {
                        setTimeout(() => {
                            layer.style.display = 'none';
                        }, 500);
                    } else {
                        layer.style.display = 'none';
                    }
                }
            }
        }
    }

    if (!selectedLayer.interactive) {
        hideActiveOffcanvas();
        clearHighlight();
    }
}

function switchFloor(level, isInitial = false) {
    if (!isInitial && currentActiveFloor === level) {
        updateLayerVisibility(false);
        return;
    }
    currentActiveFloor = level;

    for (const floorLevel in floors) {
        const floorLayer = floorLayers[floorLevel];
        if (floorLayer) {
            if (!isInitial) {
                floorLayer.classList.add('fade-transition');
            }
            floorLayer.style.opacity = floorLevel <= level ? 1 : 0;
            if (floorLevel < level) {
                floorLayer.style.filter = 'blur(3px) brightness(0.85)';
            } else {
                floorLayer.style.filter = '';
            }

            if (floorLevel <= level) {
                floorLayer.style.display = 'block';
            } else {
                if (!isInitial) {
                    setTimeout(() => {
                        floorLayer.style.display = 'none';
                    }, 500);
                } else {
                    floorLayer.style.display = 'none';
                }
            }
        }
    }

    map.getPane('tilePane').classList.toggle('basemap-blurred', level > 0);

    // Update floor button active states
    const floorControls = document.getElementById('floor-controls');
    const buttons = floorControls.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.classList.toggle('active', button.dataset.level == level);
    });
    
    hideActiveOffcanvas();
    clearHighlight();
    updateLayerVisibility(isInitial);
}

function mostrarMapa(floorKey, capa, highlightId, isInitial = false) {
    currentLayer = capa;
    
    // Update active state in dropdown
    layerSelectorDropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.toggle('active', item.dataset.value === capa);
    });

    switchFloor(floorKey, isInitial);
    updateMapTitle();

    if (layers[capa].interactive && highlightId) {
        const floorSuffix = getFloorSuffix();
        const iconId = `${definitions.prefixes.icon}${highlightId}${floorSuffix}`;
        const offcanvasId = `${definitions.prefixes.offcanvas}${highlightId}`;
        
        // Use a timeout to ensure the element is visible before calculating its position
        setTimeout(() => {
            const elementToCenter = svgElement.querySelector(`#${iconId}`);
            if (elementToCenter) {
                showAndHighlightIcon(iconId, offcanvasId);
                centerOnElement(elementToCenter);
            }
        }, 100); 
    }
}

function updateOffcanvasLayout() {
    const offcanvasElements = document.querySelectorAll('.info-offcanvas');
    if (window.innerHeight > window.innerWidth) { // Portrait
        offcanvasElements.forEach(el => {
            el.classList.remove('offcanvas-end');
            el.classList.add('offcanvas-bottom');
        });
    } else { // Landscape
        offcanvasElements.forEach(el => {
            el.classList.remove('offcanvas-bottom');
            el.classList.add('offcanvas-end');
        });
    }
}

async function initializeMap() {
    try {
        const response = await fetch('map-config.json');
        const config = await response.json();
        definitions = config.definitions;
        layers = config.layers;
        floors = config.floors;

        // Convert suffix string to RegExp
        definitions.suffixes.floor = new RegExp(definitions.suffixes.floor);

        map.setBearing(config.rotation);

        const svgUrl = 'cpc.svg';
        const svgResponse = await fetch(svgUrl);
        const svgText = await svgResponse.text();

        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        svgElement = svgDoc.documentElement;

        const elementToModify = svgElement.querySelector('#layBase');
        if (elementToModify) {
            elementToModify.setAttribute('transform', `rotate(${-config.rotation},832.66,574.21)`);
        }

        L.svgOverlay(svgElement, bounds, { interactive: true }).addTo(map);

        // --- CACHING ELEMENTS ---
        for (const level in floors) {
            const floor = floors[level];
            floorLayers[level] = svgElement.querySelector(`#${floor.baseLayerId}`);
        }
        layerSelectorBtn = document.getElementById('layer-selector-btn');
        layerSelectorDropdown = document.querySelector('.dropdown-menu');
        layerTitleElement = document.getElementById('layer-title');
        floorSubtitleElement = document.getElementById('floor-subtitle');
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');

        // --- DYNAMICALLY POPULATE FLOOR BUTTONS ---
        const floorControls = document.getElementById('floor-controls');
        floorControls.innerHTML = ''; // Clear existing items
        Object.keys(floors).sort((a, b) => b - a).forEach(level => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn';
            button.dataset.level = level;
            button.textContent = level;
            floorControls.appendChild(button);

            button.addEventListener('click', () => mostrarMapa(level, currentLayer));
        });

        // --- DYNAMICALLY POPULATE LAYER SELECTOR ---
        layerSelectorDropdown.innerHTML = ''; // Clear existing items
        for (const key in layers) {
            const layer = layers[key];
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.className = 'dropdown-item';
            a.href = '#';
            a.dataset.value = key;
            a.textContent = layer.name;
            li.appendChild(a);
            layerSelectorDropdown.appendChild(li);
        }

        layerSelectorDropdown.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('dropdown-item')) {
                const newLayer = target.dataset.value;
                mostrarMapa(currentActiveFloor, newLayer);
            }
        });

        zoomInBtn.addEventListener('click', () => map.zoomIn());
        zoomOutBtn.addEventListener('click', () => map.zoomOut());

        // Click on an icon
        svgElement.addEventListener('click', function(event) {
            if (!layers[currentLayer].interactive) return;

            const target = event.target.closest(`g[id^="${definitions.prefixes.icon}"]`);
            if (!target) return;

            L.DomEvent.stopPropagation(event);

            if (highlightedElement && highlightedElement.id === target.id) {
                hideActiveOffcanvas();
                clearHighlight();
                return;
            }

            const iconBaseName = target.id.replace(new RegExp(`^${definitions.prefixes.icon}`), '').replace(definitions.suffixes.floor, '');
            const offcanvasId = `${definitions.prefixes.offcanvas}${iconBaseName}`;
            showAndHighlightIcon(target.id, offcanvasId);
            centerOnElement(target);
        });

        // Click on map to hide card
        map.on('click', function(e) {
            console.log("Clicked coordinates:", e.latlng);
            hideActiveOffcanvas();
            clearHighlight();
        });

        window.addEventListener('load', updateOffcanvasLayout);
        window.addEventListener('resize', updateOffcanvasLayout);

        // --- INITIALIZATION ---
        mostrarMapa(config.defaultView.floor, config.defaultView.layer, null, true);

    } catch (error) {
        console.error('Error initializing map:', error);
        alert('Could not initialize map. Please check the console for details.');
    }
}

initializeMap();