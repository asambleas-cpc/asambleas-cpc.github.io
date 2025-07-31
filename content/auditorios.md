<h1 class="display-4">Dónde ubicarse</h1>
<h3>Plano interactivo del CPC</h3>
<p>Contamos con un plano interactivo para conocer mejor el predio.</p>
<p><button class="btn btn-lg btn-primary btn-theme" onclick="plano()"><i class="material-symbols-outlined">map</i> Abrir plano
    del predio</button></p>

<h3>Auditorios</h3>
<p>El CPC tiene dos auditorios cómodos y climatizados. Para las asambleas, cada auditorio se asigna a un público específico.</p>
<div class="row">
  <div class="col-12 col-lg-6 mb-3">
    <div class="card d-flex flex-row align-items-stretch h-100 card-themed-icon" id="cardAuditorioPrincipal">
      <div class="icon-half">
        <i class="material-symbols-outlined">groups</i>
      </div>
      <div class="card-body">
        <h5 class="card-title">Auditorio principal: para el público en general</h5>
        <p class="card-text"></p>Se accede mediante las escaleras a la izquierda de la
        entrada.</p>
        <button class="btn btn-md btn-primary btn-theme" onclick="plano(1,'departamentos','AuditorioPrincipal')"><i
            class="material-symbols-outlined">map</i> Mostrar en el plano</button>
      </div>
    </div>
  </div>
  <div class="col-12 col-lg-6 mb-3">
    <div class="card d-flex flex-row align-items-stretch h-100 card-themed-icon" id="cardAuditorioAuxiliar">
      <div class="icon-half">
        <i class="material-symbols-outlined">assist_walker</i><i class="material-symbols-outlined">pregnancy</i>
      </div>
      <div class="card-body">
        <h5 class="card-title">Auditorio auxiliar: para personas con necesidades especiales</h5>
        <p class="card-text">Invitamos a las <strong>personas mayores, con dificultades, embarazadas o padres con niños
            pequeños</strong> a ubicarse en este auditorio.</p>
        <p class="card-text"></p>Se accede por el
        pasillo de la derecha de la entrada. </p>
        <button class="btn btn-md btn-primary btn-theme" onclick="plano(0,'departamentos','AuditorioAuxiliar')"><i
            class="material-symbols-outlined">map</i> Mostrar en el plano</button>
      </div>
    </div>
  </div>
</div>
<div class="row">
  <div class="col-12 col-lg-6 mb-3">
<div class="card d-flex flex-row align-items-stretch h-100 card-themed-icon card-comp mt-3"
  id="cardAuditorioCorrespondiente">
  <div class="icon-half">
    <i class="material-symbols-outlined">warning</i>
  </div>
  <div class="card-body">
    <h5 class="card-title mb-2">Es importante sentarse en el auditorio que corresponde</h5>
    <p class="card-text">El acceso al auditorio auxiliar es a nivel, mientras que al principal se accede por
      escaleras o ascensor. Ante una evacuación, se perdería tiempo valioso si no estamos donde nos
      corresponde.</p>
  </div>
</div>
  </div>
  <div class="col-12 col-lg-6 mb-3">
<div class="card d-flex flex-row align-items-stretch h-100 card-themed-icon mt-3" id="cardClimatizacion">
  <div class="icon-half">
    <i class="material-symbols-outlined">mode_cool</i>
  </div>
  <div class="card-body">
    <h5 class="card-title mb-2">Climatización</h5>
    <p class="card-text">Los auditorios están climatizados a 24°C en promedio, pero debido a la manera en que funciona el equipo, puede variar durante el día. Si se sufre el frío, es recomendable llevar un abrigo.</p>
  </div>
