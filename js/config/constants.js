/**
 * Constantes globales de la aplicación
 */
export const APP_CONFIG = {
  // Base de datos
  DB_NAME: 'ClubPescaDB',
  DB_VERSION: 1,
  STORE_COMPETENCIAS: 'competencias',

  // Configuración de la aplicación
  APP_NAME: 'Club de Pesca 11 Rios',
  APP_SUBTITLE: 'Sistema de gestión y seguimiento para torneos de pesca deportiva',

  // Estados de competencia
  ESTADOS: {
    EN_CURSO: 'En curso',
    FINALIZADO: 'Finalizado'
  },

  // Configuración de UI
  PODIO: {
    MAX_PARTICIPANTS: 3,
    MIN_FOR_TABLE: 4
  },

  // Validaciones
  VALIDATIONS: {
    MIN_PESO: 1,
    MAX_DROPDOWN_HEIGHT: 250
  },

  // Selectores CSS comunes
  SELECTORS: {
    COMPETENCIAS_CONTAINER: '#competenciasContainer',
    MODAL_PARTICIPANTES: '#participantesModal',
    TABLA_CAPTURAS: '#tablaCapturas',
    LISTA_PARTICIPANTES_MODAL: '#listaParticipantesModal'
  },

  // Clases CSS
  CSS_CLASSES: {
    BTN_NARANJA: 'btn-naranja',
    BTN_OUTLINE_NARANJA: 'btn-outline-naranja',
    CARD_HOVER: 'card-hover-naranja',
    BG_NARANJA: 'bg-naranja'
  }
};

export const MESSAGES = {
  ERRORS: {
    NOMBRE_OBLIGATORIO: 'El nombre es obligatorio',
    PESO_INVALIDO: 'Por favor, especifique un peso válido (mayor a 0)',
    PARTICIPANTE_NO_EXISTE: 'El participante seleccionado no existe',
    CAMPOS_REQUERIDOS: 'Por favor completa todos los campos requeridos',
    CAPTURA_INVALIDA: 'Se debe proporcionar un objeto de captura válido'
  },

  CONFIRMATIONS: {
    ELIMINAR_COMPETENCIA: '¿Estás seguro de que deseas eliminar esta competencia? Esta acción no se puede deshacer.',
    ELIMINAR_PARTICIPANTE: '¿Estás seguro de que deseas eliminar este participante? Esta acción no se puede deshacer.',
    ELIMINAR_CAPTURA: '¿Estás seguro de que deseas eliminar esta captura? Esta acción no se puede deshacer.',
    FINALIZAR_COMPETENCIA: '¿Estás seguro de que deseas finalizar la competencia? Esta acción no se puede deshacer.'
  },

  SUCCESS: {
    COMPETENCIA_GUARDADA: 'Competencia guardada exitosamente',
    PARTICIPANTE_AGREGADO: 'Participante agregado exitosamente',
    CAPTURA_REGISTRADA: 'Captura registrada exitosamente'
  },

  INFO: {
    NO_COMPETENCIAS: 'No hay competencias programadas en este momento.',
    NO_PARTICIPANTES: 'No hay participantes inscritos',
    NO_CAPTURAS: 'No hay capturas registradas',
    NO_RANKING: 'No hay datos de ranking disponibles'
  }
};
