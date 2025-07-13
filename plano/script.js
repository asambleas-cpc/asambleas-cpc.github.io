// 1. Define map bounds
const bounds = L.latLngBounds([
    [-31.72236, -60.52612], // Southwest
    [-31.72096, -60.52442]  // Northeast
]);

// 2. Initialize Leaflet map
const map = L.map('map', {
    maxBounds: bounds,
    maxZoom: 24,
    minZoom: 20,
    rotate: true,
    zoomControl: false // Disable default zoom control
}).setView(bounds.getCenter(), 21);
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
        highlightedElement = null;
    }
}

function hideActiveOffcanvas() {
    if (activeOffcanvas) {
        activeOffcanvas.hide();
        // The 'hidden.bs.offcanvas' event will handle cleanup.
    }
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

    // Center the map on the icon
    const mapContainer = map.getContainer();
    const mapBounds = mapContainer.getBoundingClientRect();
    const iconBounds = target.getBoundingClientRect();

    const iconCenterX = (iconBounds.left - mapBounds.left) + iconBounds.width / 2;
    const iconCenterY = (iconBounds.top - mapBounds.top) + iconBounds.height / 2;

    const layerPoint = L.point(iconCenterX, iconCenterY);
    const latLng = map.layerPointToLatLng(layerPoint);

    map.panTo(latLng);

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

function mostrarMapa(planta, capa, highlightId, isInitial = false) {
    const floorName = planta === 'alta' ? 'PlantaAlta' : 'PlantaBaja';
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
        showAndHighlightIcon(iconId, offcanvasId);
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
        L.svgOverlay(svgElement, bounds, { interactive: true }).addTo(map);

        // Apply rotation to layBase
        const layBase = svgElement.querySelector('#layBase');
        if (layBase) {
            layBase.style.transformOrigin = 'center center';
            layBase.style.transform = 'rotate(9.8deg)';
        }

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
        btnPlantaAlta.addEventListener('click', () => mostrarMapa('alta', currentLayer));
        btnPlantaBaja.addEventListener('click', () => mostrarMapa('baja', currentLayer));
        
        layerSelectorDropdown.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('dropdown-item')) {
                const newLayer = target.dataset.value;
                const currentFloor = currentActiveFloor === 'PlantaAlta' ? 'alta' : 'baja';
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
        });

        // Click on map to hide card
        map.on('click', function() {
            hideActiveOffcanvas();
            clearHighlight();
        });

        window.addEventListener('load', updateOffcanvasLayout);
        window.addEventListener('resize', updateOffcanvasLayout);

        // --- INITIALIZATION ---
        mostrarMapa('baja', 'Iconos', null, true);


    }).catch(error => {
        console.error('Error loading or parsing SVG:', error);
        alert('Could not load the SVG file.');
    });