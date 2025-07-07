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
        if (!nombre) {
            throw new Error('El nombre del participante es obligatorio');
        }

        this.nombre = nombre;
        this.apellido = apellido;
        this.capturas = []; // Lista de capturas, se inicializa vacía
        this.id = this._generarId(); // Generar un ID único para el participante
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
        // Quitamos la validación estricta del tipo que causa problemas
        // ya que las capturas pueden ser objetos planos al reconstruirse
        if (!captura) {
            throw new Error('Se debe proporcionar un objeto de captura válido');
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
     * Genera un ID único para el participante
     * @returns {string} ID único
     * @private
     */
    _generarId() {
        return 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
        // Esto es suficiente para la funcionalidad básica
        if (data.capturas && Array.isArray(data.capturas)) {
            participante.capturas = data.capturas;
        }

        return participante;
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
            if (nuevosDatos.peso) captura.peso = Number(nuevosDatos.peso);
            if (nuevosDatos.tipoPez !== undefined) captura.tipoPez = nuevosDatos.tipoPez;
            return true;
        }
        return false;
    }
}

export default Participante;
