import { MESSAGES } from '../config/constants.js';

/**
 * Servicio para manejar notificaciones y mensajes al usuario
 */
export class NotificationService {

  /**
   * Muestra un mensaje de error
   */
  static showError(message) {
    // Por ahora usamos alert, pero se puede mejorar con toast notifications
    alert(message);
    console.error('Error:', message);
  }

  /**
   * Muestra un mensaje de éxito
   */
  static showSuccess(message) {
    console.log('Éxito:', message);
    // Se puede implementar con toast notifications
  }

  /**
   * Muestra un mensaje de confirmación
   */
  static showConfirmation(message) {
    return confirm(message);
  }

  /**
   * Valida campos de formulario y muestra errores
   */
  static validateForm(fields) {
    const errors = [];

    Object.entries(fields).forEach(([fieldName, value]) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push(`${fieldName} es obligatorio`);
      }
    });

    if (errors.length > 0) {
      this.showError(errors.join('\n'));
      return false;
    }

    return true;
  }

  /**
   * Valida peso específicamente
   */
  static validateWeight(peso) {
    if (!peso || isNaN(peso) || peso <= 0) {
      this.showError(MESSAGES.ERRORS.PESO_INVALIDO);
      return false;
    }
    return true;
  }
}
