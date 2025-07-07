import { APP_CONFIG } from '../config/constants.js';
import { DOMUtils } from '../utils/helpers.js';

/**
 * Servicio para manejar modales y componentes de UI
 */
export class UIService {

  /**
   * Abre un modal de Bootstrap
   */
  static openModal(modalId) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
      return modal;
    }
    console.warn(`Modal ${modalId} no encontrado`);
    return null;
  }

  /**
   * Cierra un modal de Bootstrap
   */
  static closeModal(modalId) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  /**
   * Limpia un formulario
   */
  static clearForm(formFields) {
    formFields.forEach(fieldId => {
      const field = DOMUtils.getElementById(fieldId);
      if (field) {
        field.value = '';
      }
    });
  }

  /**
   * Actualiza el contador de elementos
   */
  static updateCounter(elementId, count) {
    const element = DOMUtils.getElementById(elementId);
    if (element) {
      element.textContent = count;
    }
  }

  /**
   * Crea un badge de estado
   */
  static createStateBadge(estado) {
    const badge = DOMUtils.createElement('span', {}, ['badge']);
    badge.textContent = estado;

    if (estado === APP_CONFIG.ESTADOS.FINALIZADO) {
      badge.classList.add('bg-danger');
    } else if (estado === APP_CONFIG.ESTADOS.EN_CURSO) {
      badge.classList.add('bg-success');
    } else {
      badge.classList.add('bg-secondary');
    }

    return badge;
  }

  /**
   * Crea un botón con configuración estándar
   */
  static createButton(text, classes = [], attributes = {}) {
    const button = DOMUtils.createElement('button', {
      type: 'button',
      ...attributes
    }, ['btn', ...classes], text);

    return button;
  }

  /**
   * Muestra un mensaje de estado vacío
   */
  static showEmptyState(container, message, iconClass = 'fa-solid fa-inbox') {
    if (typeof container === 'string') {
      container = DOMUtils.getElementById(container);
    }

    if (container) {
      container.innerHTML = `
        <div class="text-center py-4 text-muted">
          <i class="${iconClass} fs-1 mb-3"></i>
          <p>${message}</p>
        </div>
      `;
    }
  }

  /**
   * Habilita o deshabilita elementos según estado
   */
  static toggleElementsState(selectors, disabled, tooltipMessage = '') {
    selectors.forEach(selector => {
      const elements = DOMUtils.querySelectorAll(selector);
      elements.forEach(element => {
        element.disabled = disabled;
        if (disabled && tooltipMessage) {
          element.title = tooltipMessage;
        } else {
          element.title = '';
        }
      });
    });
  }
}
