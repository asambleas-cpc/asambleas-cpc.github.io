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
    rotate: true
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
let layerSelector;
let cardContainer;
let svgElement;

        features = {
            'Iconos': 'layIconos',
            'AccesoAuditorios': 'layAccesoAuditorios',
            'CirculacionGuardaAlimentos': 'layCirculacionGuardaAlimentos',
            'RutasEscape': 'layRutasEscape'
        };

        // --- STATE MANAGEMENT ---
        currentActiveFloor = 'PlantaBaja';
        highlightedElement = null;
        activeCard = null;

// --- FUNCTIONS ---
function clearHighlight() {
    if (highlightedElement) {
        highlightedElement.classList.remove('highlight');
        highlightedElement = null;
    }
}

function hideActiveCard() {
    if (activeCard) {
        const cardToHide = activeCard;
        cardToHide.style.opacity = 0;
        setTimeout(() => {
            cardToHide.style.display = 'none';
        }, 300); // Match CSS transition duration
        activeCard = null;
    }
}

function showAndHighlightIcon(iconId, cardId) {
    const target = svgElement.querySelector(`#${iconId}`);
    if (!target) return;

    const card = document.getElementById(cardId);

    hideActiveCard();
    clearHighlight();

    if (card) {
        card.style.display = 'block';
        card.style.opacity = 1;
        
        activeCard = card;
        highlightedElement = target;
        target.classList.add('highlight');
    }
}

// Helper function to get floor suffix
function getFloorSuffix() {
    return currentActiveFloor === 'PlantaAlta' ? 'PA' : 'PB';
}

function updateLayerVisibility(isInitial) {
    const selectedLayer = layerSelector.value;
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
        hideActiveCard();
        clearHighlight();
    }
}

function switchFloor(floorName, isInitial = false) {
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
    
    hideActiveCard();
    clearHighlight();
    updateLayerVisibility(isInitial);
}

function mostrarMapa(planta, capa, highlightId, isInitial = false) {
    const floorName = planta === 'alta' ? 'PlantaAlta' : 'PlantaBaja';
    layerSelector.value = capa;
    switchFloor(floorName, isInitial);

    if (capa === 'Iconos' && highlightId) {
        const floorSuffix = getFloorSuffix();
        const iconId = `ico${highlightId}${floorSuffix}`;
        const cardId = `car${highlightId}`;
        showAndHighlightIcon(iconId, cardId);
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
        layerSelector = document.getElementById('layer-selector');
        cardContainer = document.getElementById('info-card-container');

        // --- EVENT LISTENERS ---
        btnPlantaAlta.addEventListener('click', () => mostrarMapa('alta', layerSelector.value));
        btnPlantaBaja.addEventListener('click', () => mostrarMapa('baja', layerSelector.value));
        layerSelector.addEventListener('change', () => {
            const currentFloor = currentActiveFloor === 'PlantaAlta' ? 'alta' : 'baja';
            mostrarMapa(currentFloor, layerSelector.value);
        });

        // Click on an icon
        svgElement.addEventListener('click', function(event) {
            if (layerSelector.value !== 'Iconos') return;

            const target = event.target.closest('g[id]');
            if (!target) return;
            
            L.DomEvent.stopPropagation(event);

            if (highlightedElement && highlightedElement.id === target.id) {
                hideActiveCard();
                clearHighlight();
                return;
            }

            const iconBaseName = target.id.replace(/^ico/, '').replace(/P[AB]$/, '');
            const cardId = `car${iconBaseName}`;
            showAndHighlightIcon(target.id, cardId);
        });

        // Click on map to hide card
        map.on('click', function() {
            hideActiveCard();
            clearHighlight();
        });

        // --- INITIALIZATION ---
        mostrarMapa('baja', 'Iconos', null, true);


    }).catch(error => {
        console.error('Error loading or parsing SVG:', error);
        alert('Could not load the SVG file.');
    });
