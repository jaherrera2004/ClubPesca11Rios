import { DatabaseService } from '../services/DatabaseService.js';
import { NotificationService } from '../services/NotificationService.js';
import { UIService } from '../services/UIService.js';
import { CompetenciaCard } from '../components/UIComponents.js';
import { APP_CONFIG, MESSAGES } from '../config/constants.js';
import { DOMUtils, ValidationUtils } from '../utils/helpers.js';
import Competencia from '../modelos/Competencia.js';

/**
 * Controlador para la página principal de competencias
 */
export class CompetenciasController {
  constructor() {
    this.dbService = new DatabaseService();
    this.competenciaAEliminarId = null;
    this.competenciaAEditarId = null;
    this.init();
  }

  /**
   * Inicializa el controlador
   */
  init() {
    this.setupEventListeners();
    this.loadCompetencias();
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Botón guardar nueva competencia
    const btnGuardar = document.querySelector("#nuevaCompetenciaModal .btn-naranja");
    if (btnGuardar) {
      btnGuardar.addEventListener("click", () => this.saveNewCompetencia());
    }

    // Botón confirmar eliminación
    const btnConfirmarEliminar = DOMUtils.getElementById('btnConfirmarEliminar');
    if (btnConfirmarEliminar) {
      btnConfirmarEliminar.addEventListener('click', () => this.confirmDeleteCompetencia());
    }

    // Botón guardar edición
    const btnGuardarEdicion = DOMUtils.getElementById('btnGuardarEdicion');
    if (btnGuardarEdicion) {
      btnGuardarEdicion.addEventListener('click', () => this.saveEditedCompetencia());
    }
  }

  /**
   * Carga y renderiza todas las competencias
   */
  async loadCompetencias() {
    try {
      const contenedor = DOMUtils.getElementById("competenciasContainer");
      if (!contenedor) return;

      DOMUtils.clearElement(contenedor);

      const competencias = await this.dbService.getAllCompetencias();

      if (!competencias || competencias.length === 0) {
        this.renderEmptyState(contenedor);
        return;
      }

      competencias.forEach(competencia => {
        const cardElement = CompetenciaCard.render(
          competencia,
          (id) => this.prepareDeleteCompetencia(id),
          (id) => this.viewCompetenciaDetails(id),
          (id) => this.prepareEditCompetencia(id)
        );

        if (cardElement) {
          contenedor.appendChild(cardElement);
        }
      });
    } catch (error) {
      console.error('Error cargando competencias:', error);
      NotificationService.showError('Error al cargar las competencias');
    }
  }

