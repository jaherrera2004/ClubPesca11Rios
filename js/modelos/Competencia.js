import { ValidationUtils, IDGenerator } from '../utils/helpers.js';
import { APP_CONFIG, MESSAGES } from '../config/constants.js';

/**
 * Clase que representa una competencia de pesca
 */
class Competencia {
    /**
     * Constructor de la clase Competencia
     * @param {string} nombre - Nombre de la competencia
     * @param {string} fecha - Fecha en formato YYYY-MM-DD
     * @param {string} lugar - Lugar de la competencia
     * @param {string} descripcion - Descripción opcional
     */
    constructor(nombre, fecha, lugar, descripcion = "") {
        const validation = ValidationUtils.validateRequiredFields({
            'Nombre': nombre,
            'Fecha': fecha,
            'Lugar': lugar
        });

        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        if (!ValidationUtils.isValidDate(fecha)) {
            throw new Error('La fecha proporcionada no es válida');
        }

        this.id = IDGenerator.generateCompetenciaId();
        this.nombre = nombre;
        this.fecha = fecha;
        this.lugar = lugar;
        this.descripcion = descripcion;
        this.estado = APP_CONFIG.ESTADOS.EN_CURSO;
        this.participantes = [];
    }

    /**
     * Agrega un participante a la competencia
     * @param {Participante} participante
     */
    agregarParticipante(participante) {
        if (!participante || typeof participante.getNombreCompleto !== 'function') {
            throw new Error('Se debe proporcionar un participante válido');
        }
        this.participantes.push(participante);
    }

    /**
     * Busca un participante por ID
     * @param {string} participanteId
     * @returns {Participante|null}
     */
    getParticipantePorId(participanteId) {
        return this.participantes.find(p => p.id === participanteId) || null;
    }

    /**
     * Elimina un participante de la competencia por ID
     * @param {string} participanteId
     * @returns {boolean} True si se eliminó correctamente, false si no se encontró
     */
    eliminarParticipante(participanteId) {
        const indice = this.participantes.findIndex(p => p.id === participanteId);
        if (indice !== -1) {
            this.participantes.splice(indice, 1);
            return true;
        }
        return false;
    }

    /**
     * Finaliza la competencia
     */
    finalizar() {
        this.estado = APP_CONFIG.ESTADOS.FINALIZADO;
    }

    /**
     * Verifica si la competencia está finalizada
     * @returns {boolean}
     */
    estaFinalizada() {
        return this.estado === APP_CONFIG.ESTADOS.FINALIZADO;
    }

    /**
     * Obtiene el total de capturas en la competencia
     * @returns {number}
     */
    getTotalCapturas() {
        return this.participantes.reduce((total, p) => total + p.capturas.length, 0);
    }

    /**
     * Obtiene el peso total de todas las capturas
     * @returns {number}
     */
    getPesoTotalCompetencia() {
        return this.participantes.reduce((total, p) => total + p.getPesoTotal(), 0);
    }

    /**
     * Devuelve el ranking de participantes ordenado por peso total de capturas (desc)
     * @returns {Array<{participante: Participante, pesoTotal: number}>}
     */
    getRanking() {
        return this.participantes
            .map(p => ({
                participante: p,
                pesoTotal: p.getPesoTotal(),
                totalCapturas: p.getTotalCapturas()
            }))
            .sort((a, b) => {
                // Ordenar por peso total descendente, y en caso de empate por número de capturas
                if (b.pesoTotal !== a.pesoTotal) {
                    return b.pesoTotal - a.pesoTotal;
                }
                return b.totalCapturas - a.totalCapturas;
            });
    }

    /**
     * Devuelve el ganador (participante con más peso total)
     * @returns {Participante|null}
     */
    getGanador() {
        const ranking = this.getRanking();
        return ranking.length > 0 ? ranking[0].participante : null;
    }

    /**
     * Obtiene estadísticas de la competencia
     * @returns {Object}
     */
    getEstadisticas() {
        const totalCapturas = this.getTotalCapturas();
        const pesoTotal = this.getPesoTotalCompetencia();

        if (totalCapturas === 0) {
            return {
                totalParticipantes: this.participantes.length,
                totalCapturas: 0,
                pesoTotal: 0,
                pesoPromedio: 0,
                capturaMasPesada: 0,
                capturaMasLiviana: 0
            };
        }

        const todasLasCapturas = [];
        this.participantes.forEach(p => {
            p.capturas.forEach(c => todasLasCapturas.push(c.peso));
        });

        return {
            totalParticipantes: this.participantes.length,
            totalCapturas,
            pesoTotal,
            pesoPromedio: (pesoTotal / totalCapturas).toFixed(2),
            capturaMasPesada: Math.max(...todasLasCapturas),
            capturaMasLiviana: Math.min(...todasLasCapturas)
        };
    }

    /**
     * Convierte el objeto a formato JSON
     */
    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            fecha: this.fecha,
            lugar: this.lugar,
            descripcion: this.descripcion,
            estado: this.estado,
            participantes: this.participantes.map(p => p.toJSON())
        };
    }

    /**
     * Crea una instancia de Competencia desde JSON
     * @param {Object} data
     * @returns {Promise<Competencia>}
     */
    static async fromJSON(data) {
        try {
            const { default: Participante } = await import('./Participante.js');
            const competencia = new Competencia(data.nombre, data.fecha, data.lugar, data.descripcion);

            competencia.id = data.id;
            competencia.estado = data.estado || APP_CONFIG.ESTADOS.EN_CURSO;
            competencia.participantes = [];

            if (data.participantes && Array.isArray(data.participantes)) {
                for (const p of data.participantes) {
                    competencia.participantes.push(Participante.fromJSON(p));
                }
            }

            return competencia;
        } catch (error) {
            console.error('Error creando competencia desde JSON:', error);
            throw new Error('Error al cargar los datos de la competencia');
        }
    }
}

export default Competencia;
