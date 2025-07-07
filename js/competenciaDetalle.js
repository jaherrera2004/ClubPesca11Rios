import { obtenerCompetenciaPorId, guardarCompetencia } from './db.js';
import Competencia from './modelos/Competencia.js';

// Obtener el ID de la competencia desde la URL
function getCompetenciaIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Renderizar los datos de la competencia
async function renderCompetencia() {
  const competenciaId = getCompetenciaIdFromUrl();
  if (!competenciaId) return;
  const data = await obtenerCompetenciaPorId(competenciaId);
  if (!data) {
    document.getElementById('nombreCompetencia').textContent = 'No encontrada';
    return;
  }
  // Reconstruir instancia de Competencia
  const competencia = await Competencia.fromJSON(data);
  document.getElementById('nombreCompetencia').textContent = competencia.nombre;
  document.getElementById('fechaCompetencia').textContent = competencia.fecha;
  document.getElementById('lugarCompetencia').textContent = competencia.lugar;

  // Configurar el estado con colores apropiados
  const estadoElement = document.getElementById('estadoCompetencia');
  estadoElement.textContent = competencia.estado;

  // Asignar color según el estado
  if (competencia.estado === 'Finalizado') {
    estadoElement.className = 'badge bg-danger'; // Rojo para finalizado
  } else if (competencia.estado === 'En curso') {
    estadoElement.className = 'badge bg-success'; // Verde para en curso
  } else {
    estadoElement.className = 'badge bg-secondary'; // Gris para otros estados
  }

  document.getElementById('descripcionCompetencia').textContent = competencia.descripcion || '-';
  document.getElementById('inscriptosCount').textContent = competencia.participantes.length;
  renderParticipantes(competencia);
  renderCapturas(competencia);
  cargarParticipantesEnSelect(competencia);

  // Ranking
  renderRanking(competencia);

  // Botón finalizar
  const btnFinalizar = document.getElementById('btnFinalizarCompetencia');
  if (btnFinalizar) {
    btnFinalizar.disabled = competencia.estado === 'Finalizado';
    btnFinalizar.classList.toggle('d-none', competencia.estado === 'Finalizado');
  }

  // Bloquear botones cuando la competencia está finalizada
  const esFinalizada = competencia.estado === 'Finalizado';

  // Botón inscribir participante
  const btnInscribirParticipante = document.querySelector('[data-bs-target="#inscribirParticipanteModal"]');
  if (btnInscribirParticipante) {
    btnInscribirParticipante.disabled = esFinalizada;
    if (esFinalizada) {
      btnInscribirParticipante.title = 'No se pueden inscribir participantes en una competencia finalizada';
    } else {
      btnInscribirParticipante.title = '';
    }
  }

  // Botón registrar captura
  const btnRegistrarCaptura = document.querySelector('[data-bs-target="#registrarCapturaModal"]');
  if (btnRegistrarCaptura) {
    btnRegistrarCaptura.disabled = esFinalizada;
    if (esFinalizada) {
      btnRegistrarCaptura.title = 'No se pueden registrar capturas en una competencia finalizada';
    } else {
      btnRegistrarCaptura.title = '';
    }
  }

  // Botones de editar y eliminar participantes
  const botonesEliminarParticipante = document.querySelectorAll('.eliminar-participante');
  botonesEliminarParticipante.forEach(btn => {
    btn.disabled = esFinalizada;
    if (esFinalizada) {
      btn.title = 'No se pueden eliminar participantes en una competencia finalizada';
    } else {
      btn.title = '';
    }
  });
}

