import { CompetenciaDetalleController } from './controllers/CompetenciaDetalleController.js';
import { APP_CONFIG } from './config/constants.js';

/**
 * Archivo principal para la página de detalles de competencia
 */
class CompetenciaDetalleApp {
  constructor() {
    this.controller = null;
    this.init();
  }

  /**
   * Inicializa la aplicación de detalles
   */
  init() {
    // Verificar que estamos en la página correcta
    if (!document.getElementById('nombreCompetencia')) {
      console.warn('Esta página no parece ser la página de detalles de competencia');
      return;
    }

    // Configurar el título de la página
    this.setupPageTitle();

    // Inicializar el controlador cuando el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initController());
    } else {
      this.initController();
    }
  }

  /**
   * Configura el título de la página
   */
  setupPageTitle() {
    document.title = `${APP_CONFIG.APP_NAME} - Detalles de Competencia`;
  }

  /**
   * Inicializa el controlador de detalles
   */
  initController() {
    try {
      this.controller = new CompetenciaDetalleController();
      console.log('✅ Página de detalles inicializada correctamente');
    } catch (error) {
      console.error('❌ Error inicializando la página de detalles:', error);
      this.showInitializationError();
    }
  }

  /**
   * Muestra error de inicialización
   */
  showInitializationError() {
    const container = document.querySelector('main .container');
    if (container) {
      container.innerHTML = `
        <div class="alert alert-danger text-center" role="alert">
          <h4 class="alert-heading">Error de inicialización</h4>
          <p>Hubo un problema al cargar los detalles de la competencia. Por favor, verifica la URL o recarga la página.</p>
          <hr>
          <div class="btn-group" role="group">
            <a href="index.html" class="btn btn-outline-primary">
              <i class="fa-solid fa-arrow-left me-2"></i>Volver a competencias
            </a>
            <button class="btn btn-outline-danger" onclick="window.location.reload()">
              <i class="bi bi-arrow-clockwise me-2"></i>Recargar página
            </button>
          </div>
        </div>
      `;
    }
  }
}

// Inicializar la aplicación de detalles
new CompetenciaDetalleApp();
