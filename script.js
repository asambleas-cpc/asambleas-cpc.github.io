document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
  new bootstrap.Tooltip(el);
});

document.body.classList.add('js-enabled');

// const toggleBtn = document.getElementById('darkModeToggle');
// const rootElement = document.documentElement; // or document.body

// // On page load, read saved theme
// const savedTheme = localStorage.getItem('theme');
// if (savedTheme === 'dark') {
//   rootElement.classList.add('dark-mode');
// } else if (savedTheme === 'light') {
//   rootElement.classList.remove('dark-mode');
// }

// // Toggle function
// toggleBtn.addEventListener('click', () => {
//   if (rootElement.classList.contains('dark-mode')) {
//     rootElement.classList.remove('dark-mode');
//     localStorage.setItem('theme', 'light');
//   } else {
//     rootElement.classList.add('dark-mode');
//     localStorage.setItem('theme', 'dark');
//   }
// });

const getSectionBg = (id) =>
  getComputedStyle(document.documentElement).getPropertyValue(`--${id}-bg`).trim();

const container = document.querySelector('.snap-container');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      container.style.backgroundColor = getComputedStyle(entry.target).backgroundColor;
      entry.target.classList.add('visible');
    } else {
      entry.target.classList.remove('visible');
    }
  });
}, {
  threshold: 0.2, // lower threshold makes triggering easier on mobile
  rootMargin: '0px 0px -20% 0px' // trigger a bit earlier when scrolling up
});



document.querySelectorAll('.snap-section').forEach(section => {
  observer.observe(section);
});

// const myCarouselElement = document.querySelector('#carouselGuardaAlimentos')

// const carousel = new bootstrap.Carousel(myCarouselElement, {
//   interval: 2000,
//   touch: false
// })


document.body.classList.add('js-enabled');