function renderRanking(competencia) {
  // Limpiar contenido previo del modal
  const modalBody = document.querySelector('#rankingModal .modal-body');
  const podiosExistentes = modalBody.querySelectorAll('.podio-container');
  podiosExistentes.forEach(podio => podio.remove());

  const tbody = document.getElementById('tablaRanking');
  tbody.innerHTML = '';

  // Mostrar la tabla por defecto
  const tablaContainer = document.getElementById('tablaRankingContainer');
  const tabla = tablaContainer.querySelector('table');
  tabla.style.display = 'table';

  const ranking = competencia.getRanking();

  if (ranking.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-center py-3 text-muted">No hay datos de ranking disponibles</td></tr>';
    return;
  }

  // Crear podio para los primeros 3 lugares si existen
  if (ranking.length >= 1) {
    const podioHTML = crearPodio(ranking.slice(0, 3));
    const podioContainer = document.createElement('div');
    podioContainer.innerHTML = podioHTML;
    modalBody.insertBefore(podioContainer.firstElementChild, tablaContainer);
  }

  // Mostrar el resto de participantes en la tabla (desde el 4to lugar)
  if (ranking.length > 3) {
    ranking.slice(3).forEach((item, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="text-center">${idx + 4}</td>
        <td>${item.participante.getNombreCompleto()}</td>
        <td>${item.pesoTotal} g</td>
      `;
      tbody.appendChild(tr);
    });
  } else {
    // Si hay 3 o menos participantes, ocultar la tabla
    tbody.innerHTML = '';
    tabla.style.display = 'none';
  }
}

function crearPodio(topTres) {
  let podioHTML = `
    <div class="podio-container mb-4">
      <div class="row justify-content-center">
        <div class="col-12 text-center mb-3">
          <h4>Podio de Ganadores</h4>
        </div>
      </div>
      <div class="row justify-content-center align-items-end">
  `;

  // Segundo lugar (izquierda)
  if (topTres.length >= 2) {
    podioHTML += `
      <div class="col-4 text-center">
        <div class="podio-position" style="height: 120px; background: linear-gradient(135deg, #c0c0c0, #e8e8e8); border-radius: 10px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
          <div>
            <div class="fw-bold">2°</div>
          </div>
        </div>
        <div class="participant-info">
          <div class="fw-bold text-secondary">${topTres[1].participante.getNombreCompleto()}</div>
          <div class="text-muted">${topTres[1].pesoTotal} g</div>
        </div>
      </div>
    `;
  }

  // Primer lugar (centro, más alto)
  if (topTres.length >= 1) {
    podioHTML += `
      <div class="col-4 text-center">
        <div class="podio-position" style="height: 160px; background: linear-gradient(135deg, #ffd700, #ffed4e); border-radius: 10px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 12px rgba(0,0,0,0.3);">
          <div>
            <div class="fw-bold">1°</div>
          </div>
        </div>
        <div class="participant-info">
          <div class="fw-bold text-warning">${topTres[0].participante.getNombreCompleto()}</div>
          <div class="text-muted">${topTres[0].pesoTotal} g</div>
        </div>
      </div>
    `;
  }

  // Tercer lugar (derecha)
  if (topTres.length >= 3) {
    podioHTML += `
      <div class="col-4 text-center">
        <div class="podio-position" style="height: 100px; background: linear-gradient(135deg, #cd7f32, #deb887); border-radius: 10px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
          <div>
            <div class="fw-bold">3°</div>
          </div>
        </div>
        <div class="participant-info">
          <div class="fw-bold" style="color: #cd7f32;">${topTres[2].participante.getNombreCompleto()}</div>
          <div class="text-muted">${topTres[2].pesoTotal} g</div>
        </div>
      </div>
    `;
  }

  podioHTML += `
      </div>
    </div>
  `;

  return podioHTML;
}

let participanteAEliminarId = null;

// Renderizar la lista de participantes
function renderParticipantes(competencia) {
  // Solo renderizar en el modal de gestión ya que eliminamos el dropdown
  renderParticipantesModal(competencia);
}

// Renderizar la lista de participantes en el modal de gestión
function renderParticipantesModal(competencia) {
  const contenedor = document.getElementById('listaParticipantesModal');

  if (competencia.participantes.length === 0) {
    contenedor.innerHTML = `
      <div class="text-center py-4 text-muted">
        <i class="fa-solid fa-users fs-1 mb-3"></i>
        <p>No hay participantes inscritos</p>
        <button class="btn btn-success" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#inscribirParticipanteModal">
          <i class="fa-solid fa-user-plus me-2"></i>Inscribir primer participante
        </button>
      </div>
    `;
    return;
  }

  const esFinalizada = competencia.estado === 'Finalizado';

  let html = '<div class="row g-3">';

  competencia.participantes.forEach((participante, index) => {
    const totalCapturas = participante.capturas.length;
    const pesoTotal = participante.capturas.reduce((total, captura) => total + captura.peso, 0);

    html += `
      <div class="col-md-6">
        <div class="card border-light shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <h6 class="card-title mb-1">
                  <i class="fa-solid fa-user me-2 text-naranja"></i>
                  ${participante.getNombreCompleto()}
                </h6>
                <div class="small text-muted mb-2">
                  <div><i class="fa-solid fa-fish me-1"></i> ${totalCapturas} captura(s)</div>
                  <div><i class="fa-solid fa-weight-hanging me-1"></i> ${pesoTotal} g total</div>
                </div>
              </div>
              <div class="text-end">
                <span class="badge bg-secondary">#${index + 1}</span>
                <button class="btn btn-danger btn-sm ms-2 eliminar-participante-modal"
                        data-id="${participante.id}"
                        ${esFinalizada ? 'disabled' : ''}
                        ${esFinalizada ? 'title="No se pueden eliminar participantes en una competencia finalizada"' : ''}>
                  <i class="fa-solid fa-trash-alt"></i>
                </button>
              </div>
            </div>

            ${totalCapturas > 0 ? `
              <div class="mt-2">
                <small class="text-muted">Últimas capturas:</small>
                <div class="small">
                  ${participante.capturas.slice(-2).map(c =>
                    `<span class="badge bg-light text-dark me-1">${c.peso}g ${c.tipoPez ? '(' + c.tipoPez + ')' : ''}</span>`
                  ).join('')}
                </div>
              </div>
            ` : '<div class="mt-2"><small class="text-muted">Sin capturas registradas</small></div>'}
          </div>
        </div>
      </div>
    `;
  });

  html += '</div>';
  contenedor.innerHTML = html;

  // Agregar eventos a los botones de eliminar del modal
  const botonesEliminar = contenedor.querySelectorAll('.eliminar-participante-modal');
  botonesEliminar.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const participanteId = e.currentTarget.getAttribute('data-id');
      participanteAEliminarId = participanteId;

      // Cerrar el modal de participantes y abrir el de confirmación
      const modalParticipantes = bootstrap.Modal.getInstance(document.getElementById('participantesModal'));
      modalParticipantes.hide();

      const modalConfirmar = new bootstrap.Modal(document.getElementById('confirmarEliminarParticipanteModal'));
      modalConfirmar.show();
    });
  });
}

// Cargar la lista de participantes en el select para registrar capturas
function cargarParticipantesEnSelect(competencia) {
  const select = document.getElementById('participanteCaptura');
  select.innerHTML = '<option value="" selected disabled>Seleccionar participante</option>';

  if (competencia.participantes.length === 0) {
    select.innerHTML += '<option disabled>No hay participantes inscritos</option>';
    return;
  }

  competencia.participantes.forEach(p => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = p.getNombreCompleto();
    select.appendChild(option);
  });
}

// Variables para guardar referencias a la captura y participante a editar/eliminar
let capturaAEditarId = null;
let capturaAEliminarId = null;
let participanteEditandoCapturaId = null;
let participanteEliminandoCapturaId = null;

// Mostrar las capturas en la tabla con botones de edición y eliminación
function renderCapturas(competencia) {
  const tbody = document.getElementById('tablaCapturas');
  tbody.innerHTML = '';

  // Recopilar todas las capturas de todos los participantes
  const capturas = [];
  competencia.participantes.forEach(p => {
    p.capturas.forEach(c => {
      capturas.push({
        participante: p,
        captura: c
      });
    });
  });

  if (capturas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-3 text-muted">No hay capturas registradas</td></tr>';
    return;
  }

  // Ordenar capturas por fecha (más recientes primero)
  capturas.sort((a, b) => new Date(b.captura.fecha) - new Date(a.captura.fecha));

  const esFinalizada = competencia.estado === 'Finalizado';

  capturas.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.participante.getNombreCompleto()}</td>
      <td>${item.captura.tipoPez || '<span class="text-muted">No especificado</span>'}</td>
      <td>${item.captura.peso} g</td>
      <td>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-primary btn-editar-captura" data-participante-id="${item.participante.id}" data-captura-id="${item.captura.id}" ${esFinalizada ? 'disabled' : ''}>
            <i class="fa-solid fa-edit"></i>
          </button>
          <button class="btn btn-outline-danger btn-eliminar-captura" data-participante-id="${item.participante.id}" data-captura-id="${item.captura.id}" ${esFinalizada ? 'disabled' : ''}>
            <i class="fa-solid fa-trash-alt"></i>
          </button>
        </div>
      </td>
    `;

    // Agregar eventos a los botones solo si la competencia no está finalizada
    const btnEditar = tr.querySelector('.btn-editar-captura');
    const btnEliminar = tr.querySelector('.btn-eliminar-captura');

    if (!esFinalizada) {
      btnEditar.addEventListener('click', () => prepararEdicionCaptura(item.participante.id, item.captura.id));
      btnEliminar.addEventListener('click', () => prepararEliminarCaptura(item.participante.id, item.captura.id));
    } else {
      btnEditar.title = 'No se pueden editar capturas en una competencia finalizada';
      btnEliminar.title = 'No se pueden eliminar capturas en una competencia finalizada';
    }

    tbody.appendChild(tr);
  });
}

// Preparar la edición de una captura
async function prepararEdicionCaptura(participanteId, capturaId) {
  const competenciaId = getCompetenciaIdFromUrl();
  const data = await obtenerCompetenciaPorId(competenciaId);
  if (!data) return;

  const competencia = await Competencia.fromJSON(data);
  const participante = competencia.getParticipantePorId(participanteId);

  if (participante) {
    const captura = participante.getCapturaPorId(capturaId);
    if (captura) {
      // Guardar referencias
      capturaAEditarId = capturaId;
      participanteEditandoCapturaId = participanteId;

      // Llenar el formulario de edición
      document.getElementById('participanteCapturaEditar').value = participante.getNombreCompleto();
      document.getElementById('tipoPezEditar').value = captura.tipoPez || '';
      document.getElementById('pesoCapturaEditar').value = captura.peso;

      // Mostrar el modal
      const modal = new bootstrap.Modal(document.getElementById('editarCapturaModal'));
      modal.show();
    }
  }
}

// Guardar los cambios de la captura editada
async function guardarCapturaeditada() {
  const tipoPez = document.getElementById('tipoPezEditar').value.trim();
  const peso = document.getElementById('pesoCapturaEditar').value;

  if (!peso || isNaN(peso) || peso <= 0) {
    alert('Por favor, especifique un peso válido (mayor a 0)');
    return;
  }

  const competenciaId = getCompetenciaIdFromUrl();
  const data = await obtenerCompetenciaPorId(competenciaId);
  if (!data) return;

  const competencia = await Competencia.fromJSON(data);
  const participante = competencia.getParticipantePorId(participanteEditandoCapturaId);

  if (participante) {
    // Actualizar la captura
    participante.actualizarCaptura(capturaAEditarId, {
      tipoPez: tipoPez,
      peso: Number(peso)
    });

    // Guardar en IndexedDB
    await guardarCompetencia(competencia.toJSON());

    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editarCapturaModal'));
    modal.hide();

    // Actualizar la interfaz
    renderCompetencia();

    // Limpiar referencias
    capturaAEditarId = null;
    participanteEditandoCapturaId = null;
  }
}

// Preparar la eliminación de una captura
function prepararEliminarCaptura(participanteId, capturaId) {
  capturaAEliminarId = capturaId;
  participanteEliminandoCapturaId = participanteId;

  // Mostrar el modal de confirmación
  const modal = new bootstrap.Modal(document.getElementById('confirmarEliminarCapturaModal'));
  modal.show();
}

// Eliminar la captura
async function eliminarCaptura() {
  const competenciaId = getCompetenciaIdFromUrl();
  const data = await obtenerCompetenciaPorId(competenciaId);
  if (!data) return;

  const competencia = await Competencia.fromJSON(data);
  const participante = competencia.getParticipantePorId(participanteEliminandoCapturaId);

  if (participante) {
    // Eliminar la captura
    participante.eliminarCaptura(capturaAEliminarId);

    // Guardar en IndexedDB
    await guardarCompetencia(competencia.toJSON());

    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('confirmarEliminarCapturaModal'));
    modal.hide();

    // Actualizar la interfaz
    renderCompetencia();

    // Limpiar referencias
    capturaAEliminarId = null;
    participanteEliminandoCapturaId = null;
  }
}

