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
    columnas: ["Nombre", "Distancia del CPC (cuadras)", "Costo", ""],
    procesar: (c) => ([
      `<a href="javascript:abrirMapa('${c[5]?.v || ''}','${c[0]?.v || ''}')" class="geo-link"><strong>${c[0]?.v || ''}</strong><br><small>${c[1]?.v || ''}</small></a>`,
      `${c[2]?.v || ''} `,
      `${c[3]?.v || ''}`
    ])
  },
    estacionamiento: {
    url: "https://docs.google.com/spreadsheets/d/1T32oH5vm0p9BGYICw8pe4tu_Q1FYzcoDm778ClFXyFY/gviz/tq?tqx=out:json&tq&gid=0",
    titulo: "Estacionamiento cercano al CPC",
    columnas: ["Lugar", "Distancia del CPC (cuadras)", "Comentaios"],
    procesar: (c) => ([
      `<a href="javascript:abrirMapa('${c[4]?.v || ''}','${c[0]?.v || ''}')" class="geo-link">${c[0]?.v || ''}</a>`,
      `${c[1]?.v || ''}`,
      `${c[2]?.v || ''}`
    ])
  },
  colectivos: {
    url: "https://docs.google.com/spreadsheets/d/1T32oH5vm0p9BGYICw8pe4tu_Q1FYzcoDm778ClFXyFY/gviz/tq?tqx=out:json&tq&gid=1511722551",
    titulo: "Líneas de colectivos que llegan al CPC",
    columnas: ["Línea - Ramal", "Parada (nro.)", "Distancia del CPC (cuadras)"],
    procesar: (c) => ([
      `<strong>${c[0]?.v || ''}</strong><br>${c[1]?.v || ''}`,
      `<a href="javascript:abrirMapa('${c[5]?.v || ''}','',false,true)" class="geo-link">${c[3]?.v || ''}</a>`,
      `${c[4]?.v || ''}`
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

  const modal = new bootstrap.Modal(document.getElementById('infoModal'));
  const titulo = document.getElementById('infoModalLabel');
  
  // Set title
  titulo.textContent = config.titulo;

  // Hide all tables first
  document.querySelectorAll('.data-table').forEach(table => {
    table.style.display = 'none';
  });

  // Show the correct one
  const tableToShow = document.getElementById(`tabla-${tipo}`);
  if (tableToShow) {
    tableToShow.style.display = 'table';
  }

  modal.show();
}

// Populate all tables on page load
document.addEventListener('DOMContentLoaded', () => {
  populateTable('cocheras');
  populateTable('estacionamiento');
  populateTable('colectivos');
});



// document.addEventListener('DOMContentLoaded', () => {
//   const modal = document.getElementById('estacionamientoModal');
//   modal.addEventListener('show.bs.modal', () => {
//     const tbody = document.querySelector('#tabla-estacionamientos tbody');
//     const loader = document.getElementById('tabla-loading');
//     tbody.innerHTML = '';
//     loader.style.display = 'block';

//     fetch("https://docs.google.com/spreadsheets/d/1T32oH5vm0p9BGYICw8pe4tu_Q1FYzcoDm778ClFXyFY/gviz/tq?tqx=out:json&tq&gid=0")
//       .then(res => res.text())
//       .then(text => {
//         const json = JSON.parse(text.substring(47).slice(0, -2));
//         const rows = json.table.rows;

//         console.log(text)

//         for (const row of rows) {
//           const c = row.c;
//           const tr = document.createElement('tr');
//           tr.innerHTML = `
//             <td>${c[0]?.v || ''}<br>${c[1]?.v || ''}</td>
//             <td>${c[2]?.v || ''} cuadras</td>
//             <td>$ ${c[3]?.v || ''}</td>
//             <td>
//             <button class="btn btn-sm btn-outline-primary" onclick="abrirMapa('${c[5]?.v || ''}','${c[0]?.v || ''}')">
//   <i class="bi bi-geo-alt-fill"></i> Ver en mapa
// </button>
           
//           `;
//           tbody.appendChild(tr);
//         }

//         loader.style.display = 'none';
//       })
//       .catch(err => {
//         loader.innerHTML = "Error al cargar los datos.";
//         console.error("Error fetching estacionamientos:", err);
//       });
//   });
// });

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
});