</div></div></div>
<h3>Instalaciones</h3>
<div class="accordion" id="accordionInstalaciones">
  <!-- Baños -->
  <div class="accordion-item">
    <h5 class="accordion-header" id="headingBanos">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseBanos" aria-expanded="false" aria-controls="collapseBanos">
        <i class="material-symbols-outlined me-2">wc</i> Baños
      </button>
    </h5>
    <div id="collapseBanos" class="accordion-collapse collapse" aria-labelledby="headingBanos" data-bs-parent="#accordionInstalaciones">
      <div class="accordion-body">
        El CPC cuenta con baños en ambas plantas. Es importante <strong>cuidar el consumo de agua,</strong> porque en eventos de uso intensivo se puede agotar el suministro.
        <p><button class="btn btn-sm btn-primary btn-theme" onclick="plano(0,'instalaciones','Banos')"><i class="material-symbols-outlined">map</i> Mostrar en planta baja</button> <button class="btn btn-sm btn-primary btn-theme" onclick="plano(1,'instalaciones','Banos')"><i class="material-symbols-outlined">map</i> Mostrar en planta alta</button></p>
      </div>
    </div>
  </div>
  <!-- Vestíbulos -->
  <div class="accordion-item">
    <h5 class="accordion-header" id="headingVestibulosInst">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseVestibulosInst" aria-expanded="false" aria-controls="collapseVestibulosInst">
        <i class="material-symbols-outlined me-2">groups</i> Vestíbulos
      </button>
    </h5>
    <div id="collapseVestibulosInst" class="accordion-collapse collapse" aria-labelledby="headingVestibulosInst" data-bs-parent="#accordionInstalaciones">
      <div class="accordion-body">
        <p></p>Los vestíbulos son amplios y luminosos, con vista al parque Urquiza y el río Paraná. Se pueden usar para comer y conversar durante los intermedios.</p>
        <p>En planta alta hay <strong>asientos para uso temporal,</strong> por lo que <strong>no se deben reservar.</strong></p>
        <p><button class="btn btn-sm btn-primary btn-theme" onclick="plano(0,'instalaciones','Vestibulo')"><i class="material-symbols-outlined">map</i> Mostrar en planta baja</button> <button class="btn btn-sm btn-primary btn-theme" onclick="plano(1,'instalaciones','Vestibulo')"><i class="material-symbols-outlined">map</i> Mostrar en planta alta</button></p>
      </div>
    </div>
  </div>
  <!-- Ascensores -->
  <div class="accordion-item">
    <h5 class="accordion-header" id="headingAscensores">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseAscensores" aria-expanded="false" aria-controls="collapseAscensores">
        <i class="material-symbols-outlined me-2">elevator</i> Ascensores
      </button>
    </h5>
    <div id="collapseAscensores" class="accordion-collapse collapse" aria-labelledby="headingAscensores" data-bs-parent="#accordionInstalaciones">
      <div class="accordion-body">
        Hay ascensores disponibles para acceder a la planta alta. Si se los utiliza en exceso, el sistema hidráulico se sobrecalienta y hay que clausurarlos. Padres, cuiden que sus hijos <strong>no jueguen con con ellos.</strong>
        <p><button class="btn btn-sm btn-primary btn-theme" onclick="plano(0,'instalaciones','Ascensores')"><i class="material-symbols-outlined">map</i> Mostrar en planta baja</button> <button class="btn btn-sm btn-primary btn-theme" onclick="plano(1,'instalaciones','Ascensores')"><i class="material-symbols-outlined">map</i> Mostrar en planta alta</button></p>
      </div>
    </div>
  </div>
  <!-- Galería cubierta y patios exteriores -->
  <div class="accordion-item">
    <h5 class="accordion-header" id="headingGaleria">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseGaleria" aria-expanded="false" aria-controls="collapseGaleria">
        <i class="material-symbols-outlined me-2">sunny</i> Galería cubierta y patios exteriores
      </button>
    </h5>
    <div id="collapseGaleria" class="accordion-collapse collapse" aria-labelledby="headingGaleria" data-bs-parent="#accordionInstalaciones">
      <div class="accordion-body">
        <p>La galería cubierta y el patio exterior tienen acceso al parque Urquiza. Son lugares ideales para comer y conversar durante los intermedios.</p>
        <p>En la galería hay <strong>asientos para uso temporal,</strong> por lo que <strong>no se deben reservar.</strong></p>
        <p><button class="btn btn-sm btn-primary btn-theme" onclick="plano(0,'instalaciones','Galeria')"><i class="material-symbols-outlined">map</i> Mostrar en el plano</button></p>
      </div>
    </div>
  </div>
  <!-- Estacionamiento interno -->
  <div class="accordion-item">
    <h5 class="accordion-header" id="headingEstacionamientoInterno">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseEstacionamientoInterno" aria-expanded="false" aria-controls="collapseEstacionamientoInterno">
        <i class="material-symbols-outlined me-2">directions_car</i> Estacionamiento interno
      </button>
    </h5>
    <div id="collapseEstacionamientoInterno" class="accordion-collapse collapse" aria-labelledby="headingEstacionamientoInterno" data-bs-parent="#accordionInstalaciones">
      <div class="accordion-body">
        Hay un número limitado de espacios<strong> para personas con limitaciones físicas.</strong> Si considera que califica para solicitarlo, por favor, contáctese con los ancianos de su congregación. Tenga en cuenta que se van a controlar los números de patentes en el ingreso.
        <p><button class="btn btn-sm btn-primary btn-theme" onclick="plano(0,'instalaciones','EstacionamientoInterno')"><i class="material-symbols-outlined">map</i> Mostrar en el plano</button></p>
      </div>
    </div>
  </div>
  <!-- Bautismo -->
  <div class="accordion-item">
    <h5 class="accordion-header" id="headingBautismo">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseBautismo" aria-expanded="false" aria-controls="collapseBautismo">
        <i class="material-symbols-outlined me-2">water</i> Bautismo
      </button>
    </h5>
    <div id="collapseBautismo" class="accordion-collapse collapse" aria-labelledby="headingBautismo" data-bs-parent="#accordionInstalaciones">
      <div class="accordion-body">
        <p>El bautismo se hace en el <a href="javascript:plano(0,'departamentos','Bautismo')" class="plano-link">patio cubierto.</a></p>
        <p>Los candidatos se deben ubicar <a href="javascript:plano(1,'departamentos','Bautismo')" class="plano-link">en las primeras filas </a>en la sesión del sábado por la mañana.</p>
      </div>
    </div>
  </div>