document.querySelectorAll('.scrolling-cards-wrapper').forEach(wrapper => {
  const container = wrapper.querySelector('.scrolling-cards-container');
  const leftBtn = wrapper.querySelector('.scroll-left');
  const rightBtn = wrapper.querySelector('.scroll-right');

  leftBtn.addEventListener('click', () => {
    container.scrollBy({ left: -250, behavior: 'smooth' });
  });

  rightBtn.addEventListener('click', () => {
    container.scrollBy({ left: 250, behavior: 'smooth' });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('estacionamientoModal');
  modal.addEventListener('show.bs.modal', () => {
    const tbody = document.querySelector('#tabla-estacionamientos tbody');
    const loader = document.getElementById('tabla-loading');
    tbody.innerHTML = '';
    loader.style.display = 'block';

    fetch("https://docs.google.com/spreadsheets/d/1T32oH5vm0p9BGYICw8pe4tu_Q1FYzcoDm778ClFXyFY/gviz/tq?tqx=out:json&tq&gid=0")
      .then(res => res.text())
      .then(text => {
        const json = JSON.parse(text.substring(47).slice(0, -2));
        const rows = json.table.rows;

        console.log(text)

        for (const row of rows) {
          const c = row.c;
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${c[0]?.v || ''}<br>${c[1]?.v || ''}</td>
            <td>${c[2]?.v || ''} cuadras</td>
            <td>$ ${c[3]?.v || ''}</td>
            <td>
            <button class="btn btn-sm btn-outline-primary" onclick="abrirMapa('${c[5]?.v || ''}','${c[0]?.v || ''}')">
  <i class="bi bi-geo-alt-fill"></i> Ver en mapa
</button>
           
          `;
          tbody.appendChild(tr);
        }

        loader.style.display = 'none';
      })
      .catch(err => {
        loader.innerHTML = "Error al cargar los datos.";
        console.error("Error fetching estacionamientos:", err);
      });
  });
});

function abrirMapa(rawCoords, nombre = '') {
  // Clean up coordinates
  const [lat, lng] = rawCoords.trim().split(/\s*,\s*/);
  if (!lat || !lng) {
    alert('Coordenadas no válidas');
    return;
  }

  // Sanitize label
  const label = encodeURIComponent(nombre.trim());

  const geoUri = `geo:${lat},${lng}?q=${lat},${lng}(${label})`; // for Android
  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    window.location.href = geoUri;

    setTimeout(() => {
      window.open(gmapsUrl, '_blank');
    }, 800);
  } else {
    window.open(gmapsUrl, '_blank');
  }
}

  const videoModal = document.getElementById('videoModal');
  const customVideo = document.getElementById('customVideo');
  const videoSource = document.getElementById('videoSource');

  // When a thumbnail is clicked, update video source
  document.querySelectorAll('.video-link').forEach(link => {
    link.addEventListener('click', function () {
      const videoUrl = this.getAttribute('data-video');
      if (videoUrl) {
        videoSource.src = videoUrl;
        customVideo.load();
        customVideo.play();
      }
    });
  });

  // Stop and reset video on modal close
  videoModal.addEventListener('hidden.bs.modal', () => {
    customVideo.pause();
    customVideo.currentTime = 0;
    videoSource.src = "";
  });

    const navLinks = document.querySelectorAll('.navbar-collapse .nav-link');
  const navbarCollapse = document.querySelector('.navbar-collapse');

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const isVisible = window.getComputedStyle(navbarCollapse).display !== 'none';
      if (isVisible && navbarCollapse.classList.contains('show')) {
        new bootstrap.Collapse(navbarCollapse).hide();
      }
    });
  });

// --- Highlight active menu item on scroll ---
(function() {
  const navLinksHighlight = document.querySelectorAll('.navbar-nav .nav-link');
  const sectionIds = Array.from(navLinksHighlight)
    .map(link => link.getAttribute('href'))
    .filter(href => href && href.startsWith('#'))
    .map(href => href.slice(1));

  function highlightMenuOnScroll() {
    const navbarHeight = document.querySelector('.navbar').offsetHeight || 0;
    let currentSection = sectionIds[0];
    for (let i = sectionIds.length - 1; i >= 0; i--) {
      const section = document.getElementById(sectionIds[i]);
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= navbarHeight + 20) {
          currentSection = sectionIds[i];
          break;
        }
      }
    }
    navLinksHighlight.forEach(link => link.classList.remove('active'));
    const activeLink = Array.from(navLinksHighlight).find(link => link.getAttribute('href') === '#' + currentSection);
    if (activeLink) activeLink.classList.add('active');
  }

  window.addEventListener('scroll', highlightMenuOnScroll);
  window.addEventListener('resize', highlightMenuOnScroll);
  window.addEventListener('DOMContentLoaded', highlightMenuOnScroll);
  // Si el scroll principal ocurre en .snap-container, también escuchar ahí
  const snapContainer = document.querySelector('.snap-container');
  if (snapContainer) {
    snapContainer.addEventListener('scroll', highlightMenuOnScroll);
  }
})();

// Mostrar el logo solo si no es visible en el viewport
function isLogoVisible() {
  const logo = document.querySelector('.logo-responsive');
  if (!logo) return false;
  const rect = logo.getBoundingClientRect();
  return (
    rect.top < window.innerHeight &&
    rect.bottom > 0 &&
    rect.left < window.innerWidth &&
    rect.right > 0
  );
}

function toggleHeaderLogo() {
  const headerLogo = document.getElementById('header-logo-fixed');
  if (!headerLogo) return;
  if (isLogoVisible()) {
    // El logo principal está visible, ocultar el logo fijo
    headerLogo.style.visibility = 'hidden';
  } else {
    // El logo principal NO está visible, mostrar el logo fijo
    headerLogo.style.visibility = 'visible';
  }
}

window.addEventListener('scroll', toggleHeaderLogo);
window.addEventListener('resize', toggleHeaderLogo);
window.addEventListener('DOMContentLoaded', toggleHeaderLogo);
// Asegura que el evento scroll se escuche también en .snap-container
const snapContainer = document.querySelector('.snap-container');
if (snapContainer) {
  snapContainer.addEventListener('scroll', toggleHeaderLogo);
}

// Leaflet.js para mapa interactivo
(function() {
  if (!document.getElementById('map')) return;
  const leafletScript = document.createElement('script');
  leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  leafletScript.onload = function() {
    // Coordenadas del CPC Paraná
    var map = L.map('map').setView([-31.721610, -60.52522], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    L.marker([-31.721610, -60.52522]).addTo(map)
      .bindPopup('Centro Provincial de Convenciones')
      .openPopup();
  };
  document.body.appendChild(leafletScript);
})();

// Mantener el primer item del acordeón siempre abierto y abrir/cerrar los demás al hacer scroll
(function() {
  const accordion = document.getElementById('transporteAccordion');
  if (!accordion) return;
  const items = accordion.querySelectorAll('.accordion-item');
  if (!items.length) return;
  // Asegura que el primero esté abierto
  const firstCollapse = items[0].querySelector('.accordion-collapse');
  if (firstCollapse && !firstCollapse.classList.contains('show')) {
    firstCollapse.classList.add('show');
  }
  // Detecta scroll y abre/cierra acordeones según visibilidad
  function handleAccordionOnScroll() {
    items.forEach((item, idx) => {
      if (idx === 0) return; // El primero siempre abierto
      const collapse = item.querySelector('.accordion-collapse');
      const header = item.querySelector('.accordion-header');
      if (!collapse || !header) return;
      const rect = header.getBoundingClientRect();
      // Si el header está visible en el viewport, abre el item
      if (rect.top < window.innerHeight && rect.bottom > 80) {
        collapse.classList.add('show');
      } else {
        collapse.classList.remove('show');
      }
    });
  }
  window.addEventListener('scroll', handleAccordionOnScroll);
  window.addEventListener('resize', handleAccordionOnScroll);
  window.addEventListener('DOMContentLoaded', handleAccordionOnScroll);


  function updateScrollspyTarget() {
  const scrollspy = document.querySelector('[data-bs-spy="scroll"]');
  console.log(window.innerWidth)
  if (window.innerWidth >= 768) {
    scrollspy.setAttribute('data-bs-target', '#trasporte-md');
  } else {
    scrollspy.setAttribute('data-bs-target', '#trasporte-sm');
  }
  // Reinicializa el scrollspy
  bootstrap.ScrollSpy.getOrCreateInstance(scrollspy).refresh();
}

  document.addEventListener('scroll', updateScrollspyTarget);
  document.addEventListener('resize', updateScrollspyTarget);
  document.addEventListener('DOMContentLoaded', updateScrollspyTarget);

})();
