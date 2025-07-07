/**
 * Utilidades para manipulación del DOM
 */
export class DOMUtils {
  /**
   * Encuentra un elemento por ID con validación
   */
  static getElementById(id) {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Elemento con ID '${id}' no encontrado`);
    }
    return element;
  }

  /**
   * Encuentra elementos por selector con validación
   */
  static querySelectorAll(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Limpia el contenido de un elemento
   */
  static clearElement(element) {
    if (element) {
      element.innerHTML = '';
    }
  }

  /**
   * Agrega múltiples clases CSS a un elemento
   */
  static addClasses(element, ...classes) {
    if (element) {
      element.classList.add(...classes);
    }
  }

  /**
   * Remueve múltiples clases CSS de un elemento
   */
  static removeClasses(element, ...classes) {
    if (element) {
      element.classList.remove(...classes);
    }
  }

  /**
   * Crea un elemento con atributos y clases
   */
  static createElement(tag, attributes = {}, classes = [], textContent = '') {
    const element = document.createElement(tag);

    // Agregar atributos
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    // Agregar clases
    if (classes.length > 0) {
      element.classList.add(...classes);
    }

    // Agregar contenido de texto
    if (textContent) {
      element.textContent = textContent;
    }

    return element;
  }
}

/**
 * Utilidades para formateo
 */
export class FormatUtils {
  /**
   * Formatea una fecha a formato DD/MM/YYYY
   */
  static formatDate(dateString) {
    if (!dateString) return '--/--/----';

    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  }

  /**
   * Formatea una fecha para mostrar en español
   */
  static formatDateLong(dateString) {
    if (!dateString) return 'Fecha no disponible';

    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formatea peso con unidades
   */
  static formatWeight(weight) {
    return `${weight} g`;
  }

  /**
   * Genera un nombre de archivo seguro
   */
  static sanitizeFileName(name) {
    return name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
  }

  /**
   * Formatea posición en ranking
   */
  static formatPosition(index) {
    const position = index + 1;
    if (position === 1) return '1° LUGAR';
    if (position === 2) return '2° LUGAR';
    if (position === 3) return '3° LUGAR';
    return `${position}° LUGAR`;
  }
}

/**
 * Utilidades para validación
 */
export class ValidationUtils {
  /**
   * Valida que una cadena no esté vacía
   */
  static isNotEmpty(value) {
    return value && value.trim().length > 0;
  }

  /**
   * Valida peso
   */
  static isValidWeight(weight) {
    const numWeight = Number(weight);
    return !isNaN(numWeight) && numWeight > 0;
  }

  /**
   * Valida fecha
   */
  static isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  /**
   * Valida campos obligatorios
   */
  static validateRequiredFields(fields) {
    const errors = [];

    Object.entries(fields).forEach(([fieldName, value]) => {
      if (!this.isNotEmpty(value)) {
        errors.push(`${fieldName} es obligatorio`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Utilidades para generar IDs únicos
 */
export class IDGenerator {
  /**
   * Genera ID para competencia
   */
  static generateCompetenciaId() {
    return 'comp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Genera ID para participante
   */
  static generateParticipanteId() {
    return 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Genera ID para captura
   */
  static generateCapturaId() {
    return 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