async function agregarParticipante() {
  const nombre = document.getElementById('nombreParticipante').value.trim();
  const apellido = document.getElementById('apellidoParticipante').value.trim();
  if (!nombre) {
    alert('El nombre es obligatorio');
    return;
  }
  const competenciaId = getCompetenciaIdFromUrl();
  const data = await obtenerCompetenciaPorId(competenciaId);
  if (!data) return;
  const { default: Participante } = await import('./modelos/Participante.js');
  const competencia = await Competencia.fromJSON(data);
  competencia.agregarParticipante(new Participante(nombre, apellido));
  await guardarCompetencia(competencia.toJSON());
  document.getElementById('nombreParticipante').value = '';
  document.getElementById('apellidoParticipante').value = '';
  const modal = bootstrap.Modal.getInstance(document.getElementById('inscribirParticipanteModal'));
  modal.hide();
  renderCompetencia();
}

// Registrar una nueva captura
async function registrarCaptura() {
  const participanteId = document.getElementById('participanteCaptura').value;
  const tipoPez = document.getElementById('tipoPez').value.trim();
  const peso = document.getElementById('pesoCaptura').value;

  if (!participanteId || !peso || isNaN(peso) || peso <= 0) {
    alert('Por favor, seleccione un participante y especifique un peso válido (mayor a 0)');
    return;
  }

  const competenciaId = getCompetenciaIdFromUrl();
  const data = await obtenerCompetenciaPorId(competenciaId);
  if (!data) return;

  const competencia = await Competencia.fromJSON(data);
  const participante = competencia.getParticipantePorId(participanteId);

  if (!participante) {
    alert('El participante seleccionado no existe');
    return;
  }

  // Importar la clase Captura
  const { default: Captura } = await import('./modelos/Captura.js');

  // Crear la captura y añadirla al participante
  try {
    const captura = new Captura(Number(peso), tipoPez);
    participante.capturas.push(captura);

    // Guardar en IndexedDB
    await guardarCompetencia(competencia.toJSON());

    // Limpiar el formulario
    document.getElementById('participanteCaptura').value = '';
    document.getElementById('tipoPez').value = '';
    document.getElementById('pesoCaptura').value = '';

    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('registrarCapturaModal'));
    modal.hide();

    // Actualizar la interfaz
    renderCompetencia();
  } catch (error) {
    alert(`Error al registrar la captura: ${error.message}`);
  }
}

