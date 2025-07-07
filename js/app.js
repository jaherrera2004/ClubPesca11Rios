import { guardarCompetencia, obtenerCompetencias, obtenerCompetenciaPorId } from './db.js';
import Competencia from './modelos/Competencia.js';

// Cargar competencias desde IndexedDB
async function cargarCompetencias() {
  const contenedor = document.getElementById("competenciasContainer");
  contenedor.innerHTML = "";
  const competencias = await obtenerCompetencias();
  if (!competencias || competencias.length === 0) {
    contenedor.innerHTML = `
      <div class="w-100 h-100 d-flex justify-content-center align-items-center" style="min-height: 300px;">
        <div class="text-center">
          <i class="bi bi-emoji-frown display-1 text-muted"></i>
          <p class="lead mt-3">No hay competencias programadas en este momento.</p>
          <button class="btn btn-primary mt-2" data-bs-toggle="modal" data-bs-target="#nuevaCompetenciaModal">
            <i class="bi bi-plus-circle me-2"></i>Agregar primera competencia
          </button>
        </div>
      </div>
    `;
    return;
  }
  competencias.forEach(competencia => crearTarjetaCompetencia(competencia));
}

let competenciaAEliminarId = null;

function crearTarjetaCompetencia(competencia) {
  const template = document.getElementById("competenciaTemplate");
  const clone = template.content.cloneNode(true);
  const fechaObj = new Date(competencia.fecha);
  const fechaFormateada = `${fechaObj.getDate().toString().padStart(2, '0')}/${(fechaObj.getMonth() + 1).toString().padStart(2, '0')}/${fechaObj.getFullYear()}`;
  clone.querySelector(".card-title").textContent = competencia.nombre;
  clone.querySelector(".fecha-competencia").textContent = fechaFormateada;
  clone.querySelector(".lugar-competencia").textContent = competencia.lugar;
  const estadoElement = clone.querySelector(".estado-competencia");
  estadoElement.textContent = competencia.estado;
  estadoElement.classList.add(competencia.estado === 'En curso' ? 'bg-success' : 'bg-secondary');

  // Usar las nuevas clases naranjas personalizadas
  clone.querySelector(".card-header").classList.add("bg-naranja");
  clone.querySelector(".card").classList.add("card-hover-naranja");
  clone.querySelector(".btn-ver-detalles").classList.replace("btn-ver-detalles", "btn-outline-naranja");

  // Botón eliminar (izquierda)
  const btnEliminar = document.createElement('button');
  btnEliminar.className = 'btn btn-danger flex-fill';
  btnEliminar.textContent = 'Eliminar';
  btnEliminar.addEventListener('click', (e) => {
    e.stopPropagation();
    competenciaAEliminarId = competencia.id;
    const modal = new bootstrap.Modal(document.getElementById('confirmarEliminarModal'));
    modal.show();
  });

  // Botón ver detalles (derecha) - corregir el selector
  const btnDetalles = clone.querySelector('.btn-outline-naranja');
  btnDetalles.classList.add('flex-fill');
  btnDetalles.setAttribute('data-id', competencia.id);
  btnDetalles.textContent = 'Ver detalles';
  btnDetalles.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = `competenciaDetalle.html?id=${competencia.id}`;
  });

  // Contenedor de botones en fila
  const btnsContainer = clone.querySelector('.d-grid.gap-2');
  btnsContainer.classList.remove('d-grid');
  btnsContainer.classList.add('d-flex', 'gap-2');
  btnsContainer.innerHTML = '';
  btnsContainer.appendChild(btnEliminar);
  btnsContainer.appendChild(btnDetalles);
  document.getElementById("competenciasContainer").appendChild(clone);
}

// Guardar nueva competencia en IndexedDB
async function guardarNuevaCompetencia() {
  const nombre = document.getElementById("nombreCompetencia").value.trim();
  const fecha = document.getElementById("fechaCompetencia").value;
  const lugar = document.getElementById("lugarCompetencia").value.trim();
  const descripcion = document.getElementById("descripcionCompetencia").value.trim();
  if (!nombre || !fecha || !lugar) {
    alert("Por favor completa todos los campos requeridos");
    return;
  }
  const competencia = new Competencia(nombre, fecha, lugar, descripcion);
  await guardarCompetencia(competencia.toJSON());
  cargarCompetencias();
  document.getElementById("nombreCompetencia").value = "";
  document.getElementById("fechaCompetencia").value = "";
  document.getElementById("lugarCompetencia").value = "";
  document.getElementById("descripcionCompetencia").value = "";
  const modal = bootstrap.Modal.getInstance(document.getElementById("nuevaCompetenciaModal"));
  modal.hide();
}

async function eliminarCompetencia(id) {
  await import('./db.js').then(({ eliminarCompetencia }) => eliminarCompetencia(id));
  cargarCompetencias();
}

document.addEventListener("DOMContentLoaded", () => {
  cargarCompetencias();
  const btnGuardar = document.querySelector("#nuevaCompetenciaModal .btn-naranja");
  btnGuardar.addEventListener("click", guardarNuevaCompetencia);
  document.getElementById('btnConfirmarEliminar').addEventListener('click', () => {
    if (competenciaAEliminarId) {
      eliminarCompetencia(competenciaAEliminarId);
      competenciaAEliminarId = null;
      const modal = bootstrap.Modal.getInstance(document.getElementById('confirmarEliminarModal'));
      modal.hide();
    }
  });
});
