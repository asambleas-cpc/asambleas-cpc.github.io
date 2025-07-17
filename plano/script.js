// --- GLOBAL VARIABLES ---
let definitions, layers, floors, mapConfig, offcanvasInfo, zoomSettings;
let map; // Define map globally
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

        // Hide the 'hl' element
        const floorSuffix = getFloorSuffix();
        const iconBaseName = highlightedElement.id.replace(new RegExp(`^${definitions.prefixes.icon}`), '').replace(definitions.suffixes.floor, '');
        const hlElementId = `${definitions.prefixes.highlight}${iconBaseName}${floorSuffix}`;
        const hlElement = svgElement.querySelector(`#${hlElementId}`);
        if (hlElement) {
            hlElement.style.display = 'none';
        }

        highlightedElement = null;
    }
}



function hideActiveOffcanvas() {
    if (mainOffcanvas) {
        mainOffcanvas.hide();
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

    // Calculate center of the element in screen coordinates
    const pt = svg.createSVGPoint();
    pt.x = bbox.x + bbox.width / 2;
    pt.y = bbox.y + bbox.height / 2;

    const screenPoint = pt.matrixTransform(ctm);

    // Convert to containerPoint relative to map container
    const containerPoint = L.point(screenPoint.x - mapRect.left, screenPoint.y - mapRect.top);

    // Determine pixel offset for offcanvas
    let offset = L.point(0, 0);

    if (activeOffcanvas && activeOffcanvas._element) {
        const offcanvasRect = activeOffcanvas._element.getBoundingClientRect();

        if (activeOffcanvas._element.classList.contains('offcanvas-end')) {
            // Offcanvas on right: shift view left (positive x)
            offset.x = offcanvasRect.width / 2;
        } else if (activeOffcanvas._element.classList.contains('offcanvas-bottom')) {
            // Offcanvas on bottom: shift view up (positive y)
            offset.y = offcanvasRect.height / 2;
        }
    }

    // Adjust containerPoint by offset
    const adjustedPoint = containerPoint.add(offset);

    // Convert back to latlng
    const latlng = map.containerPointToLatLng(adjustedPoint);

    // Center the map view
    map.setView(latlng, mapConfig.zoomOnHighlight, {
        animate: true
    });
}





function showAndHighlightIcon(iconId, offcanvasKey) {
    const target = svgElement.querySelector(`#${iconId}`);
    if (!target) return;

    // Clear any existing highlight before applying a new one
    clearHighlight();

    const offcanvasData = offcanvasInfo[offcanvasKey];
    if (!offcanvasData) {
        console.error("offcanvasData is undefined for key:", offcanvasKey);
        return;
    }

    const offcanvasBodyElement = document.getElementById('mainOffcanvasBody');

    offcanvasBodyElement.innerHTML = `
        <h5 class="offcanvas-title" id="mainOffcanvasLabel">${offcanvasData.title}</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        ${offcanvasData.content || ''}
    `;

    // If a different offcanvas is open, hide it first.
    if (activeOffcanvas && activeOffcanvas._element.id !== 'mainOffcanvas') {
        hideActiveOffcanvas();
    }
    
    mainOffcanvas.show();
    
    activeOffcanvas = mainOffcanvas;
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

    // Center the map on the highlighted element
    const bbox = highlightedElement.getBBox();
    const elementWidth = bbox.width;
    const elementHeight = bbox.height;

    console.log("Selected element BBox (width, height):", elementWidth, elementHeight);
    console.log("Current map zoom level:", map.getZoom());

    let targetZoom = mapConfig.zoomOnHighlight; // Default zoom from config

    if (window.innerWidth > window.innerHeight) { // Landscape (widescreen desktop)
        targetZoom = zoomSettings.desktopZoom;
    } else { // Portrait (vertical mobile)
        if (elementWidth >= zoomSettings.mobileLargeObjectWidth) { // Large object
            targetZoom = zoomSettings.mobileLargeObjectZoom;
        } else if (elementHeight <= zoomSettings.mobileSmallObjectHeight) { // Small object
            targetZoom = zoomSettings.mobileSmallObjectZoom;
        } else {
            targetZoom = zoomSettings.mobileDefaultZoom; // Intermediate zoom for other cases on mobile
        }
    }

    map.setView(map.getCenter(), targetZoom, { animate: true });
    centerOnElement(highlightedElement);
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
        // clearHighlight();
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
    // clearHighlight();
    updateLayerVisibility(isInitial);
}

function mostrarMapa(floorKey, capa, highlightId, isInitial = false) {
    // Ensure the map modal is visible only if not initial load
    if (!isInitial) {
        const mapModalElement = document.getElementById('mapModal');
        if (mapModalElement && !mapModalElement.classList.contains('show')) {
            const mapModal = new bootstrap.Modal(mapModalElement);
            mapModal.show();
        }
    }

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
                showAndHighlightIcon(iconId, highlightId);
            }
        }, 100); 
    }
}

function updateOffcanvasLayout() {
    const mainOffcanvasElement = document.getElementById('mainOffcanvas');
    if (window.innerHeight > window.innerWidth) { // Portrait
        mainOffcanvasElement.classList.remove('offcanvas-end');
        mainOffcanvasElement.classList.add('offcanvas-bottom');
    } else { // Landscape
        mainOffcanvasElement.classList.remove('offcanvas-bottom');
        mainOffcanvasElement.classList.add('offcanvas-end');
    }
}

