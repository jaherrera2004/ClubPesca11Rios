import { ValidationUtils, IDGenerator } from '../utils/helpers.js';
import { MESSAGES } from '../config/constants.js';

/**
 * Clase que representa a un participante en una competencia de pesca
 */
class Participante {
    /**
     * Constructor de la clase Participante
     * @param {string} nombre - Nombre del participante (obligatorio)
     * @param {string} apellido - Apellido del participante (opcional)
     */
    constructor(nombre, apellido = '') {
        if (!ValidationUtils.isNotEmpty(nombre)) {
            throw new Error(MESSAGES.ERRORS.NOMBRE_OBLIGATORIO);
        }

        this.nombre = nombre;
        this.apellido = apellido;
        this.capturas = []; // Lista de capturas, se inicializa vacía
        this.id = IDGenerator.generateParticipanteId();
    }

    /**
     * Obtiene el nombre completo del participante
     * @returns {string} Nombre completo (nombre y apellido si existe)
     */
    getNombreCompleto() {
        return this.apellido ? `${this.nombre} ${this.apellido}` : this.nombre;
    }

    /**
     * Agrega una captura a la lista de capturas del participante
     * @param {Captura} captura - Objeto de tipo Captura
     */
    agregarCaptura(captura) {
        if (!captura) {
            throw new Error(MESSAGES.ERRORS.CAPTURA_INVALIDA);
        }
        this.capturas.push(captura);
    }

    /**
     * Elimina una captura de la lista de capturas del participante
     * @param {string} capturaId - ID de la captura a eliminar
     * @returns {boolean} True si se eliminó correctamente, false si no se encontró
     */
    eliminarCaptura(capturaId) {
        const indice = this.capturas.findIndex(c => c.id === capturaId);
        if (indice !== -1) {
            this.capturas.splice(indice, 1);
            return true;
        }
        return false;
    }

    /**
     * Obtiene todas las capturas del participante
     * @returns {Array} Lista de capturas
     */
    getCapturas() {
        return [...this.capturas]; // Devuelve una copia para evitar modificaciones externas
    }

    /**
     * Obtiene el total de capturas del participante
     * @returns {number} Número total de capturas
     */
    getTotalCapturas() {
        return this.capturas.length;
    }

    /**
     * Obtiene el peso total de todas las capturas
     * @returns {number} Peso total en gramos
     */
    getPesoTotal() {
        return this.capturas.reduce((total, captura) => total + captura.peso, 0);
    }

    /**
     * Busca una captura por ID
     * @param {string} capturaId - ID de la captura a buscar
     * @returns {Object|null} Captura encontrada o null
     */
    getCapturaPorId(capturaId) {
        return this.capturas.find(c => c.id === capturaId) || null;
    }

    /**
     * Actualiza una captura existente
     * @param {string} capturaId - ID de la captura a actualizar
     * @param {Object} nuevosDatos - Nuevos datos de la captura: { peso, tipoPez }
     * @returns {boolean} True si se actualizó correctamente, false si no se encontró
     */
    actualizarCaptura(capturaId, nuevosDatos) {
        const captura = this.getCapturaPorId(capturaId);
        if (captura) {
            if (nuevosDatos.peso && ValidationUtils.isValidWeight(nuevosDatos.peso)) {
                captura.peso = Number(nuevosDatos.peso);
            }
            if (nuevosDatos.tipoPez !== undefined) {
                captura.tipoPez = nuevosDatos.tipoPez;
            }
            return true;
        }
        return false;
    }

    /**
     * Convierte el objeto a formato JSON para almacenamiento
     * @returns {Object} Objeto con los datos del participante
     */
    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            apellido: this.apellido,
            capturas: this.capturas.map(c => {
                // Si la captura ya es un objeto plano o ya tiene toJSON
                if (typeof c === 'object' && c !== null) {
                    return c.toJSON ? c.toJSON() : c;
                }
                return c;
            })
        };
    }

    /**
     * Crea una instancia de Participante a partir de un objeto JSON
     * @param {Object} data - Datos del participante en formato JSON
     * @returns {Participante} Nueva instancia de Participante
     */
    static fromJSON(data) {
        const participante = new Participante(data.nombre, data.apellido);
        participante.id = data.id;

        // Inicializamos capturas como array vacío
        participante.capturas = [];

        // Si hay capturas, las conservamos como objetos simples
        if (data.capturas && Array.isArray(data.capturas)) {
            participante.capturas = data.capturas;
        }

        return participante;
    }
}

export default Participante;
