# Proyecto: Sitio Informativo de las Asambleas en el CPC

## 1. Resumen del Proyecto

Este proyecto es un sitio web informativo de una sola página para los asistentes a las "Asambleas en el Centro Provincial de Convenciones (CPC)". Está diseñado como una guía completa que proporciona información sobre logística, distribución del lugar y detalles específicos del evento.

El sitio está estructurado como una página de desplazamiento vertical con secciones temáticas diferenciadas (Transporte, Auditorios, Alimentos, etc.). Su característica más destacada es un plano interactivo y muy detallado del centro de convenciones.

El proyecto está construido con tecnologías web estándar (HTML, CSS, JavaScript) y utiliza el framework Bootstrap 5 para el diseño y los componentes. No tiene un backend del lado del servidor y está pensado para ser alojado como un sitio estático (por ejemplo, en GitHub Pages).

## 2. Tecnologías y Bibliotecas

- **HTML5**: Estructura principal del sitio web.
- **CSS3**: Estilos personalizados y tematización.
- **JavaScript (ES6+)**: Gestiona toda la interactividad.
- **Bootstrap 5.3.3**: Framework principal de CSS/JS para el diseño, componentes (modales, acordeones) y sistema de rejilla.
- **Leaflet.js 1.9.4**: Una biblioteca de JavaScript para crear mapas interactivos. Se utiliza como motor para el visor del plano.
- **bs5-lightbox 1.8.3**: Una biblioteca de lightbox compatible con Bootstrap 5 para la galería de imágenes.
- **Google Fonts**: Utilizado para la familia de fuentes "Cabin".
- **Material Symbols/Icons**: Utilizado para todos los iconos del sitio.
- **Google Sheets**: Se utiliza como una base de datos externa y sencilla para datos dinámicos como listas de estacionamientos y rutas de autobuses.

## 3. Estructura de Archivos y Componentes Clave

Este es un sitio estático con una estructura de archivos plana. Los archivos clave son:

- **`index.html`**: El único punto de entrada para toda la aplicación. Contiene la estructura HTML de todas las secciones y modales.
- **`styles.css`**: La hoja de estilos principal. Contiene todos los estilos personalizados, incluido un sofisticado sistema de temas.
- **`script.js`**: Gestiona toda la interactividad general de la página.
- **`plano.js`**: Contiene toda la lógica de JavaScript específica para la función del plano interactivo.
- **`plano.svg`**: Un gráfico vectorial SVG detallado de las dos plantas del centro de convenciones. Este archivo es fundamental para la función del plano.
- **`plano-config.json`**: El archivo de configuración y datos para `plano.js`. Define las capas del mapa, los detalles de las plantas y el contenido de todos los pop-ups interactivos del plano.
- **`hack.js`**: Un archivo de utilidad especial que contiene una única función. **Este archivo no debe ser modificado.**

---

## 4. Funcionalidades Principales y Lógica

### 4.1. Sistema de Temas por Sección (`styles.css`)

El sitio web utiliza un sistema de temas dinámico basado en la sección visible en cada momento.

- Cada `<section>` tiene la clase `.snap-section` y una clase única como `.section-transporte`.
- En `styles.css`, cada clase específica de sección define un conjunto de variables CSS (`--section-theme-color`, `--section-theme-bg-color`, etc.).
- Los estilos de componentes genéricos (como `.btn-theme` y `.accordion-button`) utilizan estas variables.
- Cuando una sección se desplaza a la vista, sus colores de tema se aplican automáticamente a los componentes que contiene. Esto se gestiona con un `IntersectionObserver` en `script.js`.

### 4.2. Plano Interactivo (`plano.js` + `plano.svg` + `plano-config.json`)

Esta es la funcionalidad más compleja del sitio. Es un módulo autónomo que se ejecuta en un modal a pantalla completa.

