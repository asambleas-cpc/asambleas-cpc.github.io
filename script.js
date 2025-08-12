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
  threshold: 0.0 // Trigger when the element is fully out of view
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

document.querySelectorAll('.scroll-wrapper').forEach(wrapper => {
  const container = wrapper.querySelector('.scroll-inner-container');
  const leftBtn = wrapper.querySelector('.scroll-left');
  const rightBtn = wrapper.querySelector('.scroll-right');

  if (!container || !leftBtn || !rightBtn) return;

  leftBtn.addEventListener('click', () => {
    container.scrollBy({ left: -250, behavior: 'smooth' });
  });

  rightBtn.addEventListener('click', () => {
    container.scrollBy({ left: 250, behavior: 'smooth' });
  });
});

const fuentesDatos = {
  cocheras: {
    url: "https://docs.google.com/spreadsheets/d/1T32oH5vm0p9BGYICw8pe4tu_Q1FYzcoDm778ClFXyFY/gviz/tq?tqx=out:json&tq&gid=0",
    titulo: "Cocheras cercanas al CPC",
    subtitulo: "Seleccione una cochera para ver la ubicación.",
    columnas: ["Nombre", "Observaciones"],
    procesar: (c) => ([
      `<strong>${c[0]?.v || ''}</strong><br><small>${c[1]?.v || ''}</small> <span class="badge text-bg-success">${c[2]?.v || ''} min</span>`,
      `${c[4]?.v || ''}`
    ])
  },
    estacionamiento: {
    url: "https://docs.google.com/spreadsheets/d/1T32oH5vm0p9BGYICw8pe4tu_Q1FYzcoDm778ClFXyFY/gviz/tq?tqx=out:json&tq&gid=706768651",
    titulo: "Estacionamiento cercano al CPC",
    subtitulo: "Seleccione un estacionamiento para ver la ubicación.",
    columnas: ["Lugar", "Observaciones"],
    procesar: (c) => ([
      `${c[0]?.v || ''} <span class="badge text-bg-success">${c[1]?.v || ''} min</span>`,
      `${c[2]?.v || ''}`
    ])
  },
  colectivos: {
    url: "https://docs.google.com/spreadsheets/d/1T32oH5vm0p9BGYICw8pe4tu_Q1FYzcoDm778ClFXyFY/gviz/tq?tqx=out:json&tq&gid=1511722551",
    titulo: "Líneas de colectivos que llegan al CPC",
    subtitulo: "Seleccione una parada para ver el camino de la parada al CPC.",
    columnas: ["Línea (Ramal)", "Parada (Distancia)"],
    procesar: (c) => ([
      `${(c[0]?.v || '').split(',').map(item => `<span class="badge text-bg-secondary">${item.trim()}</span>`).join(' ')}<br> ${(c[1]?.v || '').split(',').map(item => `<span class="badge text-bg-light">${item.trim()}</span>`).join(' ')}`,
      `${c[3]?.v || ''}<br><span class="badge text-bg-success">${c[4]?.v || ''} min</span>`
      
    ])
    
  }
};

// Pre-populates a table with data from a Google Sheet.
function populateTable(tipo) {
  const config = fuentesDatos[tipo];
  if (!config) return;

  const tbody = document.getElementById(`tbody-${tipo}`);
  const loader = document.getElementById('tabla-loading');
  
  if(tbody) {
    loader.style.display = 'block';
    fetch(config.url)
      .then(res => res.text())
      .then(text => {
        const json = JSON.parse(text.substring(47).slice(0, -2));
        const rows = json.table.rows;

        rows.forEach(row => {
          const c = row.c;
          const tr = document.createElement('tr');
          const cells = config.procesar(c);
          tr.innerHTML = cells.map(cell => `<td>${cell}</td>`).join('');

          let coords = '';
          let nombre = '';
          let walking = false;

          if (tipo === 'colectivos') {
            coords = c[5]?.v || '';
            nombre = 'Parada ' + (c[1]?.v || '');
            walking = true;
          } else if (tipo === 'cocheras') {
            coords = c[5]?.v || '';
            nombre = c[0]?.v || '';
          } else if (tipo === 'estacionamiento') {
            coords = c[3]?.v || '';
            nombre = 'Estacionamiento en ' + c[0]?.v || '';
          }

          if (coords) {
            tr.style.cursor = 'pointer';
            tr.setAttribute('role', 'link');
            tr.onclick = () => abrirMapa(coords, nombre, false, walking);
          }

          tbody.appendChild(tr);
        });
        loader.style.display = 'none';
      })
      .catch(err => {
        tbody.innerHTML = `<tr><td colspan="${config.columnas.length}">Error al cargar los datos.</td></tr>`;
        console.error(`Error fetching data for ${tipo}:`, err);
        loader.style.display = 'none';
      });
  }
}