</div>
<div class="row">
  <div class="col-12 col-lg-6 mb-3">
    <div class="card d-flex flex-row align-items-stretch h-100 card-themed-icon card-comp mt-3" id="cardPrecauciones">
      <div class="icon-half">
        <i class="material-symbols-outlined">warning</i>
      </div>
      <div class="card-body">
        <h5 class="card-title mb-2">Precauciones</h5>
        <p class="card-text">El predio tiene escaleras y otros lugares que pueden ser peligrosos. Se recomienda <strong>circular con cuidado.</strong></p>
      </div>
    </div>
  </div>
  <div class="col-12 col-lg-6 mb-3">
    <div class="card d-flex flex-row align-items-stretch h-100 card-themed-icon card-comp mt-3" id="cardCuidadoNinos">
      <div class="icon-half">
        <i class="material-symbols-outlined">escalator_warning</i>
      </div>
      <div class="card-body">
        <h5 class="card-title mb-2">Padres, cuiden a sus hijos</h5>
        <p class="card-text">El predio y sus alrededores pueden ser peligrosos. Además, las puertas están abiertas al público en general. Por favor, cuiden que los niños no jueguen con los ascensores.</p>
      </div>
    </div>
  </div>
</div>
<h3>Departamentos</h3>
<div class="accordion" id="departamentosAccordion">
  <!-- Acomodadores -->
  <div class="accordion-item">
    <h5 class="accordion-header" id="headingAcomodadores">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
        data-bs-target="#collapseAcomodadores" aria-expanded="false" aria-controls="collapseAcomodadores">
        <i class="material-symbols-outlined me-2">face</i> Acomodadores
      </button>
      </h2>
      <div id="collapseAcomodadores" class="accordion-collapse collapse"
        aria-labelledby="headingAcomodadores" data-bs-parent="#departamentosAccordion">
        <div class="accordion-body">
              <p>Los acomodadores están para ayudarle. Coopere con ellos en todo y siga sus instrucciones sobre el estacionamiento, la circulación por los pasillos, la reserva de asientos y otros asuntos.</p>
              <p>Los encontrará distribuídos en todo el local. Hay un puesto permanente <a href="javascript:plano(0,'departamentos','Acomodadores')" class="plano-link">en el mostrador de planta baja</a></p>
        </div>
      </div>
  </div>
  <!-- Guardarropa y objetos perdidos -->
  <div class="accordion-item">
    <h5 class="accordion-header" id="headingObjetosPerdidos">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
        data-bs-target="#collapseObjetosPerdidos" aria-expanded="false" aria-controls="collapseObjetosPerdidos">
        <i class="material-symbols-outlined me-2">checked_bag_question</i> Guardarropa y objetos perdidos
      </button>
      </h2>
      <div id="collapseObjetosPerdidos" class="accordion-collapse collapse"
        aria-labelledby="headingObjetosPerdidos" data-bs-parent="#departamentosAccordion">
        <div class="accordion-body">
          
              <p>Todos los artículos extraviados se deben entregar en este departamento. Si ha perdido algo, vaya a ese lugar para buscar su pertenencia. También se debe llevar a este departamento a los niños que se hayan perdido.</p><p>Se encuentra <a href="javascript:plano(0,'departamentos','ObjetosPerdidos')" class="plano-link">en
              planta baja, junto con Guarda de alimentos</a>.</p>
        </div>
      </div>
  </div>
  <!-- Guarda de alimentos -->
  <div class="accordion-item">
    <h5 class="accordion-header" id="headingGuardaAlimentos">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
        data-bs-target="#collapseGuardaAlimentos" aria-expanded="false" aria-controls="collapseGuardaAlimentos">
        <i class="material-symbols-outlined me-2">shopping_bag</i> Guarda de alimentos
      </button>
      </h2>
      <div id="collapseGuardaAlimentos" class="accordion-collapse collapse"
        aria-labelledby="headingGuardaAlimentos" data-bs-parent="#departamentosAccordion">
        <div class="accordion-body">
          <p>Es <a
                href="#alimentos">donde se guardan los alimentos</a> durante el programa. </p>
          <p>Hay un puesto <a
              href="javascript:plano(0,'departamentos','GuardaAlimentos')" class="plano-link">en planta baja</a>
            y otro <a href="javascript:plano(1,'departamentos','GuardaAlimentos')" class="plano-link">en planta
              alta</a>.</p>
        </div>
      </div>
  </div>
  <!-- Primeros auxilios -->
  <div class="accordion-item">
    <h5 class="accordion-header" id="headingPrimerosAuxilios">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
        data-bs-target="#collapsePrimerosAuxilios" aria-expanded="false"
        aria-controls="collapsePrimerosAuxilios">
        <i class="material-symbols-outlined me-2">health_cross</i> Primeros auxilios
      </button>
      </h2>
      <div id="collapsePrimerosAuxilios" class="accordion-collapse collapse"
        aria-labelledby="headingPrimerosAuxilios" data-bs-parent="#departamentosAccordion">
        <div class="accordion-body">
          <p>Se encuetra <a href="javascript:plano(0,'departamentos','PrimerosAuxilios')" class="plano-link">en
              planta baja</a> y hay una guardia <a href="javascript:plano(1,'departamentos','PrimerosAuxilios')"
              class="plano-link">en el auditorio de planta alta</a>.</p>
              <p>Tenga en cuenta que este departamento es <em>solo para casos de emergencia.</em></p>
        </div>
      </div>
  </div>
  <!-- Lactantes -->
  <div class="accordion-item">
    <h5 class="accordion-header" id="headingLactantes">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
        data-bs-target="#collapseLactantes" aria-expanded="false" aria-controls="collapseLactantes">
        <i class="material-symbols-outlined me-2">breastfeeding</i> Lactantes
      </button>
      </h2>
      <div id="collapseLactantes" class="accordion-collapse collapse" aria-labelledby="headingLactantes"
        data-bs-parent="#departamentosAccordion">
        <div class="accordion-body">
          <p>Se encuentra <a href="javascript:plano(0,'departamentos','Lactantes')" class="plano-link">en planta
              baja</a>.</p>
        </div>
      </div>
  </div>
  <!-- Información y servicio voluntario -->
  <div class="accordion-item">
    <h5 class="accordion-header" id="headingInformacion">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
        data-bs-target="#collapseInformacion" aria-expanded="false" aria-controls="collapseInformacion">
        <i class="material-symbols-outlined me-2">info</i> Información y servicio voluntario
      </button>
      </h2>
      <div id="collapseInformacion" class="accordion-collapse collapse" aria-labelledby="headingInformacion"
        data-bs-parent="#departamentosAccordion">
        <div class="accordion-body">
          <p>Si desea ofrecerse como voluntario para ayudar en los trabajos de la asamblea, preséntese este departamento</p>
          <p>Se encuentra <a href="javascript:plano(0,'departamentos','Informacion')" class="plano-link">en el
              mostrador de planta baja</a>.</p>
        </div>
      </div>
  </div>
  <!-- Limpieza -->
  <div class="accordion-item">
    <h5 class="accordion-header" id="headingLimpieza">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
        data-bs-target="#collapseLimpieza" aria-expanded="false" aria-controls="collapseLimpieza">
        <i class="material-symbols-outlined me-2">cleaning_services</i> Limpieza
      </button>
      </h2>
      <div id="collapseLimpieza" class="accordion-collapse collapse" aria-labelledby="headingLimpieza"
        data-bs-parent="#departamentosAccordion">
        <div class="accordion-body">
          <p>Se encuentra <a href="javascript:plano(1,'departamentos','Limpieza')" class="plano-link">en el
              vestíbulo de planta alta</a>.</p>
        </div>
      </div>
  </div>
