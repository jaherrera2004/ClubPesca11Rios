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
        if (!nombre || !fecha || !lugar) {
            throw new Error("Nombre, fecha y lugar son obligatorios");
        }
        this.id = this._generarId();
        this.nombre = nombre;
        this.fecha = fecha;
        this.lugar = lugar;
        this.descripcion = descripcion;
        this.estado = "En curso"; // Solo puede ser "En curso" o "Finalizado"
        this.participantes = []; // Array de Participante
    }

    /**
     * Agrega un participante a la competencia
     * @param {Participante} participante
     */
    agregarParticipante(participante) {
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
        this.estado = "Finalizado";
    }

    /**
     * Devuelve el ranking de participantes ordenado por peso total de capturas (desc)
     * @returns {Array<{participante: Participante, pesoTotal: number}>}
     */
    getRanking() {
        return this.participantes
            .map(p => ({ participante: p, pesoTotal: p.capturas.reduce((acc, c) => acc + c.peso, 0) }))
            .sort((a, b) => b.pesoTotal - a.pesoTotal);
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
        const participantePromises = [];
        const { default: Participante } = await import('./Participante.js');
        const competencia = new Competencia(data.nombre, data.fecha, data.lugar, data.descripcion);
        competencia.id = data.id;
        competencia.estado = data.estado;
        competencia.participantes = [];
        if (data.participantes && Array.isArray(data.participantes)) {
            for (const p of data.participantes) {
                participantePromises.push(Participante.fromJSON(p));
            }
            competencia.participantes = await Promise.all(participantePromises);
        }
        return competencia;
    }

    _generarId() {
        return 'comp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

export default Competencia;
