import { CompetenciasController } from './controllers/CompetenciasController.js';
import { APP_CONFIG } from './config/constants.js';

/**
 * Archivo principal de la aplicación - Página de competencias
 */
class App {
  constructor() {
    this.controller = null;
    this.init();
  }

  /**
   * Inicializa la aplicación
   */
  init() {
    // Verificar que estamos en la página correcta
    if (!document.getElementById(APP_CONFIG.SELECTORS.COMPETENCIAS_CONTAINER.substring(1))) {
      console.warn('Esta página no parece ser la página principal de competencias');
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
    document.title = `${APP_CONFIG.APP_NAME} - Competencias`;
  }

  /**
   * Inicializa el controlador principal
   */
  initController() {
    try {
      this.controller = new CompetenciasController();
      console.log('✅ Aplicación inicializada correctamente');
    } catch (error) {
      console.error('❌ Error inicializando la aplicación:', error);
      this.showInitializationError();
    }
  }

  /**
   * Muestra error de inicialización
   */
  showInitializationError() {
    const container = document.getElementById(APP_CONFIG.SELECTORS.COMPETENCIAS_CONTAINER.substring(1));
    if (container) {
      container.innerHTML = `
        <div class="alert alert-danger text-center" role="alert">
          <h4 class="alert-heading">Error de inicialización</h4>
          <p>Hubo un problema al cargar la aplicación. Por favor, recarga la página.</p>
          <hr>
          <button class="btn btn-outline-danger" onclick="window.location.reload()">
            <i class="bi bi-arrow-clockwise me-2"></i>Recargar página
          </button>
        </div>
      `;
    }
  }
}

// Inicializar la aplicación
new App();