</div>
<h5 class="d-none">Administración</h5>
<h5 class="d-none">Alojamiento</h5>
<p></p>

<h3 id="h3Emergencias">En caso de emergencias</h3>
<div class="row">
  <div class="col-12 col-lg-6 mb-3">
    <div class="card d-flex flex-row align-items-stretch h-100 card-themed-icon" id="cardGuardarAuto">
      <div class="icon-half">
        <i class="material-symbols-outlined">health_cross</i>
      </div>
      <div class="card-body">
        <h5 class="card-title">Emergencias médicas</h5>
        <p class="card-text">El departamento de primeros auxilios tiene un puesto en cada piso. Tenga en cuenta que este departamento es <em>solo para casos de emergencia.</em></p>
        <p class="card-text"> <button class="btn btn-md btn-primary btn-theme m-1" onclick="plano(0,'departamentos','PrimerosAuxilios')"><i class="material-symbols-outlined">map</i> Planta baja</button> <button
            class="btn btn-md btn-primary btn-theme m-1" onclick="plano(1,'departamentos','PrimerosAuxilios')"><i
              class="material-symbols-outlined">map</i> Planta alta</button></p>
      </div>
    </div>
  </div>
  <div class="col-12 col-lg-6 mb-3">
    <div class="card d-flex flex-row align-items-stretch h-100 card-themed-icon" id="cardGuardarAuto">
      <div class="icon-half">
        <i class="material-symbols-outlined">directions_run</i>
      </div>
      <div class="card-body">
        <h5 class="card-title">Plan de evacuación</h5>
        <p class="card-text">En el plano del predio se encuentra el plan de evacuación.</p>
        <p class="card-text"> <button class="btn btn-md btn-primary btn-theme m-1" onclick="plano(0,'evacuacion')"><i
              class="material-symbols-outlined">map</i> Planta baja</button> <button
            class="btn btn-md btn-primary btn-theme m-1" onclick="plano(1,'evacuacion')"><i
              class="material-symbols-outlined">map</i> Planta alta</button></p>
      </div>
    </div>
  </div>
  <div class="col-12 col-lg-6 mb-3">
    <a href="#" class="video-link text-body text-decoration-none" data-bs-toggle="modal"
      data-bs-target="#videoModal" data-video="videos/emergencias-movil.mp4">
      <div class="card d-flex flex-row align-items-stretch h-100 card-themed-icon" id="cardVideoEmergencias">
        <div class="icon-half">
          <i class="material-symbols-outlined">play_circle</i>
        </div>
        <div class="card-body">
          <h5 class="card-title">Video: Instrucciones para emergencias</h5>
          <p class="card-text">En este video hay instrucciones importantes para situaciones de emergencia.</p>
        </div>
      </div>
    </a>
  </div>
</div>