  /**
   * Renderiza el estado vacío
   */
  renderEmptyState(contenedor) {
    contenedor.innerHTML = `
      <div class="w-100 h-100 d-flex justify-content-center align-items-center" style="min-height: 300px;">
        <div class="text-center">
          <i class="bi bi-emoji-frown display-1 text-muted"></i>
          <p class="lead mt-3">${MESSAGES.INFO.NO_COMPETENCIAS}</p>
          <button class="btn btn-primary mt-2" data-bs-toggle="modal" data-bs-target="#nuevaCompetenciaModal">
            <i class="bi bi-plus-circle me-2"></i>Agregar primera competencia
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Guarda una nueva competencia
   */
  async saveNewCompetencia() {
    try {
      const formData = this.getFormData();

      if (!this.validateFormData(formData)) {
        return;
      }

      const competencia = new Competencia(
        formData.nombre,
        formData.fecha,
        formData.lugar,
        formData.descripcion
      );

      await this.dbService.saveCompetencia(competencia.toJSON());

      this.clearForm();
      UIService.closeModal("nuevaCompetenciaModal");
      this.loadCompetencias();

      NotificationService.showSuccess(MESSAGES.SUCCESS.COMPETENCIA_GUARDADA);
    } catch (error) {
      console.error('Error guardando competencia:', error);
      NotificationService.showError('Error al guardar la competencia');
    }
  }

  /**
   * Obtiene los datos del formulario
   */
  getFormData() {
    return {
      nombre: DOMUtils.getElementById("nombreCompetencia")?.value?.trim() || '',
      fecha: DOMUtils.getElementById("fechaCompetencia")?.value || '',
      lugar: DOMUtils.getElementById("lugarCompetencia")?.value?.trim() || '',
      descripcion: DOMUtils.getElementById("descripcionCompetencia")?.value?.trim() || ''
    };
  }

  /**
   * Valida los datos del formulario
   */
  validateFormData(data) {
    const validation = ValidationUtils.validateRequiredFields({
      'Nombre': data.nombre,
      'Fecha': data.fecha,
      'Lugar': data.lugar
    });

    if (!validation.isValid) {
      NotificationService.showError(validation.errors.join('\n'));
      return false;
    }

    if (!ValidationUtils.isValidDate(data.fecha)) {
      NotificationService.showError('La fecha proporcionada no es válida');
      return false;
    }

    return true;
  }

  /**
   * Limpia el formulario
   */
  clearForm() {
    UIService.clearForm([
      "nombreCompetencia",
      "fechaCompetencia",
      "lugarCompetencia",
      "descripcionCompetencia"
    ]);
  }

  /**
   * Prepara la eliminación de una competencia
   */
  prepareDeleteCompetencia(id) {
    this.competenciaAEliminarId = id;
    UIService.openModal('confirmarEliminarModal');
  }

  /**
   * Confirma y ejecuta la eliminación
   */
  async confirmDeleteCompetencia() {
    if (!this.competenciaAEliminarId) return;

    try {
      await this.dbService.deleteCompetencia(this.competenciaAEliminarId);

      this.competenciaAEliminarId = null;
      UIService.closeModal('confirmarEliminarModal');
      this.loadCompetencias();

    } catch (error) {
      console.error('Error eliminando competencia:', error);
      NotificationService.showError('Error al eliminar la competencia');
    }
  }

  /**
   * Navega a los detalles de una competencia
   */
  viewCompetenciaDetails(id) {
    window.location.href = `competenciaDetalle.html?id=${id}`;
  }

  /**
   * Prepara la edición de una competencia
   */
  async prepareEditCompetencia(id) {
    try {
      this.competenciaAEditarId = id;

      // Obtener los datos de la competencia
      const competencia = await this.dbService.getCompetenciaById(id);

      if (!competencia) {
        NotificationService.showError('No se pudo encontrar la competencia');
        return;
      }

      // Cargar los datos en el formulario de edición
      this.loadCompetenciaDataToEditForm(competencia);

      // Mostrar el modal de edición
      UIService.openModal('editarCompetenciaModal');
    } catch (error) {
      console.error('Error preparando edición:', error);
      NotificationService.showError('Error al cargar los datos de la competencia');
    }
  }

  /**
   * Carga los datos de la competencia en el formulario de edición
   */
  loadCompetenciaDataToEditForm(competencia) {
    const nombreInput = DOMUtils.getElementById("editNombreCompetencia");
    const fechaInput = DOMUtils.getElementById("editFechaCompetencia");
    const lugarInput = DOMUtils.getElementById("editLugarCompetencia");
    const descripcionInput = DOMUtils.getElementById("editDescripcionCompetencia");

    if (nombreInput) nombreInput.value = competencia.nombre || '';
    if (fechaInput) fechaInput.value = competencia.fecha || '';
    if (lugarInput) lugarInput.value = competencia.lugar || '';
    if (descripcionInput) descripcionInput.value = competencia.descripcion || '';
  }

  /**
   * Obtiene los datos del formulario de edición
   */
  getEditFormData() {
    return {
      nombre: DOMUtils.getElementById("editNombreCompetencia")?.value?.trim() || '',
      fecha: DOMUtils.getElementById("editFechaCompetencia")?.value || '',
      lugar: DOMUtils.getElementById("editLugarCompetencia")?.value?.trim() || '',
      descripcion: DOMUtils.getElementById("editDescripcionCompetencia")?.value?.trim() || ''
    };
  }

  /**
   * Limpia el formulario de edición
   */
  clearEditForm() {
    UIService.clearForm([
      "editNombreCompetencia",
      "editFechaCompetencia",
      "editLugarCompetencia",
      "editDescripcionCompetencia"
    ]);
  }

  /**
   * Guarda los cambios en una competencia editada
   */
  async saveEditedCompetencia() {
    if (this.competenciaAEditarId === null) return;

    try {
      const formData = this.getEditFormData();

      if (!this.validateEditFormData(formData)) {
        return;
      }

      const competenciaActual = await this.dbService.getCompetenciaById(this.competenciaAEditarId);

      // Crear competencia actualizada manteniendo datos importantes como participantes
      const competenciaActualizada = {
        ...competenciaActual,
        nombre: formData.nombre,
        fecha: formData.fecha,
        lugar: formData.lugar,
        descripcion: formData.descripcion,
        fechaModificacion: new Date().toISOString()
      };

      await this.dbService.updateCompetencia(this.competenciaAEditarId, competenciaActualizada);

      this.competenciaAEditarId = null;
      this.clearEditForm();
      UIService.closeModal("editarCompetenciaModal");
      this.loadCompetencias();

      NotificationService.showSuccess('Competencia actualizada exitosamente');
    } catch (error) {
      console.error('Error actualizando competencia:', error);
      NotificationService.showError('Error al actualizar la competencia');
    }
  }

  /**
   * Valida los datos del formulario de edición
   */
  validateEditFormData(data) {
    const validation = ValidationUtils.validateRequiredFields({
      'Nombre': data.nombre,
      'Fecha': data.fecha,
      'Lugar': data.lugar
    });

    if (!validation.isValid) {
      NotificationService.showError(validation.errors.join('\n'));
      return false;
    }

    if (!ValidationUtils.isValidDate(data.fecha)) {
      NotificationService.showError('La fecha proporcionada no es válida');
      return false;
    }

    return true;
  }
}
