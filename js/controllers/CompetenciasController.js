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
          (id) => this.viewCompetenciaDetails(id)
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
}
