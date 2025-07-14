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
map.setBearing(-9.8);

// 3. Add tile layer
L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    maxZoom: 24,
    maxNativeZoom: 20
}).addTo(map);

// --- GLOBAL VARIABLES ---
let layPlantaAlta;
let layPlantaBaja;
let btnPlantaAlta;
let btnPlantaBaja;
let layerSelectorBtn;
let layerSelectorDropdown;
let svgElement;
let layerTitleElement;
let floorSubtitleElement;
let currentLayer = 'Iconos'; // Default layer

        features = {
            'Iconos': 'layIconos',
            'AccesoAuditorios': 'layAccesoAuditorios',
            'CirculacionGuardaAlimentos': 'layCirculacionGuardaAlimentos',
            'RutasEscape': 'layRutasEscape'
        };

        // --- STATE MANAGEMENT ---
        currentActiveFloor = 'PlantaBaja';
        highlightedElement = null;
        activeOffcanvas = null;

// --- FUNCTIONS ---
function clearHighlight() {
    if (highlightedElement) {
        highlightedElement.classList.remove('highlight');

        // Construct the ID of the corresponding 'hl' element
        const floorSuffix = getFloorSuffix();
        const iconBaseName = highlightedElement.id.replace(/^ico/, '').replace(/P[AB]$/, '');
        const hlElementId = `hl${iconBaseName}${floorSuffix}`;
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
    const iconBaseName = iconId.replace(/^ico/, '').replace(/P[AB]$/, '');
    const hlElementId = `hl${iconBaseName}${floorSuffix}`;
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
    return currentActiveFloor === 'PlantaAlta' ? 'PA' : 'PB';
}

function updateMapTitle() {
    const activeLayerItem = layerSelectorDropdown.querySelector('.dropdown-item.active');
    const layerText = activeLayerItem ? activeLayerItem.textContent : 'Cargando...';
    layerTitleElement.textContent = layerText;

    const floorText = currentActiveFloor === 'PlantaAlta' ? 'Planta alta' : 'Planta baja';
    floorSubtitleElement.textContent = floorText;
}

function updateLayerVisibility(isInitial) {
    const selectedLayer = currentLayer;
    const floorSuffix = getFloorSuffix();
    const targetLayerId = features[selectedLayer] + floorSuffix;

    for (const key in features) {
        for (const suffix of ['PB', 'PA']) {
            const layerId = features[key] + suffix;
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

    if (selectedLayer !== 'Iconos') {
        hideActiveOffcanvas();
        clearHighlight();
    }
}

function switchFloor(floorName, isInitial = false) {
    // If the floor is not actually changing, just update layer visibility.
    if (!isInitial && currentActiveFloor === floorName) {
        updateLayerVisibility(false);
        return;
    }
    currentActiveFloor = floorName;
    const isPlantaAlta = floorName === 'PlantaAlta';

    if (!isInitial) {
        layPlantaAlta.classList.add('fade-transition');
        layPlantaBaja.classList.add('fade-transition');
    }

    layPlantaAlta.style.opacity = isPlantaAlta ? 1 : 0;
    layPlantaBaja.style.opacity = 1; // Keep it opaque
    layPlantaBaja.style.filter = isPlantaAlta ? 'blur(3px) brightness(0.85)' : ''; // Apply blur and darken filter

    if (isPlantaAlta) {
        layPlantaAlta.style.display = 'block';
        layPlantaBaja.style.display = 'block';
    } else {
        if (!isInitial) {
            setTimeout(() => {
                layPlantaAlta.style.display = 'none';
            }, 500);
        } else {
            layPlantaAlta.style.display = 'none';
        }
    }

    map.getPane('tilePane').classList.toggle('basemap-blurred', isPlantaAlta);

    btnPlantaAlta.classList.toggle('active', isPlantaAlta);
    btnPlantaBaja.classList.toggle('active', !isPlantaAlta);
    
    hideActiveOffcanvas();
    clearHighlight();
    updateLayerVisibility(isInitial);
}

function mostrarMapa(floorNumber, capa, highlightId, isInitial = false) {
    const floorName = floorNumber === 1 ? 'PlantaAlta' : 'PlantaBaja';
    currentLayer = capa;
    
    // Update active state in dropdown
    layerSelectorDropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.toggle('active', item.dataset.value === capa);
    });

    switchFloor(floorName, isInitial);
    updateMapTitle();

    if (capa === 'Iconos' && highlightId) {
        const floorSuffix = getFloorSuffix();
        const iconId = `ico${highlightId}${floorSuffix}`;
        const offcanvasId = `offcanvas${highlightId}`;
        
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

// 4. Fetch and load SVG
const svgUrl = 'cpc.svg';
fetch(svgUrl)
    .then(response => response.text())
    .then(svgText => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        svgElement = svgDoc.documentElement; // Assign to global variable
      
        // --- START of your modification code ---
        // Find the specific element you want to change
        const elementToModify = svgElement.querySelector('#layBase');

        // Check if the element exists before trying to change it
        if (elementToModify) {
         // Change a property, for example, the fill color
            elementToModify.setAttribute('transform', 'rotate(9.8,832.66,574.21)');
         // You could also change other properties, like its stroke
         // elementToModify.setAttribute('stroke', 'blue');
        }
        // --- END of your modification code ---       
        
        L.svgOverlay(svgElement, bounds, { interactive: true }).addTo(map);

        // Apply rotation to layBase
        // const layBase = svgElement.querySelector('#layBase');
        // if (layBase) {
        //     layBase.style.transformOrigin = 'center center';
        //     layBase.style.transform = 'rotate(9.8deg)';
        // }

        // --- CACHING ELEMENTS ---
        layPlantaAlta = svgElement.querySelector('#layPlantaAlta');
        layPlantaBaja = svgElement.querySelector('#layPlantaBaja');
        btnPlantaAlta = document.getElementById('btnPlantaAlta');
        btnPlantaBaja = document.getElementById('btnPlantaBaja');
        layerSelectorBtn = document.getElementById('layer-selector-btn');
        layerSelectorDropdown = document.querySelector('.dropdown-menu');
        layerTitleElement = document.getElementById('layer-title');
        floorSubtitleElement = document.getElementById('floor-subtitle');
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');


        // --- EVENT LISTENERS ---
        btnPlantaAlta.addEventListener('click', () => mostrarMapa(1, currentLayer));
        btnPlantaBaja.addEventListener('click', () => mostrarMapa(0, currentLayer));
        
        layerSelectorDropdown.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('dropdown-item')) {
                const newLayer = target.dataset.value;
                const currentFloor = currentActiveFloor === 'PlantaAlta' ? 1 : 0;
                mostrarMapa(currentFloor, newLayer);
            }
        });

        zoomInBtn.addEventListener('click', () => map.zoomIn());
        zoomOutBtn.addEventListener('click', () => map.zoomOut());

        // Click on an icon
        svgElement.addEventListener('click', function(event) {
            if (currentLayer !== 'Iconos') return;

            const target = event.target.closest('g[id]');
            if (!target) return;
            
            L.DomEvent.stopPropagation(event);

            if (highlightedElement && highlightedElement.id === target.id) {
                hideActiveOffcanvas();
                clearHighlight();
                return;
            }

            const iconBaseName = target.id.replace(/^ico/, '').replace(/P[AB]$/, '');
            const offcanvasId = `offcanvas${iconBaseName}`;
            showAndHighlightIcon(target.id, offcanvasId);
            centerOnElement(target); // Center on the clicked element
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
        mostrarMapa(0, 'Iconos', null, true);


    }).catch(error => {
        console.error('Error loading or parsing SVG:', error);
        alert('Could not load the SVG file.');
    });