// New function to show the pre-populated modal
function mostrarDatos(tipo) {
  const config = fuentesDatos[tipo];
  if (!config) return;

  const modalEl = document.getElementById('infoModal');
  // Get existing instance or create a new one to prevent issues
  const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
  const titulo = document.getElementById('infoModalLabel');
  const subtitulo = document.getElementById('infoModalSubtitle');
  
  titulo.textContent = config.titulo;
  subtitulo.textContent = config.subtitulo || '';

  document.querySelectorAll('.data-table').forEach(table => {
    table.style.display = 'none';
  });

  const tableToShow = document.getElementById(`tabla-${tipo}`);
  if (tableToShow) {
    tableToShow.style.display = 'table';
  }

  modal.show();
}

function abrirMapa(rawCoords, nombre = '', share = false, walking = false) {
  const DESTINATION_COORDS = '-31.721622,-60.525844';

  // Handle walking directions to the hardcoded destination
  if (walking) {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${rawCoords}&destination=${DESTINATION_COORDS}&travelmode=walking`;
    window.open(url, '_blank');
    return;
  }

  // Clean up coordinates for general purpose use
  const [lat, lng] = rawCoords.trim().split(/\s*,\s*/);
  if (!lat || !lng) {
    alert('Coordenadas no válidas');
    return;
  }
  
  // Sanitize label
  const label = encodeURIComponent(nombre.trim());
  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  if (share) {
    if (navigator.share) {
      navigator.share({
        title: `Ubicación: ${nombre}`,
        text: `Ubicación por GPS de "${nombre}"`,
        url: gmapsUrl,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(gmapsUrl).then(() => {
        alert('Enlace de la ubicación copiado al portapapeles.');
      }).catch(err => {
        console.error('Could not copy text: ', err);
        alert('No se pudo copiar el enlace. Abriendo en una nueva pestaña para que puedas copiarlo manualmente.');
        window.open(gmapsUrl, '_blank');
      });
    }
  } else {
    const geoUri = `geo:${lat},${lng}?q=${lat},${lng}(${label})`; // for Android
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

document.querySelectorAll('[data-bs-toggle="lightbox"]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const lightbox = new Lightbox(el);
    lightbox.show();
  });
});

// Back to Top Button Logic
const backToTopBtn = document.getElementById('backToTopBtn');
const inicioSection = document.getElementById('intro');

const btnObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });
}, {
  threshold: 0.1 // Triggers when 10% of the section is out of view
});

if (inicioSection) {
  btnObserver.observe(inicioSection);
}

// Function to set a cookie
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Function to get a cookie
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', (event) => {
    // Select all checkboxes within the cardAntesDeAsistir element
    const checkboxes = document.querySelectorAll('#cardAntesDeAsistir .custom-checkbox-input');

    checkboxes.forEach(function(checkbox) {
        // Create a unique cookie name for each checkbox
        const cookieName = 'checkbox_' + checkbox.id;

        // Check if a cookie exists for this checkbox and set its state
        const cookieValue = getCookie(cookieName);
        if (cookieValue !== null) {
            checkbox.checked = (cookieValue === 'true');
        }

        // Add an event listener to save the state of the checkbox when it's changed
        checkbox.addEventListener('change', function() {
            setCookie(cookieName, this.checked, 365); // Save for 1 year
        });
    });

    populateTable('cocheras');
    populateTable('estacionamiento');
    populateTable('colectivos');
  
    // --- Final, Corrected Back Button Modal Dismissal Logic ---
    const modals = Array.from(document.querySelectorAll('.modal'));
  
    modals.forEach(modal => {
      // When a modal is shown, push a new state to the history.
      modal.addEventListener('show.bs.modal', () => {
        const hash = `#${modal.id}`;
        if (window.location.hash !== hash) {
          history.pushState({ modalId: modal.id }, '', hash);
        }
      });
  
      // When a modal is hidden (by any means).
      modal.addEventListener('hidden.bs.modal', () => {
        // If the hash in the URL still corresponds to the modal being closed,
        // it means the user closed it manually (e.g., Esc, close button),
        // not with the back button. We need to clean up the URL.
        if (window.location.hash === `#${modal.id}`) {
          // Replace the current history state to remove the hash without
          // navigating. This prevents the "double back" issue.
          history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      });
    });
  
    // Listen for the browser's back/forward navigation.
    window.addEventListener('popstate', () => {
      const openModal = document.querySelector('.modal.show');
      // If there's an open modal but the URL hash doesn't match it
      // (i.e., the hash was removed by the back button), hide the modal.
      if (openModal && window.location.hash !== `#${openModal.id}`) {
        const modalInstance = bootstrap.Modal.getInstance(openModal);
        if (modalInstance) {
          modalInstance.hide();
        }
      }
    });
});