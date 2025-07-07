/**
 * Clase que representa una captura de pez en una competencia
 */
class Captura {
    /**
     * Constructor de la clase Captura
     * @param {number} peso - Peso del pez en gramos (obligatorio)
     * @param {string} tipoPez - Tipo de pez (opcional)
     */
    constructor(peso, tipoPez = '') {
        if (!peso || isNaN(peso) || peso <= 0) {
            throw new Error('El peso debe ser un número positivo');
        }

        this.peso = Number(peso);
        this.tipoPez = tipoPez;
        this.fecha = new Date().toISOString();
        this.id = this._generarId();
    }

    /**
     * Convierte el objeto a formato JSON para almacenamiento
     * @returns {Object} Objeto con los datos de la captura
     */
    toJSON() {
        return {
            id: this.id,
            peso: this.peso,
            tipoPez: this.tipoPez,
            fecha: this.fecha
        };
    }

    /**
     * Crea una instancia de Captura a partir de un objeto JSON
     * @param {Object} data - Datos de la captura en formato JSON
     * @returns {Captura} Nueva instancia de Captura
     */
    static fromJSON(data) {
        const captura = new Captura(data.peso, data.tipoPez);
        captura.id = data.id;
        captura.fecha = data.fecha;
        return captura;
    }

    /**
     * Genera un ID único para la captura
     * @returns {string} ID único
     * @private
     */
    _generarId() {
        return 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

export default Captura;