// Eliminar participante
async function eliminarParticipante(participanteId) {
  const competenciaId = getCompetenciaIdFromUrl();
  const data = await obtenerCompetenciaPorId(competenciaId);
  if (!data) return;

  const competencia = await Competencia.fromJSON(data);
  if (competencia.eliminarParticipante(participanteId)) {
    // Guardar en IndexedDB
    await guardarCompetencia(competencia.toJSON());
    // Actualizar la interfaz
    renderCompetencia();
  }
}

// Finalizar competencia
async function finalizarCompetencia() {
  const competenciaId = getCompetenciaIdFromUrl();
  const data = await obtenerCompetenciaPorId(competenciaId);
  if (!data) return;

  const competencia = await Competencia.fromJSON(data);
  competencia.estado = 'Finalizado';

  // Guardar en IndexedDB
  await guardarCompetencia(competencia.toJSON());

  // Actualizar la interfaz
  renderCompetencia();
}

// Generar reporte PDF completo de la competencia
async function generarReportePDF() {
  const competenciaId = getCompetenciaIdFromUrl();
  if (!competenciaId) return;

  const data = await obtenerCompetenciaPorId(competenciaId);
  if (!data) return;

  const competencia = await Competencia.fromJSON(data);

  // Crear nuevo documento PDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Configuración de colores
  const colorNaranja = [255, 82, 3]; // #ff5203
  const colorGris = [128, 128, 128];
  const colorNegro = [0, 0, 0];

  let yPosition = 20;

  // === ENCABEZADO DEL REPORTE ===
  doc.setFillColor(...colorNaranja);
  doc.rect(0, 0, 210, 35, 'F');

  // Título del club
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('CLUB DE PESCA 11 RIOS', 105, 15, { align: 'center' });

  // Subtítulo
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Reporte de Competencia', 105, 25, { align: 'center' });

  yPosition = 50;

  // === INFORMACIÓN GENERAL DE LA COMPETENCIA ===
  doc.setTextColor(...colorNegro);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN GENERAL', 20, yPosition);

  yPosition += 10;
  doc.setDrawColor(...colorNaranja);
  doc.setLineWidth(1);
  doc.line(20, yPosition, 190, yPosition);

  yPosition += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  // Información básica
  const fechaFormateada = new Date(competencia.fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  doc.text(`Nombre: ${competencia.nombre}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Fecha: ${fechaFormateada}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Lugar: ${competencia.lugar}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Estado: ${competencia.estado}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Participantes inscritos: ${competencia.participantes.length}`, 20, yPosition);

  if (competencia.descripcion) {
    yPosition += 8;
    doc.text(`Descripción: ${competencia.descripcion}`, 20, yPosition);
  }

  yPosition += 20;

  // === LISTA DE PARTICIPANTES ===
  if (competencia.participantes.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('LISTA DE PARTICIPANTES', 20, yPosition);

    yPosition += 10;
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 15;

    // Crear tabla de participantes
    const participantesData = competencia.participantes.map((participante, index) => [
      (index + 1).toString(),
      participante.getNombreCompleto(),
      participante.capturas.length.toString(),
      participante.capturas.reduce((total, captura) => total + captura.peso, 0) + ' g'
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['#', 'Nombre Completo', 'Capturas', 'Peso Total']],
      body: participantesData,
      theme: 'striped',
      headStyles: {
        fillColor: colorNaranja,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [250, 250, 250] }
    });

    yPosition = doc.lastAutoTable.finalY + 20;
  }

  // === RANKING DE PARTICIPANTES ===
  const ranking = competencia.getRanking();

  if (ranking.length > 0) {
    // Nueva página si es necesario
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RANKING FINAL', 20, yPosition);

    yPosition += 10;
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 15;

    // Crear tabla del ranking
    const rankingData = ranking.map((item, index) => {
      let posicion;
      if (index === 0) posicion = '1° LUGAR';
      else if (index === 1) posicion = '2° LUGAR';
      else if (index === 2) posicion = '3° LUGAR';
      else posicion = `${index + 1}° LUGAR`;

      return [
        posicion,
        item.participante.getNombreCompleto(),
        `${item.pesoTotal} g`,
        `${item.participante.capturas.length} captura(s)`
      ];
    });

    doc.autoTable({
      startY: yPosition,
      head: [['Posición', 'Participante', 'Peso Total', 'Capturas']],
      body: rankingData,
      theme: 'striped',
      headStyles: {
        fillColor: colorNaranja,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [250, 250, 250] }
    });

    yPosition = doc.lastAutoTable.finalY + 20;
  }

  // === DETALLE DE CAPTURAS ===
  // Recopilar todas las capturas
  const todasLasCapturas = [];
  competencia.participantes.forEach(participante => {
    participante.capturas.forEach(captura => {
      todasLasCapturas.push({
        participante: participante.getNombreCompleto(),
        tipoPez: captura.tipoPez || 'No especificado',
        peso: captura.peso,
        fecha: new Date(captura.fecha).toLocaleDateString('es-ES')
      });
    });
  });

  if (todasLasCapturas.length > 0) {
    // Nueva página si es necesario
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('REGISTRO DE CAPTURAS', 20, yPosition);

    yPosition += 10;
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 15;

    // Ordenar capturas por peso (descendente)
    todasLasCapturas.sort((a, b) => b.peso - a.peso);

    const capturasData = todasLasCapturas.map(captura => [
      captura.participante,
      captura.tipoPez,
      `${captura.peso} g`,
      captura.fecha
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Participante', 'Tipo de Pez', 'Peso', 'Fecha']],
      body: capturasData,
      theme: 'striped',
      headStyles: {
        fillColor: colorNaranja,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [250, 250, 250] }
    });

    yPosition = doc.lastAutoTable.finalY + 20;
  }

  // === ESTADÍSTICAS ===
  if (todasLasCapturas.length > 0) {
    // Nueva página para estadísticas si es necesario
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ESTADÍSTICAS', 20, yPosition);

    yPosition += 10;
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 15;

    // Calcular estadísticas
    const totalCapturas = todasLasCapturas.length;
    const pesoTotal = todasLasCapturas.reduce((sum, c) => sum + c.peso, 0);
    const pesoPromedio = totalCapturas > 0 ? (pesoTotal / totalCapturas).toFixed(2) : 0;
    const capturaMasPesada = totalCapturas > 0 ? Math.max(...todasLasCapturas.map(c => c.peso)) : 0;
    const capturaMasLiviana = totalCapturas > 0 ? Math.min(...todasLasCapturas.map(c => c.peso)) : 0;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    doc.text(`- Total de capturas registradas: ${totalCapturas}`, 20, yPosition);
    yPosition += 8;
    doc.text(`- Peso total acumulado: ${pesoTotal} g`, 20, yPosition);
    yPosition += 8;
    doc.text(`- Peso promedio por captura: ${pesoPromedio} g`, 20, yPosition);
    yPosition += 8;
    doc.text(`- Captura más pesada: ${capturaMasPesada} g`, 20, yPosition);
    yPosition += 8;
    doc.text(`- Captura más liviana: ${capturaMasLiviana} g`, 20, yPosition);

    // Análisis por tipo de pez
    const tiposPez = {};
    todasLasCapturas.forEach(captura => {
      const tipo = captura.tipoPez === 'No especificado' ? 'Sin especificar' : captura.tipoPez;
      tiposPez[tipo] = (tiposPez[tipo] || 0) + 1;
    });

    if (Object.keys(tiposPez).length > 1) {
      yPosition += 15;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Distribución por Tipo de Pez:', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      Object.entries(tiposPez).forEach(([tipo, cantidad]) => {
        doc.text(`- ${tipo}: ${cantidad} captura(s)`, 20, yPosition);
        yPosition += 8;
      });
    }
  }

  // === PIE DE PÁGINA ===
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...colorGris);
    doc.text(`Reporte generado el ${new Date().toLocaleDateString('es-ES')} - Página ${i} de ${pageCount}`, 105, 285, { align: 'center' });
    doc.text('Club de Pesca 11 Rios - Sistema de Gestión de Competencias', 105, 290, { align: 'center' });
  }

  // Guardar el PDF
  const nombreArchivo = `Reporte_${competencia.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(nombreArchivo);
}

document.addEventListener('DOMContentLoaded', () => {
  renderCompetencia();

  // Agregar evento al botón de generar PDF
  document.getElementById('btnGenerarPDF').addEventListener('click', generarReportePDF);

  // Botón para ver ranking
  const btnVerRanking = document.getElementById('btnGenerarPDF').nextElementSibling;
  if (btnVerRanking) {
    btnVerRanking.addEventListener('click', async () => {
      // Actualizar el ranking antes de mostrar el modal
      const competenciaId = getCompetenciaIdFromUrl();
      if (!competenciaId) return;
      const data = await obtenerCompetenciaPorId(competenciaId);
      if (!data) return;
      const competencia = await Competencia.fromJSON(data);
      renderRanking(competencia);
    });
  }

  const btnConfirmarFinalizar = document.getElementById('btnConfirmarFinalizar');
  if (btnConfirmarFinalizar) {
    btnConfirmarFinalizar.addEventListener('click', () => {
      finalizarCompetencia();
      const modal = bootstrap.Modal.getInstance(document.getElementById('finalizarCompetenciaModal'));
      modal.hide();
    });
  }
  document.getElementById('btnGuardarParticipante').addEventListener('click', agregarParticipante);
  document.getElementById('btnGuardarCaptura').addEventListener('click', registrarCaptura);

  // Botón para confirmar eliminación de participante
  document.getElementById('btnConfirmarEliminarParticipante').addEventListener('click', () => {
    if (participanteAEliminarId) {
      eliminarParticipante(participanteAEliminarId);
      participanteAEliminarId = null;
      const modal = bootstrap.Modal.getInstance(document.getElementById('confirmarEliminarParticipanteModal'));
      modal.hide();
    }
  });

  // Botones para editar y eliminar capturas
  document.getElementById('btnGuardarCapturaEditada').addEventListener('click', guardarCapturaeditada);
  document.getElementById('btnConfirmarEliminarCaptura').addEventListener('click', eliminarCaptura);
});
