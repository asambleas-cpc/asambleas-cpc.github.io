document.addEventListener('DOMContentLoaded', async () => {
    // --- GLOBAL VARIABLES ---
    let config;
    let map;
    let svgElement;
    let svgOverlay;


    // --- DOM ELEMENT CACHE ---
    const floorControls = document.getElementById('floor-controls');
    const layerSelectorDropdown = document.querySelector('.dropdown-menu[aria-labelledby="layer-selector-btn"]');
    const layerTitleElement = document.getElementById('layer-title');
    const floorSubtitleElement = document.getElementById('floor-subtitle');
    const mainOffcanvasElement = document.getElementById('mainOffcanvas');
    const mainOffcanvas = new bootstrap.Offcanvas(mainOffcanvasElement);
    const mapLoader = document.getElementById('map-loader');

    // --- STATE MANAGEMENT ---
    let currentLayer = 'departamentos';
    let currentActiveFloor = 0;
    let highlightedElement = null;

    /**
     * Fetches config and SVG, then initializes the application.
     */
    async function initializeMap() {
        try {
            // Fetch configuration
            const response = await fetch('plano-config.json');
            config = await response.json();
            
            // Fetch SVG
            const svgResponse = await fetch(config.svgSettings.url);
            const svgText = await svgResponse.text();
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            svgElement = svgDoc.documentElement;

            // Workaround for Chrome rendering bug
            // svgElement.style.opacity = '0.99';

            if (!svgElement) {
                throw new Error("SVG element not found after loading.");
            }

            // Get SVG dimensions for CRS
            const svgWidth = svgElement.viewBox.baseVal.width;
            const svgHeight = svgElement.viewBox.baseVal.height;
            const bounds = [[0, 0], [svgHeight, svgWidth]];

            // Initialize Leaflet map with simple coordinates
            map = L.map('map', {
                crs: L.CRS.Simple,
                minZoom: -5, // Adjust minZoom for CRS.Simple
                zoomControl: false, // Disable default zoom control
                maxBounds: bounds
            });

            // Add SVG overlay
            svgOverlay = L.svgOverlay(svgElement, bounds).addTo(map);
            map.fitBounds(bounds);

            // Setup UI and event listeners
            setupUI();
            setupEventListeners();

            // Set initial view
            switchFloor(config.defaultView.floor, true);
            switchLayer(config.defaultView.layer, true);
            updateMapTitle();

            // Center on the initial element if defined
            const mapModal = document.getElementById('mapModal');
            if (mapModal) {
                let initialCenterDone = false;
                if (config.defaultView.initialElement) {
                    mapModal.addEventListener('shown.bs.modal', () => {
                        if (!initialCenterDone) {
                            centerOnElement(config.defaultView.initialElement);
                            initialCenterDone = true;
                        }
                    }, { once: true });
                }
            } else if (config.defaultView.initialElement) {
                // If no modal, center on load
                centerOnElement(config.defaultView.initialElement);
            }""

            // Hide loader
            mapLoader.style.display = 'none';

            

        } catch (error) {
            console.error('Error initializing map:', error);
            mapLoader.innerHTML = '<div class="alert alert-danger">Could not load map.</div>';
        }
    }

    /**
     * Populates UI controls like floor and layer selectors.
     */
    function setupUI() {
        // Populate floor controls
        floorControls.innerHTML = '';
        Object.keys(config.floors).sort((a, b) => b - a).forEach(level => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn';
            button.dataset.level = level;
            button.textContent = level;
            floorControls.appendChild(button);
        });

        // Populate layer selector
        layerSelectorDropdown.innerHTML = '';
        for (const key in config.layers) {
            const layer = config.layers[key];
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.className = 'dropdown-item';
            a.href = '#';
            a.dataset.value = key;
            a.textContent = layer.name;
            li.appendChild(a);
            layerSelectorDropdown.appendChild(li);
        }
    }

    /**
     * Sets up all necessary event listeners for UI interaction.
     */
    function setupEventListeners() {
        document.getElementById('zoom-in').addEventListener('click', () => map.zoomIn());
        document.getElementById('zoom-out').addEventListener('click', () => map.zoomOut());

        map.on('moveend', rerenderSVG);

        floorControls.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (button && button.dataset.level) {
                switchFloor(parseInt(button.dataset.level, 10));
            }
        });

        layerSelectorDropdown.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (link && link.dataset.value) {
                event.preventDefault();
                switchLayer(link.dataset.value);
            }
        });

        svgElement.addEventListener('click', (event) => {
            L.DomEvent.stopPropagation(event); // Prevent map click event

            if (!config.layers[currentLayer].interactive) return;

            const target = event.target.closest(`g[id^="${config.definitions.prefixes.icon}"]`);
            if (target) {
                if (highlightedElement && highlightedElement.id === target.id) {
                    mainOffcanvas.hide();
                    return;
                }
                const iconBaseName = target.id.replace(new RegExp(`^${config.definitions.prefixes.icon}`), '').replace(createFloorSuffixRegex(config), '');
                showAndHighlightIcon(target.id, iconBaseName);
            } else {
                mainOffcanvas.hide();
            }
        });

        map.on('click', () => {
            mainOffcanvas.hide();
        });

        mainOffcanvasElement.addEventListener('hidden.bs.offcanvas', clearHighlight);

        // Add this new event listener for offcanvas links
        mainOffcanvasElement.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (link && link.href) {
                const href = link.getAttribute('href');
                // If it's a link to another part of the map, let mostrarMapa handle it
                if (href.includes('mostrarMapa')) {
                    // The function call is already in the href, so we don't need to do anything extra
                    return;
                }
                // If it's a link to a section on the main page, close the modal
                if (href.startsWith('#')) {
                    const mapModalElement = document.getElementById('mapModal');
                    if (mapModalElement) {
                        const mapModal = bootstrap.Modal.getInstance(mapModalElement);
                        if (mapModal) {
                            mapModal.hide();
                        }
                    }
                }
            }
        });
    }

    /**
     * Switches the visible floor.
     */
    function switchFloor(level, isInitial = false) {
        if (!isInitial && currentActiveFloor === level) return;
        
        mainOffcanvas.hide();
        currentActiveFloor = level;

        floorControls.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.level) === level);
        });

        updateLayerVisibility(isInitial);
        updateMapTitle();
    }

    /**
     * Switches the visible feature layer.
     */
    function switchLayer(newLayerKey, isInitial = false) {
        currentLayer = newLayerKey;
        
        layerSelectorDropdown.querySelectorAll('a').forEach(link => {
            link.classList.toggle('active', link.dataset.value === newLayerKey);
        });

        // Add or remove class for pointer cursor based on layer interactivity
        if (config.layers[currentLayer].interactive) {
            svgElement.classList.add('interactive-layer');
        } else {
            svgElement.classList.remove('interactive-layer');
        }

        if (!isInitial) {
            mainOffcanvas.hide();
        }
        
        updateLayerVisibility(isInitial);
        updateMapTitle();
    }

    /**
     * Updates the visibility of all layers based on the current state.
     */
    function updateLayerVisibility(isInitial = false) {
        const floorSuffix = config.floors[currentActiveFloor].suffix;
        const targetLayerId = `${config.definitions.prefixes.layer}${config.layers[currentLayer].id}${floorSuffix}`;

        // Handle feature layers
        for (const key in config.layers) {
            for (const floorKey in config.floors) {
                const currentSuffix = config.floors[floorKey].suffix;
                const layerId = `${config.definitions.prefixes.layer}${config.layers[key].id}${currentSuffix}`;
                const layerElement = svgElement.querySelector(`#${layerId}`);
                
                if (layerElement) {
                    const isTarget = layerElement.id === targetLayerId;
                    if (!isInitial) layerElement.classList.add('fade-transition');
                    layerElement.style.opacity = isTarget ? 1 : 0;
                    layerElement.style.pointerEvents = isTarget ? 'auto' : 'none';

                    if (isTarget) {
                        layerElement.style.display = 'block';
                    } else {
                        setTimeout(() => {
                            if (layerElement.style.opacity === '0') layerElement.style.display = 'none';
                        }, 500);
                    }
                }
            }
        }

        // Toggle visibility of base floor layers
        for (const level in config.floors) {
            const baseLayerId = config.floors[level].baseLayerId;
            const baseLayerElement = svgElement.querySelector(`#${baseLayerId}`);
            if (baseLayerElement) {
                const isVisible = parseInt(level, 10) <= currentActiveFloor;
                if (!isInitial) baseLayerElement.classList.add('fade-transition');
                baseLayerElement.style.opacity = isVisible ? 1 : 0;
                baseLayerElement.style.filter = (parseInt(level, 10) < currentActiveFloor) ? 'blur(3px) brightness(0.85)' : '';
                baseLayerElement.style.pointerEvents = 'none';
            }
        }
    }

    /**
     * Displays details in the offcanvas and highlights the corresponding SVG element.
     */
    function bringToFront(element) {
        if (element && element.parentElement) {
            element.parentElement.appendChild(element);
        }
    }

    function showAndHighlightIcon(iconId, offcanvasKey) {
        const target = svgElement.querySelector(`#${iconId}`);
        if (!target) return;

        clearHighlight();

        const offcanvasData = config.informacion[offcanvasKey];
        if (!offcanvasData) return;

        const highlightId = `${config.definitions.prefixes.highlight}${iconId.replace(config.definitions.prefixes.icon, '')}`;
        const highlightElement = svgElement.querySelector(`#${highlightId}`);

        const offcanvasBody = document.getElementById('mainOffcanvasBody');
        offcanvasBody.innerHTML = `
            <h5 class="offcanvas-title" id="mainOffcanvasLabel">${offcanvasData.title}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            ${offcanvasData.content || ''}
        `;
        
        // If the offcanvas is already visible, center on the new element immediately.
        if (mainOffcanvasElement.classList.contains('show')) {
            centerOnElement(iconId);
        } else {
            // Otherwise, wait for the offcanvas to be fully shown before centering.
            mainOffcanvasElement.addEventListener('shown.bs.offcanvas', () => {
                centerOnElement(iconId);
            }, { once: true }); // Ensure the listener is only called once per show event.
        }

        mainOffcanvas.show();

        if (highlightElement) {
            highlightedElement = highlightElement;
            highlightedElement.style.display = 'inline';
        } else {
            highlightedElement = target;
            highlightedElement.classList.add('highlight-direct'); // Add a class for direct highlight if no 'hl' element
        }
        bringToFront(target);
    }

    /**
     * Removes the highlight from the currently selected element.
     */
    function clearHighlight() {
        if (highlightedElement) {
            if (highlightedElement.id.startsWith(config.definitions.prefixes.highlight)) {
                highlightedElement.style.display = 'none';
            } else {
                highlightedElement.classList.remove('highlight-direct');
            }
            highlightedElement = null;
        }
    }

    /**
     * Updates the main title and subtitle based on current state.
     */
    function updateMapTitle() {
        layerTitleElement.textContent = config.layers[currentLayer].name;
        floorSubtitleElement.textContent = config.floors[currentActiveFloor].name;
    }

    /**
     * Centers and zooms the map view to fit a given SVG element,
     * accounting for the offcanvas panel if it's visible.
     * @param {string} elementId The ID of the SVG element to focus on.
     */
    function centerOnElement(elementId) {
        const element = svgElement.querySelector(`#${elementId}`);
        if (!element) {
            console.error(`Element with ID '${elementId}' not found.`);
            return;
        }

        const bbox = element.getBBox();
        if (bbox.width === 0 || bbox.height === 0) {
            console.warn(`Element #${elementId} has zero dimensions. Cannot fit bounds.`);
            return;
        }

        const svgHeight = svgElement.viewBox.baseVal.height;

        // Convert SVG bbox coordinates to Leaflet LatLngBounds.
        const southWest = L.latLng(svgHeight - (bbox.y + bbox.height), bbox.x);
        const northEast = L.latLng(svgHeight - bbox.y, bbox.x + bbox.width);
        const elementBounds = L.latLngBounds(southWest, northEast);

        // --- DYNAMIC PADDING CALCULATION ---
        const topPadding = document.getElementById('map-title')?.offsetHeight || 0;
        const rightPadding = document.querySelector('.vertical-toolbar')?.offsetWidth || 0;
        const bottomPadding = mainOffcanvasElement.classList.contains('show') ? mainOffcanvasElement.offsetHeight : 0;

        const flyToBoundsOptions = {
            maxZoom: config.panzoomSettings.zoom.maxZoom,
            paddingTopLeft: L.point(0, topPadding),
            paddingBottomRight: L.point(rightPadding, bottomPadding)
        };
        
        // Use flyToBounds for a smooth animation that fits the element in the view.
        map.flyToBounds(elementBounds, flyToBoundsOptions);
    }
    // Make it globally accessible for console calls
    window.centerOnElement = centerOnElement;

    function rerenderSVG() {
        if (map && svgOverlay) {
            svgOverlay.removeFrom(map);
            svgOverlay.addTo(map);
            console.log('SVG overlay has been rerendered.');
        }
    }
    window.rerenderSVG = rerenderSVG;

    /**
     * Publicly accessible function to control the map view.
     * @param {number} floor The floor number to display.
     * @param {string} layer The key of the layer to display.
     * @param {string} [elementId] Optional: The base ID of an element to highlight and center on.
     */
    function mostrarMapa(floor = 0, layer = 'departamentos', elementId = 'basePB') {
        const mapModalElement = document.getElementById('mapModal');

        const performMapActions = () => {
            map.invalidateSize();
            // Validate and switch floor
            if (config.floors[floor] !== undefined) {
                switchFloor(parseInt(floor, 10));
            } else {
                console.error(`Invalid floor number provided: ${floor}.`);
            }

            // Validate and switch layer
            if (config.layers[layer] !== undefined) {
                switchLayer(layer);
            } else {
                console.error(`Invalid layer key provided: '${layer}'.`);
            }

            // Highlight and center on element if provided
            if (elementId) {
                if (config.informacion[elementId] !== undefined) {
                    const floorSuffix = config.floors[floor].suffix;
                    const iconPrefix = config.definitions.prefixes.icon;
                    const iconIdWithSuffix = `${iconPrefix}${elementId}${floorSuffix}`;
                    const iconIdWithoutSuffix = `${iconPrefix}${elementId}`;

                    const targetElement = svgElement.querySelector(`#${iconIdWithSuffix}`) || svgElement.querySelector(`#${iconIdWithoutSuffix}`);

                    if (targetElement) {
                        showAndHighlightIcon(targetElement.id, elementId);
                    } else {
                        console.warn(`Icon with base ID '${elementId}' not found on floor ${floor}.`);
                    }
                } else {
                    console.warn(`No information found for elementId: '${elementId}', cannot show details.`);
                    centerOnElement(elementId); // Attempt to center even without info
                }
            }
        };

        if (mapModalElement) {
            const mapModal = bootstrap.Modal.getInstance(mapModalElement) || new bootstrap.Modal(mapModalElement);
            if (mapModalElement.classList.contains('show')) {
                performMapActions();
            } else {
                mapModalElement.addEventListener('shown.bs.modal', performMapActions, { once: true });
                mapModal.show();
            }
        } else {
            performMapActions();
        }
    }
    // Make it globally accessible
    window.mostrarMapa = mostrarMapa;

    // --- INITIALIZATION ---
    initializeMap();
});