async function initializeMap() {
    try {
        const response = await fetch('map-config.json');
        const config = await response.json();
        definitions = config.definitions;
        layers = config.layers;
        floors = config.floors;
        mapConfig = config.map;
        offcanvasInfo = config.informacion;

        console.log("initializeMap: config.zoomSettings =", config.zoomSettings); // Debugging
        zoomSettings = config.zoomSettings;
        console.log("initializeMap: zoomSettings (after assignment) =", zoomSettings); // Debugging

        // // Convert suffix string to RegExp
        // definitions.suffixes.floor = new RegExp(definitions.suffixes.floor);

                const floorSuffixes = Object.values(floors).map(f => f.suffix);
        if (!definitions.suffixes) {
            definitions.suffixes = {};
        }
        definitions.suffixes.floor = new RegExp(`(${floorSuffixes.join('|')})$`);

        // 1. Define map bounds
        const bounds = L.latLngBounds(
            mapConfig.bounds.southWest,
            mapConfig.bounds.northEast
        );

        // 2. Initialize Leaflet map
        map = L.map('map', {
            maxBounds: bounds,
            maxZoom: mapConfig.maxZoom,
            minZoom: mapConfig.minZoom,
            rotate: true,
            zoomControl: false // Disable default zoom control
        }).setView(bounds.getCenter(), mapConfig.initialZoom);

        // 3. Add tile layer
        L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
            maxZoom: 24,
            maxNativeZoom: 20
        }).addTo(map);

        map.setBearing(config.rotation);

        const svgUrl = config.svgSettings.url;
        const svgResponse = await fetch(svgUrl);
        const svgText = await svgResponse.text();

        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        svgElement = svgDoc.documentElement;

        const elementToModify = svgElement.querySelector(config.svgSettings.elementToRotate);
        if (elementToModify) {
            elementToModify.setAttribute('transform', `rotate(${-config.rotation},832.66,574.21)`);
        }

        L.svgOverlay(svgElement, bounds, { interactive: true }).addTo(map);

        // Initialize the single offcanvas instance
        const mainOffcanvasElement = document.getElementById('mainOffcanvas');
        mainOffcanvas = new bootstrap.Offcanvas(mainOffcanvasElement);

        // Attach event listeners to the single offcanvas instance once
        mainOffcanvasElement.addEventListener('shown.bs.offcanvas', function () {
            if (map) {
                map.invalidateSize(true);
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        // Removed centerOnElement from here
                    });
                });
            }
        });

        mainOffcanvasElement.addEventListener('hidden.bs.offcanvas', function () {
            clearHighlight();
            if (activeOffcanvas && activeOffcanvas._element.id === 'mainOffcanvas') {
                activeOffcanvas = null;
            }
        });

        // Dismiss map modal when a link inside the offcanvas is clicked
        const mainOffcanvasBodyElement = document.getElementById('mainOffcanvasBody');
        mainOffcanvasBodyElement.addEventListener('click', function(event) {
            const target = event.target.closest('a');
            if (target) {
                const mapModalElement = document.getElementById('mapModal');
                if (mapModalElement) {
                    const mapModalInstance = bootstrap.Modal.getInstance(mapModalElement);
                    if (mapModalInstance) {
                        mapModalInstance.hide();
                    }
                }
            }
        });

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

        // Click on map to hide card
        map.on('click', function(e) {
            console.log("Clicked coordinates:", e.latlng);
            hideActiveOffcanvas();
            // clearHighlight();
        });

        map.on('zoomend', function() {
            console.log("Map zoom level after zoom operation:", map.getZoom());
        });

        window.addEventListener('resize', updateOffcanvasLayout);

        // --- INITIALIZATION ---
        mostrarMapa(config.defaultView.floor, config.defaultView.layer, null, true);

        // Ensure offcanvas layout is correct after initial load
        requestAnimationFrame(() => {
            updateOffcanvasLayout();
        });

        // Click on an icon (moved here to ensure zoomSettings is loaded)
        svgElement.addEventListener('click', function(event) {
            if (!layers[currentLayer].interactive) return;

            const target = event.target.closest(`g[id^="${definitions.prefixes.icon}"]`);
            if (!target) return;

            L.DomEvent.stopPropagation(event);

            if (highlightedElement && highlightedElement.id === target.id) {
                hideActiveOffcanvas();
                // clearHighlight();
                return;
            }

            const iconBaseName = target.id.replace(new RegExp(`^${definitions.prefixes.icon}`), '').replace(definitions.suffixes.floor, '');
            const offcanvasKey = iconBaseName;
            showAndHighlightIcon(target.id, offcanvasKey);
        });

    } catch (error) {
        console.error('Error initializing map:', error);
        alert('Could not initialize map. Please check the console for details.');
    }
}

initializeMap();

// Fix for map in modal
const mapModal = document.getElementById('mapModal');
if (mapModal) {
    mapModal.addEventListener('shown.bs.modal', () => {
        if (map) {
            setTimeout(() => {
                map.invalidateSize(true);
                const bounds = L.latLngBounds(mapConfig.bounds.southWest, mapConfig.bounds.northEast);
                map.fitBounds(bounds);
            }, 10); // Delay to ensure modal is fully rendered
        }
    });
}