document.addEventListener('DOMContentLoaded', () => {
    // This is the entry point. We tell the renderer which markdown file to load
    // and which DOM element to put the resulting HTML into.
    renderMarkdown('content/inicio.md', '#inicio-content');
    renderMarkdown('content/transporte.md', '#transporte-content');
    renderMarkdown('content/auditorios.md', '#auditorios-content');
    renderMarkdown('content/alimentos.md', '#alimentos-content');
    renderMarkdown('content/alojamiento.md', '#alojamiento-content');
    renderMarkdown('content/conclusion.md', '#conclusion-content');
});

/**
 * Fetches Markdown content, parses it for custom tags, and injects it into the DOM.
 * @param {string} mdPath - The path to the .md file (e.g., 'content/section.md').
 * @param {string} targetSelector - The CSS selector for the container element.
 */
async function renderMarkdown(mdPath, targetSelector) {
    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) {
        console.error(`Markdown render target not found: ${targetSelector}`);
        return;
    }

    try {
        const response = await fetch(mdPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const markdownText = await response.text();
        
        // Convert the raw text with our custom tags into final HTML
        const finalHtml = parseCustomTags(markdownText);

        targetElement.innerHTML = finalHtml;

    } catch (error) {
        targetElement.innerHTML = `<div class="alert alert-danger">Error loading content from ${mdPath}.</div>`;
        console.error('Error fetching or rendering markdown:', error);
    }
}

/**
 * Parses the text for custom component tags like ::Card[...]...::/Card
 * and replaces them with the corresponding HTML.
 * @param {string} text - The raw text from the .md file.
 * @returns {string} - The processed HTML string.
 */
function parseCustomTags(text) {
    // Regex to find a component block: ::ComponentName[attributes]content::/ComponentName
    const tagRegex = /::(\w+)\s*\[([^\]]*)\]([\s\S]*?)::\/\1/g;

    return text.replace(tagRegex, (match, tagName, attrs, content) => {
        // Parse the attributes string (e.g., 'key="value" key2="value2"') into an object
        const props = {};
        const attrRegex = /(\w+)="([^"]*)"/g;
        let attrMatch;
        while ((attrMatch = attrRegex.exec(attrs)) !== null) {
            props[attrMatch[1]] = attrMatch[2];
        }
        
        // The content inside the tag is passed to the renderer
        props.content = content.trim();

        // Call the appropriate renderer based on the tag name
        switch (tagName) {
            case 'Card':
                return renderCardComponent(props);
            // You can add more component types here later
            // case 'Accordion':
            //     return renderAccordionComponent(props);
            default:
                // If the tag is not recognized, return it as is to avoid errors
                return match;
        }
    });
}


// --- Component Template Functions ---

/**
 * Renders the HTML for a generic card component.
 * @param {object} props - The properties for the card (e.g., title, cardId, cardClasses, content).
 * @returns {string} - The final HTML string for the card.
 */
function renderCardComponent(props) {
    const cardId = props.cardId ? `id="${props.cardId}"` : '';
    const cardClasses = props.cardClasses || '';

    return `
        <div class="card ${cardClasses}" ${cardId}>
            <div class="card-body d-flex flex-column">
                ${props.title ? `<h5 class="card-title">${props.title}</h5>` : ''}
                ${props.content || ''}
            </div>
        </div>
    `;
}