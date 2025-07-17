document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL VARIABLES ---
    let config;
    let panzoom;
    let svgElement;
    let floorSuffixRegex; // Will be created dynamically

    // --- DOM ELEMENT CACHE ---
    const planoContainer = document.getElementById('plano-container');
    const floorControls = document.getElementById('floor-controls');
    const layerSelectorDropdown = document.querySelector('.dropdown-menu[aria-labelledby="layer-selector-btn"]');
    const layerTitleElement = document.getElementById('layer-title');
    const floorSubtitleElement = document.getElementById('floor-subtitle');
    const mainOffcanvasElement = document.getElementById('mainOffcanvas');
    const mainOffcanvas = new bootstrap.Offcanvas(mainOffcanvasElement);

    // --- STATE MANAGEMENT ---
    let currentLayer = 'departamentos';
    let currentActiveFloor = 0;
    let highlightedElement = null;

    // --- CORE FUNCTIONS ---
//        1 /**
//    2  * Creates a regular expression to identify floor suffixes from the config.
//    3  * @param {object} config - The application configuration object.
//    4  * @returns {RegExp} - The compiled regular expression.
//    5  */
    function createFloorSuffixRegex(config) {
        const floorSuffixes = Object.values(config.floors).map(f => f.suffix);
        return new RegExp(`(${floorSuffixes.join('|')})$`);
    }
    /**
     * Fetches config and SVG, then initializes the application.
     */
    async function initializePlano() {
        try {
            const response = await fetch('plano-config.json');
            config = await response.json();

            floorSuffixRegex = createFloorSuffixRegex(config);

            const svgResponse = await fetch(config.svgSettings.url);
            const svgText = await svgResponse.text();
            
            planoContainer.innerHTML = svgText;
            svgElement = planoContainer.querySelector('svg');

            if (!svgElement) {
                throw new Error("SVG element not found after loading.");
            }

            setupPanzoom();
            setupUI();
            setupEventListeners();

            // Set initial view
            switchFloor(config.defaultView.floor, true);
            switchLayer(config.defaultView.layer, true);
            updateMapTitle();

        } catch (error) {
            console.error('Error initializing floorplan:', error);
            planoContainer.innerHTML = '<div class="alert alert-danger">Could not load floorplan.</div>';
        }
    }

    /**
     * Sets up the Panzoom instance on the SVG element.
     */
    function setupPanzoom() {
        const panzoomOptions = {
            ...config.panzoomSettings,
            canvas: true,
            contain: 'outside'
        };
        panzoom = Panzoom(svgElement, {
    ...config.panzoomSettings,
    canvas: true,
    contain: 'outside',
    handleStartEvent: (event) => {
        console.log('Panzoom handleStartEvent', event);
        return true; // Allow event propagation
    }
});
        svgElement.parentElement.addEventListener('wheel', panzoom.zoomWithWheel);
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
            button.textContent = level; // Use floor number for the label
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
        document.getElementById('zoom-in').addEventListener('click', () => panzoom && panzoom.zoomIn());
        document.getElementById('zoom-out').addEventListener('click', () => panzoom && panzoom.zoomOut());

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

        // Custom click handling to distinguish from panning
        if (svgElement) {
            let mouseDownPos = null;
        let isDragging = false;

        svgElement.addEventListener('mousedown', (e) => {
            console.log('mousedown event', e);
            mouseDownPos = { x: e.clientX, y: e.clientY };
            isDragging = false;
        });

        svgElement.addEventListener('mousemove', (e) => {
            if (mouseDownPos) {
                const deltaX = Math.abs(e.clientX - mouseDownPos.x);
                const deltaY = Math.abs(e.clientY - mouseDownPos.y);
                if (deltaX > 5 || deltaY > 5) { // If mouse moved more than 5px, it's a drag
                    isDragging = true;
                    console.log('mousemove: isDragging = true');
                }
            }
        });

svgElement.addEventListener('mouseup', (e) => {
    console.log('mouseup fired on SVG', e);
    if (mouseDownPos) {
        if (!isDragging) {
            console.log('calling handleSvgClick');
            handleSvgClick(e);
        } else {
            console.log('was dragging, not calling handleSvgClick');
        }
        mouseDownPos = null;
        isDragging = false;
    }
});

        }
        mainOffcanvasElement.addEventListener('hidden.bs.offcanvas', clearHighlight);
    }

    /**
     * Handles click events on the SVG to identify interactive elements.
     * @param {MouseEvent} event - The standard mouse click event.
     */
    function handleSvgClick(event) {
        console.log('handleSvgClick triggered', event.target);

        if (!config.layers[currentLayer].interactive) {
            console.log('current layer not interactive');
            return;
        }

        const target = event.target.closest(`g[id^="${config.definitions.prefixes.icon}"]`);
        
        console.log('final target after closest', target);

        if (target) {
            console.log('interactive target found', target.id);
            if (highlightedElement && highlightedElement.id === target.id) {
                mainOffcanvas.hide();
                return;
            }
            const iconBaseName = target.id.replace(new RegExp(`^${config.definitions.prefixes.icon}`), '').replace(floorSuffixRegex, '');
            showAndHighlightIcon(target.id, iconBaseName);
        } else {
            console.log('no interactive target found, hiding offcanvas');
            mainOffcanvas.hide();
        }
    }



    /**
     * Switches the visible floor.
     * @param {number} level - The floor level to switch to.
     * @param {boolean} [isInitial=false] - True if this is the first load.
     */
    function switchFloor(level, isInitial = false) {
        if (!isInitial && currentActiveFloor === level) return;
        
        mainOffcanvas.hide();
        currentActiveFloor = level;

        // Update floor button active states
        floorControls.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.level) === level);
        });

        updateLayerVisibility(isInitial);
        updateMapTitle();
    }

    /**
     * Switches the visible feature layer.
     * @param {string} newLayerKey - The key of the layer to switch to.
     * @param {boolean} [isInitial=false] - True if this is the first load.
     */
    function switchLayer(newLayerKey, isInitial = false) {
        currentLayer = newLayerKey;
        
        // Update layer dropdown active states
        layerSelectorDropdown.querySelectorAll('a').forEach(link => {
            link.classList.toggle('active', link.dataset.value === newLayerKey);
        });

        if (!isInitial) {
            mainOffcanvas.hide();
        }
        
        updateLayerVisibility(isInitial);
        updateMapTitle();
    }

    /**
     * Updates the visibility of all layers based on the current floor and layer state.
     * @param {boolean} [isInitial=false] - True if this is the first load.
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
                    if (!isInitial) {
                        layerElement.classList.add('fade-transition');
                    }
                    layerElement.style.opacity = isTarget ? 1 : 0;
                    layerElement.style.pointerEvents = isTarget ? 'auto' : 'none'; // Prevent clicks on hidden layers

                    if (isTarget) {
                        layerElement.style.display = 'block';
                    } else {
                        // Hide after fade-out transition
                        setTimeout(() => {
                            if (layerElement.style.opacity === '0') {
                                layerElement.style.display = 'none';
                            }
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
                baseLayerElement.style.pointerEvents = 'none'; // Base layers are not interactive
            }
        }
    }

    /**
     * Displays details in the offcanvas and highlights the corresponding SVG element.
     * @param {string} iconId - The full ID of the SVG icon element.
     * @param {string} offcanvasKey - The key for the info in the config.
     */
    function showAndHighlightIcon(iconId, offcanvasKey) {
        console.log('showAndHighlightIcon called with iconId:', iconId, 'offcanvasKey:', offcanvasKey);
        const target = svgElement.querySelector(`#${iconId}`);
        if (!target) {
            console.log('Target element not found for iconId:', iconId);
            return;
        }

        clearHighlight();

        const offcanvasData = config.informacion[offcanvasKey];
        if (!offcanvasData) {
            console.log('No offcanvas data found for offcanvasKey:', offcanvasKey);
            return;
        }
        console.log('Offcanvas data found:', offcanvasData);

        const highlightId = `${config.definitions.prefixes.highlight}${iconId.replace(config.definitions.prefixes.icon, '')}`;
        const highlightElement = svgElement.querySelector(`#${highlightId}`);
        console.log('Highlight element ID:', highlightId, 'Element found:', highlightElement);

        const offcanvasBody = document.getElementById('mainOffcanvasBody');
        if (offcanvasBody) {
            offcanvasBody.innerHTML = `
                <h5 class="offcanvas-title" id="mainOffcanvasLabel">${offcanvasData.title}</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                ${offcanvasData.content || ''}
            `;
            console.log('Offcanvas body updated.');
        } else {
            console.error('mainOffcanvasBody element not found!');
        }
        
        mainOffcanvas.show();
        console.log('mainOffcanvas.show() called.');

        if (highlightElement) {
            highlightedElement = highlightElement;
            highlightedElement.classList.add('highlight');
            highlightedElement.style.display = 'inline'; // Make highlight visible
            console.log('Highlight class added to highlightElement.', highlightedElement);
        } else {
            highlightedElement = target;
            highlightedElement.classList.add('highlight');
            highlightedElement.style.display = 'inline'; // Make target visible if no specific highlight
            console.log('Highlight class added to target element (no specific highlightElement found).', highlightedElement);
        }

        // Zoom and center on the highlighted element
        if (panzoom && highlightedElement) {
            const bbox = highlightedElement.getBoundingClientRect();
            const centerX = bbox.left + bbox.width / 2;
            const centerY = bbox.top + bbox.height / 2;

            // Adjust for current panzoom transform
            let currentTransform = { x: 0, y: 0, scale: 1 }; // Default values
            if (panzoom && typeof panzoom.getTransform === 'function') {
                currentTransform = panzoom.getTransform();
            } else {
                console.error('Error: panzoom.getTransform is not a function. Current panzoom object:', panzoom);
                // If getTransform is not available, we cannot proceed with dynamic centering.
                // We'll use default transform and log the error.
            }
            const transformedCenterX = (centerX - currentTransform.x) / currentTransform.scale;
            const transformedCenterY = (centerY - currentTransform.y) / currentTransform.scale;

            // Determine a suitable zoom level (adjust as needed)
            const zoomLevel = config.zoomSettings.desktopZoom; // Using a value from config

            panzoom.zoomTo(transformedCenterX, transformedCenterY, zoomLevel);
            console.log('Zoomed and centered on element.');
        }
    }

    /**
     * Removes the highlight from the currently selected element.
     */
    function clearHighlight() {
        if (highlightedElement) {
            highlightedElement.classList.remove('highlight');
            highlightedElement.style.display = 'none'; // Hide highlight when cleared
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

    // --- INITIALIZATION ---
    initializePlano();
});