- **Cómo funciona**:
    1.  **`plano.js`** utiliza **Leaflet.js** para crear un lienzo de mapa desplazable y ampliable.
    2.  Obtiene y superpone el archivo **`plano.svg`** en el mapa de Leaflet.
    3.  Obtiene **`plano-config.json`** para cargar todas las configuraciones, definiciones de capas, detalles de las plantas y el contenido de texto/HTML para cada punto interactivo.
    4.  El archivo SVG (`plano.svg`) tiene sus elementos organizados en grupos (`<g>`) con IDs específicos que corresponden a las capas y plantas definidas en el archivo de configuración.
- **Controlando el Mapa**:
    - La función global `plano(floor, layer, elementId)` es la forma principal de interactuar con el mapa desde `index.html`.
    - **`floor`**: `0` para Planta Baja, `1` para Planta Alta.
    - **`layer`**: Una clave de texto del objeto `layers` en `plano-config.json` (p. ej., 'departamentos', 'evacuacion').
    - **`elementId`**: El ID base de un elemento a resaltar (p. ej., 'AuditorioPrincipal'). El script encontrará los elementos correspondientes de icono (`icoAuditorioPrincipalPA`) y de resaltado (`hlAuditorioPrincipalPA`) en el SVG.
- **Modificando el Mapa**:
    - **Para añadir un nuevo punto interactivo**:
        1.  Añade un nuevo elemento de icono (p. ej., `<g id="icoNuevoPuntoPB">...`) al grupo de capa correcto en **`plano.svg`**.
        2.  Opcionalmente, añade una forma de resaltado (p. ej., `<g id="hlNuevoPuntoPB">...`).
        3.  Añade una nueva entrada en el objeto `informacion` en **`plano-config.json`** con la clave "NuevoPunto" (el ID base). Esta entrada debe contener el `title` y el `content` para el pop-up.
    - **Para cambiar el contenido de un pop-up**: Edita la entrada correspondiente en el objeto `informacion` en `plano-config.json`.

### 4.3. Datos Dinámicos desde Google Sheets (`script.js`)

El sitio obtiene datos en tiempo real para estacionamientos y rutas de autobús desde una hoja de cálculo pública de Google.

- El objeto `fuentesDatos` en `script.js` contiene las URLs y la configuración para cada fuente de datos.
- La función `mostrarDatos(tipo)` se llama cuando un usuario hace clic en un botón (p. ej., "Listado de cocheras").
- Obtiene los datos de la URL de Google Sheet (que utiliza el endpoint `/gviz/tq` para obtener una salida JSON), los procesa y rellena una tabla dentro de un modal.
- **Para actualizar estos datos, solo necesitas editar la propia hoja de Google.** No se requieren cambios en el código.

### 4.4. Enlaces de Mapa y Compartir (`script.js`)

- La función `abrirMapa(rawCoords, nombre, share)` gestiona todos los enlaces a mapas externos.
- Si `share` es `false` (por defecto), intenta abrir la ubicación en la aplicación de mapas nativa en móviles o en Google Maps en una nueva pestaña en el escritorio.
- Si `share` es `true`, utiliza la API Web Share (`navigator.share`) para abrir un diálogo de compartición nativo. En el escritorio, recurre a copiar la URL de Google Maps en el portapapeles.

## 5. Directrices y Convenciones de Desarrollo

- **Estilo de Botones**: Para crear un botón principal que coincida con el tema de la sección, utiliza las clases `btn btn-primary btn-theme`. La clase `.btn-theme` aplica los estilos personalizados y temáticos de la sección.
- **No Modificar `hack.js`**: Este archivo está aislado para un propósito específico y no debe ser alterado.
- **Gestión de Datos**: Para datos tabulares simples, prefiere usar la integración existente con Google Sheets. Para contenido relacionado con el plano, utiliza `plano-config.json`. Para contenido estático de la página, edita `index.html`.
- **Dependencias**: Todas las bibliotecas principales (Bootstrap, Leaflet) se cargan a través de CDN. No hay un proceso de compilación local ni un gestor de paquetes (como npm).

Esta documentación proporciona una visión general completa para mantener y ampliar el proyecto. Al comprender la separación de responsabilidades entre los diferentes archivos y la naturaleza basada en datos de las características principales, el desarrollo futuro debería ser sencillo.