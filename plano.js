document.addEventListener('DOMContentLoaded', async () => {
    // --- GLOBAL VARIABLES ---
    let config;
    let map;
    let svgElement;
    let svgOverlay;


    // --- DOM ELEMENT CACHE ---
    const dom = {
        floorControls: document.getElementById('floor-controls'),
        layerSelectorDropdown: document.querySelector('.dropdown-menu[aria-labelledby="layer-selector-btn"]'),
        layerTitleElement: document.getElementById('layer-title'),
        floorSubtitleElement: document.getElementById('floor-subtitle'),
        mainOffcanvasElement: document.getElementById('mainOffcanvas'),
        mapLoader: document.getElementById('map-loader'),
        mapModal: document.getElementById('mapModal'),
        zoomIn: document.getElementById('zoom-in'),
        zoomOut: document.getElementById('zoom-out'),
        mainOffcanvasBody: document.getElementById('mainOffcanvasBody'),
        mapHeaderPanel: document.getElementById('map-header-panel')
    };
    const mainOffcanvas = new bootstrap.Offcanvas(dom.mainOffcanvasElement);

    // --- STATE MANAGEMENT ---
    let currentLayer = 'departamentos';
    let currentActiveFloor = 0;
    let highlightedElement = null;
    let originalNextSibling = null;
    let originalParent = null;

    /**
     * Fetches config and SVG, then initializes the application.
     */
    async function initializeMap() {
        try {
            // Fetch configuration
            const response = await fetch('plano-config.json?v=1');
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

            // Programmatically set pointer events so that only child elements
            // with an ID starting with "int" are interactive.
            const iconGroups = svgElement.querySelectorAll(`g[id^="${config.definitions.prefixes.icon}"]`);
            iconGroups.forEach(group => {
                // First, disable pointer events on all children to ensure a clean slate.
                // group.querySelectorAll('*').forEach(child => {
                //     child.style.pointerEvents = 'none';
                // });
                // Then, enable pointer events only on the specifically marked interactive elements.
                group.querySelectorAll(`[id^="int"]`).forEach(interactiveElement => {
                    interactiveElement.style.pointerEvents = 'all';
                });
            });

            // Ensure all base floor layers are displayed inline before initial setup
            // to allow for CSS opacity transitions to work correctly.
            for (const level in config.floors) {
                const baseLayerId = config.floors[level].baseLayerId;
                const baseLayerElement = svgElement.querySelector(`#${baseLayerId}`);
                if (baseLayerElement) {
                    baseLayerElement.style.display = 'inline';
                }
            }

            // Get SVG dimensions for CRS
            const svgWidth = svgElement.viewBox.baseVal.width;
            const svgHeight = svgElement.viewBox.baseVal.height;
            const bounds = [[0, 0], [svgHeight, svgWidth]];

            // Initialize Leaflet map with simple coordinates
            map = L.map('map', {
                crs: L.CRS.Simple,
                minZoom: config.mapSettings.minZoom,
                maxZoom: config.mapSettings.maxZoom,
                zoomControl: false, // Disable default zoom control
                maxBounds: bounds,
                zoomSnap: config.mapSettings.zoomSnap,
                center: config.mapSettings.initialCenter,
                zoom: config.mapSettings.initialZoom,
                attributionControl: false

            });

            // Add image overlay as the base layer
            L.imageOverlay(config.svgSettings.imageOverlayUrl, bounds).addTo(map);

            // Add SVG overlay
            svgOverlay = L.svgOverlay(svgElement, bounds).addTo(map);
            map.fitBounds([[2129,2282],[1302,1003]]);

            // Setup UI and event listeners
            setupUI();
            setupEventListeners();

            // Set initial view
            switchFloor(config.defaultView.floor, true);
            switchLayer(config.defaultView.layer, true);
            updateMapTitle();

            // Center on the overview element on load
            if (dom.mapModal) {
                let initialCenterDone = false;
                if (config.defaultView.overviewElement) {
                    dom.mapModal.addEventListener('shown.bs.modal', () => {
                        if (!initialCenterDone) {
                            centerOnElement(config.defaultView.overviewElement, false);
                            initialCenterDone = true;
                        }
                    }, { once: true });
                }
            } else if (config.defaultView.overviewElement) {
                // If no modal, center on load
                centerOnElement(config.defaultView.overviewElement, false);
            }

            // Hide loader
            dom.mapLoader.style.display = 'none';

            

        } catch (error) {
            console.error('Error initializing map:', error);
            dom.mapLoader.innerHTML = '<div class="alert alert-danger">Could not load map.</div>';
        }
    }

    /**
     * Populates UI controls like floor and layer selectors.
     */
    function setupUI() {
        // Populate floor controls
        dom.floorControls.innerHTML = '';
        Object.keys(config.floors).sort((a, b) => b - a).forEach(level => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn';
            button.dataset.level = level;
            button.textContent = config.floors[level].name;
            dom.floorControls.appendChild(button);
        });

        // Populate layer selector
        dom.layerSelectorDropdown.innerHTML = '';
        for (const key in config.layers) {
            const layer = config.layers[key];
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.className = 'dropdown-item';
            a.href = '#';
            a.dataset.value = key;
            a.textContent = layer.name;
            li.appendChild(a);
            dom.layerSelectorDropdown.appendChild(li);
        }
    }

    /**
     * Sets up all necessary event listeners for UI interaction.
     */
    function setupEventListeners() {
        dom.zoomIn.addEventListener('click', () => map.zoomIn());
        dom.zoomOut.addEventListener('click', () => map.zoomOut());

        // map.on('moveend', rerenderSVG);

        dom.floorControls.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (button && button.dataset.level) {
                switchFloor(parseInt(button.dataset.level, 10));
            }
        });

        dom.layerSelectorDropdown.addEventListener('click', (event) => {
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

        dom.mainOffcanvasElement.addEventListener('hidden.bs.offcanvas', clearHighlight);

        // Add this new event listener for offcanvas links
        dom.mainOffcanvasElement.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (link && link.href) {
                const href = link.getAttribute('href');
                // If it's a link to another part of the map, let plano handle it
                if (href.includes('plano')) {
                    // The function call is already in the href, so we don't need to do anything extra
                    return;
                }
                // If it's a link to a section on the main page, close the modal
                if (href.startsWith('#')) {
                    if (dom.mapModal) {
                        const mapModal = bootstrap.Modal.getInstance(dom.mapModal);
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
        
        if (!isInitial) {
            mainOffcanvas.hide();
        }
        currentActiveFloor = level;

        dom.floorControls.querySelectorAll('button').forEach(btn => {
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
        
        dom.layerSelectorDropdown.querySelectorAll('a').forEach(link => {
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
                    layerElement.style.display = isTarget ? 'block' : 'none';
                    layerElement.style.pointerEvents = isTarget ? 'auto' : 'none';
                }
            }
        }

        // Toggle visibility of base floor layers
        for (const level in config.floors) {
            const baseLayerId = config.floors[level].baseLayerId;
            const baseLayerElement = svgElement.querySelector(`#${baseLayerId}`);
            if (baseLayerElement) {
                const isCurrent = parseInt(level, 10) === currentActiveFloor;
                baseLayerElement.style.display = isCurrent ? 'inline' : 'none';
                baseLayerElement.style.pointerEvents = 'none';
            }
        }
    }

    /**
     * Displays details in the offcanvas and highlights the corresponding SVG element.
     */
    function showAndHighlightIcon(iconId, offcanvasKey, animate = true) {
        const target = svgElement.querySelector(`#${iconId}`);
        if (!target) return;

        clearHighlight();

        const offcanvasData = config.informacion[offcanvasKey];
        if (!offcanvasData) return;

        const highlightId = `${config.definitions.prefixes.highlight}${iconId.replace(config.definitions.prefixes.icon, '')}`;
        const highlightElement = svgElement.querySelector(`#${highlightId}`);
        const highlightLayer = svgElement.querySelector('#highlights');

        dom.mainOffcanvasBody.innerHTML = `
            <h5 class="offcanvas-title" id="mainOffcanvasLabel">${offcanvasData.title}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            ${offcanvasData.content || ''}
        `;
        
        if (dom.mainOffcanvasElement.classList.contains('show')) {
            centerOnElement(iconId, animate);
        } else {
            dom.mainOffcanvasElement.addEventListener('shown.bs.offcanvas', () => {
                centerOnElement(iconId, animate);
            }, { once: true });
        }
        
        mainOffcanvas.show();

        if (highlightLayer) {
            // Clone the entire icon group to bring it to the front
            const clonedIconGroup = target.cloneNode(true);
            
            // Find the highlight shape within the cloned group and make it visible
            const clonedHighlightShape = clonedIconGroup.querySelector(`[id^="${config.definitions.prefixes.highlight}"]`);
            if (clonedHighlightShape) {
                clonedHighlightShape.style.display = 'inline';
            }
            
            // Add the whole cloned group to the highlights layer
            highlightLayer.appendChild(clonedIconGroup);
            highlightedElement = clonedIconGroup; // Keep a reference to the cloned group
            // Disable interactivity on the highlight clone so elements below can be clicked
            if (highlightedElement) {
                highlightedElement.style.pointerEvents = 'none';
                const children = highlightedElement.querySelectorAll('*');
                children.forEach(child => {
                    child.style.pointerEvents = 'none';
                });
            }
        }
    }

    function clearHighlight() {
        const highlightLayer = svgElement.querySelector('#highlights');
        if (highlightLayer) {
            highlightLayer.innerHTML = ''; // Clear all highlights
        }
        highlightedElement = null;
    }

    /**
     * Updates the main title and subtitle based on current state.
     */
    function updateMapTitle() {
        dom.layerTitleElement.textContent = config.layers[currentLayer].name;
        dom.floorSubtitleElement.textContent = config.floors[currentActiveFloor].name;
    }

    /**
     * Centers and zooms the map view to fit a given SVG element,
     * accounting for the offcanvas panel if it's visible.
     * @param {string} elementId The ID of the SVG element to focus on.
     */
    function centerOnElement(elementId, animate = true) {
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
        const topPadding = dom.mapHeaderPanel?.offsetHeight || 0;
        // const rightPadding = document.querySelector('.vertical-toolbar')?.offsetWidth || 0;
        const bottomPadding = dom.mainOffcanvasElement.classList.contains('show') ? dom.mainOffcanvasElement.offsetHeight : 0;

        const flyToBoundsOptions = {
            maxZoom: config.mapSettings.zoom.maxZoom,
            paddingTopLeft: L.point(0, topPadding),
            paddingBottomRight: L.point(0, bottomPadding)
        };
        const fitToBoundsOptions = {
            maxZoom: config.mapSettings.zoom.maxZoom,
            paddingTopLeft: L.point(0, topPadding),
            paddingBottomRight: L.point(0, bottomPadding),
            animate: false
        };

        // Use flyToBounds for a smooth animation that fits the element in the view.
        animate
            ? map.flyToBounds(elementBounds, flyToBoundsOptions)
            : map.fitBounds(elementBounds, fitToBoundsOptions);

    }
    // Make it globally accessible for console calls
    window.centerOnElement = centerOnElement;

    // function rerenderSVG() {
    //     if (map && svgOverlay) {
    //         svgOverlay.removeFrom(map);
    //         svgOverlay.addTo(map);
    //         console.log('SVG overlay has been rerendered.');
    //     }
    //     // console.log(map.getCenter());
    //     // console.log(map.getZoom());
    //     // console.log(map.getBounds());
    // }
    // window.rerenderSVG = rerenderSVG;

    /**
     * Publicly accessible function to control the map view.
     * @param {number} floor The floor number to display.
     * @param {string} layer The key of the layer to display.
     * @param {string} [elementId] Optional: The base ID of an element to highlight and center on.
     * @param {boolean} [animate=true] Optional: Whether to animate the transition.
     * @param {boolean} [overview=true] Optional: Whether to start from a zoomed-out overview.
     */
    function plano(floor = 0, layer = 'departamentos', elementId = 'basePB', animate = true, overview = true) {
        const performMapActions = () => {
            map.invalidateSize();
            // When calling programmatically, use the 'isInitial' flag to prevent
            // the offcanvas from hiding and re-showing, which causes a race condition
            // that clears the new highlight. This also skips fade transitions for an instant view change.
            if (config.floors[floor] !== undefined) {
                switchFloor(parseInt(floor, 10), true);
            } else {
                console.error(`Invalid floor number provided: ${floor}.`);
            }

            // Validate and switch layer
            if (config.layers[layer] !== undefined) {
                switchLayer(layer, true);
            } else {
                console.error(`Invalid layer key provided: '${layer}'.`);
            }

            const findAndShowElement = (shouldAnimate) => {
                if (elementId) {
                    if (config.informacion[elementId] !== undefined) {
                        const floorSuffix = config.floors[floor].suffix;
                        const iconPrefix = config.definitions.prefixes.icon;
                        const iconIdWithSuffix = `${iconPrefix}${elementId}${floorSuffix}`;
                        const iconIdWithoutSuffix = `${iconPrefix}${elementId}`;

                        const targetElement = svgElement.querySelector(`#${iconIdWithSuffix}`) || svgElement.querySelector(`#${iconIdWithoutSuffix}`);

                        if (targetElement) {
                            showAndHighlightIcon(targetElement.id, elementId, shouldAnimate);
                        } else {
                            console.warn(`Icon with base ID '${elementId}' not found on floor ${floor}.`);
                        }
                    } else {
                        console.warn(`No information found for elementId: '${elementId}', cannot show details.`);
                        centerOnElement(elementId, shouldAnimate); // Attempt to center even without info
                    }
                }
            };

            if (overview && elementId) {
                centerOnElement(config.defaultView.overviewElement, false);

                // Hide loader once the overview is set, before the animation starts
                dom.mapLoader.style.display = 'none';

                setTimeout(() => {
                    findAndShowElement(true); // Always animate from overview
                }, config.mapSettings.overviewAnimationDelay);
            } else {
                findAndShowElement(animate);
                // Hide loader if not in overview mode either
                dom.mapLoader.style.display = 'none';
            }
        };

        if (dom.mapModal) {
            const mapModal = bootstrap.Modal.getInstance(dom.mapModal) || new bootstrap.Modal(dom.mapModal);
            if (dom.mapModal.classList.contains('show')) {
                // If modal is already open, show loader briefly while the view changes.
                dom.mapLoader.style.display = 'flex';
                // Use a short timeout to allow the loader to render before the map actions run.
                setTimeout(performMapActions, 50);
            } else {
                // If modal is closed, show the loader, then show the modal.
                // The 'shown' event will then trigger the map actions.
                dom.mapLoader.style.display = 'flex';
                dom.mapModal.addEventListener('shown.bs.modal', performMapActions, { once: true });
                mapModal.show();
            }
        } else {
            performMapActions();
        }
    }
    // Make it globally accessible
    window.plano = plano;

    // --- INITIALIZATION ---
    initializeMap();

    // --- MODAL BUG FIX ---
    // Handles the bug where the page becomes unresponsive after dismissing the modal.
    if (dom.mapModal) {
        dom.mapModal.addEventListener('hide.bs.modal', () => {
            // Reset to overview element as the modal is closing
            if (config && config.defaultView.overviewElement) {
                centerOnElement(config.defaultView.overviewElement, false);
            }
            clearHighlight();
        });

        dom.mapModal.addEventListener('hidden.bs.modal', () => {
            const body = document.body;
            
            // Force remove the 'modal-open' class from the body
            body.classList.remove('modal-open');
            
            // Reset the body's overflow style
            body.style.overflow = '';

            // Find and remove any lingering modal backdrops
            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach(backdrop => backdrop.remove());
        });
    }
});
