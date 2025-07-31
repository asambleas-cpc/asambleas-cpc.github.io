<header class="section-header">
  <h1 class="display-4">Cómo llegar</h1>
</header>
<p>El predio se encuentra en el Parque Urquiza, a pocas cuadras del centro cívico y es accesible por varios
  medios de transporte. Elija un medio para más información</p>
<p><div class="btn-group" role="group" aria-label="Ubicación del CPC"><button class="btn btn-lg btn-primary btn-theme"
    onclick="abrirMapa('-31.721610,-60.52522','Centro Provincial de Convenciones')" role="button"
    target="_blank"><i class="material-symbols-outlined">pin_drop</i> Abrir ubicación</button>
  <button class="btn btn-lg btn-primary btn-theme"
    onclick="abrirMapa('-31.721610,-60.52522','Centro Provincial de Convenciones', true)" role="button"
    target="_blank"><i class="material-symbols-outlined">share</i></button></div></p>

<div class="accordion" id="accordionTransporte">
  <!-- Auto Particular -->
  <div class="accordion-item">
    <h5 class="accordion-header" id="collapseAuto">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
        data-bs-target="#collapseAuto" aria-expanded="false" aria-controls="collapseAuto">
        <i class="material-symbols-outlined me-2">directions_car</i> Auto particular
      </button>
      </h2>
      <div id="collapseAuto" class="accordion-collapse collapse" aria-labelledby="headingAuto"
        data-bs-parent="#accordionTransporte">
        <div class="accordion-body">

          <h5>Estacionamiento</h5>
          <ul>
            <li><strong>En las calles.</strong> En los alrededores del CPC hay abundantes lugares para
              estacionar
              en la calle. Sin embargo, generalmente hay cuidacoches.</li>
            <li><strong>Cocheras. </strong>Tambien hay disponibles estacionamientos pagos.<br> <button
                class="btn btn-md btn-primary btn-theme" onclick="mostrarDatos('estacionamiento')">
                Listado de cocheras en la zona del CPC
              </button></li>
            <li><strong>Asistentes con limitaciones.</strong> Hay un número limitado de espacios en el estacionamiento interno para personas con limitaciones físicas. Si considera que califica para solicitarlo, por
              favor, contáctese con los ancianos de su congregación. Tenga en cuenta que se van a controlar los
              números de patentes en el ingreso.</li>
          </ul>

          <h5>Recomendaciones</h5>
          <ul>
            <li>En las calles generalmente andan cuidacoches. Por lo general, es conveniente dejarles una propina.</li>
            <li>El parque es muy concurrido los fines de semana.</li>
          </ul>
        </div>
      </div>
  </div>

  <!-- Ómnibus interurbano -->
  <div class="accordion-item">
    <h5 class="accordion-header" id="headingInterurbano">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
        data-bs-target="#collapseInterurbano" aria-expanded="false" aria-controls="collapseInterurbano">
        <i class="material-symbols-outlined me-2">directions_bus</i> Ómnibus interurbanos
      </button>
      </h2>
      <div id="collapseInterurbano" class="accordion-collapse collapse" aria-labelledby="headingInterurbano"
        data-bs-parent="#accordionTransporte">
        <div class="accordion-body">
          <h5>Servicios hasta la terminal de ómnibus</h5>
          <ul>
            <li><strong>Desde Santa Fe.</strong> Hay servicios cada 30 minutos. <a href="#auditorios">Ver
                horarios.</a></li>
            <li><strong>Desde el interior de Entre Ríos.</strong> Hay servicios diarios desde todas las
              localidades. <a href="#auditorios">Ver horarios.</a></li>
          </ul>
          <h5>Traslado desde la terminal hasta el CPC</h5>
          <p>El CPC se encuentra a X cuadras de la terminal.</p>
          <ul>
            <li><strong>Taxis, remises y aplicaciones.</strong> El costo ronda entre $X y $vX y se llega en X
              minutos. Para más detalles <a href="#auditorios">vea la sección más abajo</a>.</li>
            <li><strong>Colectivos urbanos.</strong> El pasaje sale $X, se paga con SUBE y se llega en X
              minutos.
              Para más detalles <a href="#auditorios">vea la sección de colectivos urbanos</a>.</li>
          </ul>
        </div>
      </div>
  </div>

  <!-- Colectivo urbano -->
  <div class="accordion-item">
    <h5 class="accordion-header" id="headingUrbano">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
        data-bs-target="#collapseUrbano" aria-expanded="false" aria-controls="collapseUrbano">
        <i class="material-symbols-outlined me-2">directions_bus</i> Colectivos urbanos
      </button>
      </h2>
      <div id="collapseUrbano" class="accordion-collapse collapse" aria-labelledby="headingUrbano"
        data-bs-parent="#accordionTransporte">
        <div class="accordion-body">
          <p>El transporte urbano de Paraná se abona utilizando la tarjeta SUBE. La tarifa única del pasaje es
            $X.
          </p>

          <button class="btn btn-primary btn-theme btn-md mt-2" onclick="mostrarDatos('colectivos')">
            Lista de líneas que llegan al CPC
          </button>
        </div>
      </div>
  </div>

  <!-- Taxis y Apps -->
  <div class="accordion-item">
    <h5 class="accordion-header" id="headingTaxi">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
        data-bs-target="#collapseTaxi" aria-expanded="false" aria-controls="collapseTaxi">
        <i class="material-symbols-outlined me-2">local_taxi</i> Taxis, remises y apps
      </button>
      </h2>
      <div id="collapseTaxi" class="accordion-collapse collapse" aria-labelledby="headingTaxi"
        data-bs-parent="#accordionTransporte">
        <div class="accordion-body">
          <p>Información sobre servicios disponibles.</p>
        </div>
      </div>
  </div>

  <!-- Transportes contratados -->
  <div class="accordion-item">
    <h5 class="accordion-header" id="headingShuttle">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
        data-bs-target="#collapseShuttle" aria-expanded="false" aria-controls="collapseShuttle">
        <i class="material-symbols-outlined me-2">airport_shuttle</i> Transportes contratados
      </button>
      </h2>
      <div id="collapseShuttle" class="accordion-collapse collapse" aria-labelledby="headingShuttle"
        data-bs-parent="#accordionTransporte">
        <div class="accordion-body">
<p>Hay un punto de descenso de pasajeros de ómnibus y trafics contratados, por calle Gregoria Matorras de San Martín (continuación de calle Corrientes), en el acceso al Centro Cultural la Vieja Usina.</p>
<div class="btn-group" role="group" aria-label="Ubicación del punto de descenso">
<button class="btn btn-md btn-primary btn-theme"
    onclick="abrirMapa('-31.722105,-60.523525','Centro Cultural la Vieja Usina')" role="button"
    target="_blank"><i class="material-symbols-outlined">pin_drop</i> Abrir ubicación</button>
    <button class="btn btn-md btn-primary btn-theme"
    onclick="abrirMapa('-31.722105,-60.523525','Centro Cultural la Vieja Usina', true)" role="button"
    target="_blank"><i class="material-symbols-outlined">share</i></button></div>
        </div>
      </div>
  </div>
</div>
<div class="card mt-2 ">
  <div class="card-body"><small>
      <strong>Aclaración:</strong> La información presentada es solamente a modo de referencia y pudiera estar
      sujeta a cambios. La
      organización del evento no está relacionada con los servicios presentados, no los promociona ni se
      responsabiliza por ellos.</small>
  </div>
</div>
