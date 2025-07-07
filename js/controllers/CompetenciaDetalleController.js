import { DatabaseService } from '../services/DatabaseService.js';
import { NotificationService } from '../services/NotificationService.js';
import { UIService } from '../services/UIService.js';
import {
  PodioComponent,
  ParticipantesModalComponent,
  CapturaTableComponent
} from '../components/UIComponents.js';
import { APP_CONFIG, MESSAGES } from '../config/constants.js';
import { DOMUtils, FormatUtils, ValidationUtils } from '../utils/helpers.js';
import Competencia from '../modelos/Competencia.js';
import Participante from '../modelos/Participante.js';
import Captura from '../modelos/Captura.js';

/**
 * Controlador para la página de detalles de competencia
 */
export class CompetenciaDetalleController {
  constructor() {
    this.dbService = new DatabaseService();
    this.competenciaId = this.getCompetenciaIdFromUrl();
    this.currentCompetencia = null;

    // Referencias para edición/eliminación
    this.participanteAEliminarId = null;
    this.capturaAEditarId = null;
    this.capturaAEliminarId = null;
    this.participanteEditandoCapturaId = null;
    this.participanteEliminandoCapturaId = null;

    this.init();
  }

  /**
   * Inicializa el controlador
   */
  init() {
    this.setupEventListeners();
    this.renderCompetencia();
  }

  /**
   * Obtiene el ID de la competencia desde la URL
   */
  getCompetenciaIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  /**
   * Configura todos los event listeners
   */
  setupEventListeners() {
    // Botones principales
    this.setupMainButtonListeners();

    // Modales de participantes
    this.setupParticipantModalListeners();

    // Modales de capturas
    this.setupCapturaModalListeners();

    // Otros modales
    this.setupOtherModalListeners();
  }

  /**
   * Configura listeners para botones principales
   */
  setupMainButtonListeners() {
    // Generar PDF
    const btnGenerarPDF = DOMUtils.getElementById('btnGenerarPDF');
    if (btnGenerarPDF) {
      btnGenerarPDF.addEventListener('click', () => this.generarReportePDF());
    }

    // Ver ranking
    const btnVerRanking = DOMUtils.getElementById('btnGenerarPDF')?.nextElementSibling;
    if (btnVerRanking) {
      btnVerRanking.addEventListener('click', () => this.showRanking());
    }

    // Finalizar competencia
    const btnConfirmarFinalizar = DOMUtils.getElementById('btnConfirmarFinalizar');
    if (btnConfirmarFinalizar) {
      btnConfirmarFinalizar.addEventListener('click', () => this.finalizarCompetencia());
    }
  }

  /**
   * Configura listeners para modales de participantes
   */
  setupParticipantModalListeners() {
    // Guardar participante
    const btnGuardarParticipante = DOMUtils.getElementById('btnGuardarParticipante');
    if (btnGuardarParticipante) {
      btnGuardarParticipante.addEventListener('click', () => this.agregarParticipante());
    }

    // Confirmar eliminación de participante
    const btnConfirmarEliminarParticipante = DOMUtils.getElementById('btnConfirmarEliminarParticipante');
    if (btnConfirmarEliminarParticipante) {
      btnConfirmarEliminarParticipante.addEventListener('click', () => this.confirmarEliminarParticipante());
    }
  }

  /**
   * Configura listeners para modales de capturas
   */
  setupCapturaModalListeners() {
    // Guardar captura
    const btnGuardarCaptura = DOMUtils.getElementById('btnGuardarCaptura');
    if (btnGuardarCaptura) {
      btnGuardarCaptura.addEventListener('click', () => this.registrarCaptura());
    }

    // Guardar captura editada
    const btnGuardarCapturaEditada = DOMUtils.getElementById('btnGuardarCapturaEditada');
    if (btnGuardarCapturaEditada) {
      btnGuardarCapturaEditada.addEventListener('click', () => this.guardarCapturaEditada());
    }

    // Confirmar eliminación de captura
    const btnConfirmarEliminarCaptura = DOMUtils.getElementById('btnConfirmarEliminarCaptura');
    if (btnConfirmarEliminarCaptura) {
      btnConfirmarEliminarCaptura.addEventListener('click', () => this.confirmarEliminarCaptura());
    }
  }

  /**
   * Configura otros listeners de modales
   */
  setupOtherModalListeners() {
    // Listener dinámico para botones de eliminar participantes en modal
    document.addEventListener('click', (e) => {
      if (e.target.closest('.eliminar-participante-modal')) {
        const btn = e.target.closest('.eliminar-participante-modal');
        this.prepararEliminarParticipante(btn.getAttribute('data-id'));
      }
    });

    // Listeners dinámicos para botones de capturas
    document.addEventListener('click', (e) => {
      if (e.target.closest('.btn-editar-captura')) {
        const btn = e.target.closest('.btn-editar-captura');
        this.prepararEdicionCaptura(
          btn.getAttribute('data-participante-id'),
          btn.getAttribute('data-captura-id')
        );
      }

      if (e.target.closest('.btn-eliminar-captura')) {
        const btn = e.target.closest('.btn-eliminar-captura');
        this.prepararEliminarCaptura(
          btn.getAttribute('data-participante-id'),
          btn.getAttribute('data-captura-id')
        );
      }
    });
  }

  /**
   * Renderiza todos los datos de la competencia
   */
  async renderCompetencia() {
    if (!this.competenciaId) return;

    try {
      const data = await this.dbService.getCompetenciaById(this.competenciaId);
      if (!data) {
        this.showCompetenciaNotFound();
        return;
      }

      this.currentCompetencia = await Competencia.fromJSON(data);

      this.renderBasicInfo();
      this.renderParticipantes();
      this.renderCapturas();
      this.cargarParticipantesEnSelect();
      this.renderRanking();
      this.setupCompetenciaStateControls();

    } catch (error) {
      console.error('Error renderizando competencia:', error);
      NotificationService.showError('Error al cargar los detalles de la competencia');
    }
  }

  /**
   * Muestra mensaje cuando no se encuentra la competencia
   */
  showCompetenciaNotFound() {
    const elemento = DOMUtils.getElementById('nombreCompetencia');
    if (elemento) {
      elemento.textContent = 'Competencia no encontrada';
    }
  }

  /**
   * Renderiza la información básica de la competencia
   */
  renderBasicInfo() {
    const comp = this.currentCompetencia;

    // Información básica
    this.updateElement('nombreCompetencia', comp.nombre);
    this.updateElement('fechaCompetencia', comp.fecha);
    this.updateElement('lugarCompetencia', comp.lugar);
    this.updateElement('descripcionCompetencia', comp.descripcion || '-');
    this.updateElement('inscriptosCount', comp.participantes.length);

    // Estado con colores
    const estadoElement = DOMUtils.getElementById('estadoCompetencia');
    if (estadoElement) {
      estadoElement.textContent = comp.estado;
      estadoElement.className = 'badge ' + this.getEstadoBadgeClass(comp.estado);
    }
  }

  /**
   * Obtiene la clase CSS para el badge de estado
   */
  getEstadoBadgeClass(estado) {
    if (estado === APP_CONFIG.ESTADOS.FINALIZADO) return 'bg-danger';
    if (estado === APP_CONFIG.ESTADOS.EN_CURSO) return 'bg-success';
    return 'bg-secondary';
  }

  /**
   * Actualiza el contenido de un elemento
   */
  updateElement(id, content) {
    const element = DOMUtils.getElementById(id);
    if (element) {
      element.textContent = content;
    }
  }

  /**
   * Configura controles según el estado de la competencia
   */
  setupCompetenciaStateControls() {
    const esFinalizada = this.currentCompetencia.estado === APP_CONFIG.ESTADOS.FINALIZADO;

    // Botón finalizar
    const btnFinalizar = DOMUtils.getElementById('btnFinalizarCompetencia');
    if (btnFinalizar) {
      btnFinalizar.disabled = esFinalizada;
      btnFinalizar.classList.toggle('d-none', esFinalizada);
    }

    // Deshabilitar botones si está finalizada
    if (esFinalizada) {
      const tooltipMessage = 'No se pueden realizar cambios en una competencia finalizada';

      UIService.toggleElementsState([
        '[data-bs-target="#inscribirParticipanteModal"]',
        '[data-bs-target="#registrarCapturaModal"]'
      ], true, tooltipMessage);
    }
  }

  /**
   * Renderiza la lista de participantes
   */
  renderParticipantes() {
    const contenedor = DOMUtils.getElementById('listaParticipantesModal');
    if (!contenedor) return;

    const esFinalizada = this.currentCompetencia.estado === APP_CONFIG.ESTADOS.FINALIZADO;
    const html = ParticipantesModalComponent.render(
      this.currentCompetencia.participantes,
      esFinalizada,
      (id) => this.prepararEliminarParticipante(id)
    );

    contenedor.innerHTML = html;
  }

  /**
   * Renderiza las capturas en la tabla
   */
  renderCapturas() {
    const tbody = DOMUtils.getElementById('tablaCapturas');
    if (!tbody) return;

    // Recopilar todas las capturas
    const capturas = this.recopilarTodasLasCapturas();
    const esFinalizada = this.currentCompetencia.estado === APP_CONFIG.ESTADOS.FINALIZADO;

    const html = CapturaTableComponent.render(
      capturas,
      esFinalizada,
      (pId, cId) => this.prepararEdicionCaptura(pId, cId),
      (pId, cId) => this.prepararEliminarCaptura(pId, cId)
    );

    tbody.innerHTML = html;
  }

  /**
   * Recopila todas las capturas de todos los participantes
   */
  recopilarTodasLasCapturas() {
    const capturas = [];
    this.currentCompetencia.participantes.forEach(p => {
      p.capturas.forEach(c => {
        capturas.push({ participante: p, captura: c });
      });
    });
    return capturas;
  }

  /**
   * Carga participantes en el select
   */
  cargarParticipantesEnSelect() {
    const select = DOMUtils.getElementById('participanteCaptura');
    if (!select) return;

    select.innerHTML = '<option value="" selected disabled>Seleccionar participante</option>';

    if (this.currentCompetencia.participantes.length === 0) {
      select.innerHTML += '<option disabled>No hay participantes inscritos</option>';
      return;
    }

    this.currentCompetencia.participantes.forEach(p => {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = p.getNombreCompleto();
      select.appendChild(option);
    });
  }

  /**
   * Renderiza el ranking
   */
  renderRanking() {
    const modalBody = document.querySelector('#rankingModal .modal-body');
    const tbody = DOMUtils.getElementById('tablaRanking');

    if (!modalBody || !tbody) return;

    // Limpiar podios existentes
    modalBody.querySelectorAll('.podio-container').forEach(podio => podio.remove());

    const ranking = this.currentCompetencia.getRanking();
    const tablaContainer = DOMUtils.getElementById('tablaRankingContainer');
    const tabla = tablaContainer.querySelector('table');

    if (ranking.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center py-3 text-muted">No hay datos de ranking disponibles</td></tr>';
      tabla.style.display = 'table';
      return;
    }

    // Crear podio para top 3
    if (ranking.length >= 1) {
      const podioHTML = PodioComponent.render(ranking.slice(0, 3));
      const podioContainer = document.createElement('div');
      podioContainer.innerHTML = podioHTML;
      modalBody.insertBefore(podioContainer.firstElementChild, tablaContainer);
    }

    // Mostrar resto en tabla (4to lugar en adelante)
    if (ranking.length > 3) {
      tbody.innerHTML = ranking.slice(3).map((item, idx) => `
        <tr>
          <td class="text-center">${idx + 4}</td>
          <td>${item.participante.getNombreCompleto()}</td>
          <td>${FormatUtils.formatWeight(item.pesoTotal)}</td>
        </tr>
      `).join('');
      tabla.style.display = 'table';
    } else {
      tbody.innerHTML = '';
      tabla.style.display = 'none';
    }
  }

  /**
   * Muestra el modal de ranking actualizado
   */
  async showRanking() {
    try {
      await this.renderCompetencia(); // Actualizar datos
      this.renderRanking();
    } catch (error) {
      console.error('Error mostrando ranking:', error);
    }
  }

  /**
   * Agrega un nuevo participante
   */
  async agregarParticipante() {
    try {
      const nombre = DOMUtils.getElementById('nombreParticipante')?.value?.trim();
      const apellido = DOMUtils.getElementById('apellidoParticipante')?.value?.trim() || '';

      if (!ValidationUtils.isNotEmpty(nombre)) {
        NotificationService.showError(MESSAGES.ERRORS.NOMBRE_OBLIGATORIO);
        return;
      }

      const participante = new Participante(nombre, apellido);
      this.currentCompetencia.agregarParticipante(participante);

      await this.dbService.saveCompetencia(this.currentCompetencia.toJSON());

      UIService.clearForm(['nombreParticipante', 'apellidoParticipante']);
      UIService.closeModal('inscribirParticipanteModal');
      this.renderCompetencia();

      NotificationService.showSuccess(MESSAGES.SUCCESS.PARTICIPANTE_AGREGADO);
    } catch (error) {
      console.error('Error agregando participante:', error);
      NotificationService.showError('Error al agregar el participante');
    }
  }

  /**
   * Prepara la eliminación de un participante
   */
  prepararEliminarParticipante(participanteId) {
    this.participanteAEliminarId = participanteId;
    UIService.closeModal('participantesModal');
    UIService.openModal('confirmarEliminarParticipanteModal');
  }

  /**
   * Confirma y elimina un participante
   */
  async confirmarEliminarParticipante() {
    if (!this.participanteAEliminarId) return;

    try {
      this.currentCompetencia.eliminarParticipante(this.participanteAEliminarId);
      await this.dbService.saveCompetencia(this.currentCompetencia.toJSON());

      this.participanteAEliminarId = null;
      UIService.closeModal('confirmarEliminarParticipanteModal');
      this.renderCompetencia();

    } catch (error) {
      console.error('Error eliminando participante:', error);
      NotificationService.showError('Error al eliminar el participante');
    }
  }

  /**
   * Registra una nueva captura
   */
  async registrarCaptura() {
    try {
      const participanteId = DOMUtils.getElementById('participanteCaptura')?.value;
      const tipoPez = DOMUtils.getElementById('tipoPez')?.value?.trim() || '';
      const peso = DOMUtils.getElementById('pesoCaptura')?.value;

      if (!participanteId) {
        NotificationService.showError('Por favor, seleccione un participante');
        return;
      }

      if (!NotificationService.validateWeight(peso)) {
        return;
      }

      const participante = this.currentCompetencia.getParticipantePorId(participanteId);
      if (!participante) {
        NotificationService.showError(MESSAGES.ERRORS.PARTICIPANTE_NO_EXISTE);
        return;
      }

      const captura = new Captura(Number(peso), tipoPez);
      participante.capturas.push(captura);

      await this.dbService.saveCompetencia(this.currentCompetencia.toJSON());

      UIService.clearForm(['participanteCaptura', 'tipoPez', 'pesoCaptura']);
      UIService.closeModal('registrarCapturaModal');
      this.renderCompetencia();

      NotificationService.showSuccess(MESSAGES.SUCCESS.CAPTURA_REGISTRADA);
    } catch (error) {
      console.error('Error registrando captura:', error);
      NotificationService.showError(`Error al registrar la captura: ${error.message}`);
    }
  }

  /**
   * Prepara la edición de una captura
   */
  async prepararEdicionCaptura(participanteId, capturaId) {
    const participante = this.currentCompetencia.getParticipantePorId(participanteId);
    if (!participante) return;

    const captura = participante.getCapturaPorId(capturaId);
    if (!captura) return;

    this.capturaAEditarId = capturaId;
    this.participanteEditandoCapturaId = participanteId;

    // Llenar formulario
    this.updateElement('participanteCapturaEditar', participante.getNombreCompleto());
    const tipoPezElement = DOMUtils.getElementById('tipoPezEditar');
    const pesoElement = DOMUtils.getElementById('pesoCapturaEditar');

    if (tipoPezElement) tipoPezElement.value = captura.tipoPez || '';
    if (pesoElement) pesoElement.value = captura.peso;

    UIService.openModal('editarCapturaModal');
  }

  /**
   * Guarda los cambios de una captura editada
   */
  async guardarCapturaEditada() {
    try {
      const tipoPez = DOMUtils.getElementById('tipoPezEditar')?.value?.trim() || '';
      const peso = DOMUtils.getElementById('pesoCapturaEditar')?.value;

      if (!NotificationService.validateWeight(peso)) {
        return;
      }

      const participante = this.currentCompetencia.getParticipantePorId(this.participanteEditandoCapturaId);
      if (!participante) return;

      participante.actualizarCaptura(this.capturaAEditarId, {
        tipoPez: tipoPez,
        peso: Number(peso)
      });

      await this.dbService.saveCompetencia(this.currentCompetencia.toJSON());

      UIService.closeModal('editarCapturaModal');
      this.renderCompetencia();

      this.capturaAEditarId = null;
      this.participanteEditandoCapturaId = null;

    } catch (error) {
      console.error('Error editando captura:', error);
      NotificationService.showError('Error al editar la captura');
    }
  }

  /**
   * Prepara la eliminación de una captura
   */
  prepararEliminarCaptura(participanteId, capturaId) {
    this.capturaAEliminarId = capturaId;
    this.participanteEliminandoCapturaId = participanteId;
    UIService.openModal('confirmarEliminarCapturaModal');
  }

  /**
   * Confirma y elimina una captura
   */
  async confirmarEliminarCaptura() {
    try {
      const participante = this.currentCompetencia.getParticipantePorId(this.participanteEliminandoCapturaId);
      if (!participante) return;

      participante.eliminarCaptura(this.capturaAEliminarId);
      await this.dbService.saveCompetencia(this.currentCompetencia.toJSON());

      UIService.closeModal('confirmarEliminarCapturaModal');
      this.renderCompetencia();

      this.capturaAEliminarId = null;
      this.participanteEliminandoCapturaId = null;

    } catch (error) {
      console.error('Error eliminando captura:', error);
      NotificationService.showError('Error al eliminar la captura');
    }
  }

  /**
   * Finaliza la competencia
   */
  async finalizarCompetencia() {
    try {
      this.currentCompetencia.estado = APP_CONFIG.ESTADOS.FINALIZADO;
      await this.dbService.saveCompetencia(this.currentCompetencia.toJSON());

      UIService.closeModal('finalizarCompetenciaModal');
      this.renderCompetencia();

    } catch (error) {
      console.error('Error finalizando competencia:', error);
      NotificationService.showError('Error al finalizar la competencia');
    }
  }

  /**
   * Genera reporte PDF de la competencia
   */
  async generarReportePDF() {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Configuración de colores
      const colorNaranja = [255, 82, 3];
      const colorGris = [128, 128, 128];
      const colorNegro = [0, 0, 0];

      let yPosition = 20;

      // Encabezado
      doc.setFillColor(...colorNaranja);
      doc.rect(0, 0, 210, 35, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(APP_CONFIG.APP_NAME, 105, 15, { align: 'center' });

      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('Reporte de Competencia', 105, 25, { align: 'center' });

      yPosition = 50;

      // Información general
      this.addPDFSection(doc, 'INFORMACIÓN GENERAL', yPosition, colorNaranja);
      yPosition += 25;

      const fechaFormateada = FormatUtils.formatDateLong(this.currentCompetencia.fecha);

      doc.setTextColor(...colorNegro);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');

      const infoLines = [
        `Nombre: ${this.currentCompetencia.nombre}`,
        `Fecha: ${fechaFormateada}`,
        `Lugar: ${this.currentCompetencia.lugar}`,
        `Estado: ${this.currentCompetencia.estado}`,
        `Participantes inscritos: ${this.currentCompetencia.participantes.length}`
      ];

      if (this.currentCompetencia.descripcion) {
        infoLines.push(`Descripción: ${this.currentCompetencia.descripcion}`);
      }

      infoLines.forEach(line => {
        doc.text(line, 20, yPosition);
        yPosition += 8;
      });

      yPosition += 20;

      // Lista de participantes
      if (this.currentCompetencia.participantes.length > 0) {
        this.addParticipantesPDF(doc, yPosition, colorNaranja);
        yPosition = doc.lastAutoTable.finalY + 20;
      }

      // Ranking
      const ranking = this.currentCompetencia.getRanking();
      if (ranking.length > 0) {
        this.addRankingPDF(doc, yPosition, colorNaranja, ranking);
        yPosition = doc.lastAutoTable.finalY + 20;
      }

      // Capturas
      const todasLasCapturas = this.recopilarTodasLasCapturasParaPDF();
      if (todasLasCapturas.length > 0) {
        this.addCapturasPDF(doc, yPosition, colorNaranja, todasLasCapturas);
        yPosition = doc.lastAutoTable.finalY + 20;
      }

      // Estadísticas
      if (todasLasCapturas.length > 0) {
        this.addEstadisticasPDF(doc, yPosition, colorNaranja, todasLasCapturas);
      }

      // Pie de página
      this.addPDFFooter(doc, colorGris);

      // Guardar
      const nombreArchivo = `Reporte_${FormatUtils.sanitizeFileName(this.currentCompetencia.nombre)}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(nombreArchivo);

    } catch (error) {
      console.error('Error generando PDF:', error);
      NotificationService.showError('Error al generar el reporte PDF');
    }
  }

  /**
   * Agrega una sección al PDF
   */
  addPDFSection(doc, title, yPosition, color) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, yPosition);

    yPosition += 10;
    doc.setDrawColor(...color);
    doc.setLineWidth(1);
    doc.line(20, yPosition, 190, yPosition);
  }

  /**
   * Agrega tabla de participantes al PDF
   */
  addParticipantesPDF(doc, yPosition, color) {
    this.addPDFSection(doc, 'LISTA DE PARTICIPANTES', yPosition, color);
    yPosition += 15;

    const participantesData = this.currentCompetencia.participantes.map((participante, index) => [
      (index + 1).toString(),
      participante.getNombreCompleto(),
      participante.capturas.length.toString(),
      FormatUtils.formatWeight(participante.capturas.reduce((total, captura) => total + captura.peso, 0))
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['#', 'Nombre Completo', 'Capturas', 'Peso Total']],
      body: participantesData,
      theme: 'striped',
      headStyles: { fillColor: color, textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [250, 250, 250] }
    });
  }

  /**
   * Agrega ranking al PDF
   */
  addRankingPDF(doc, yPosition, color, ranking) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    this.addPDFSection(doc, 'RANKING FINAL', yPosition, color);
    yPosition += 15;

    const rankingData = ranking.map((item, index) => [
      FormatUtils.formatPosition(index),
      item.participante.getNombreCompleto(),
      FormatUtils.formatWeight(item.pesoTotal),
      `${item.participante.capturas.length} captura(s)`
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Posición', 'Participante', 'Peso Total', 'Capturas']],
      body: rankingData,
      theme: 'striped',
      headStyles: { fillColor: color, textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [250, 250, 250] }
    });
  }

  /**
   * Recopila capturas para PDF
   */
  recopilarTodasLasCapturasParaPDF() {
    const capturas = [];
    this.currentCompetencia.participantes.forEach(participante => {
      participante.capturas.forEach(captura => {
        capturas.push({
          participante: participante.getNombreCompleto(),
          tipoPez: captura.tipoPez || 'No especificado',
          peso: captura.peso,
          fecha: FormatUtils.formatDate(captura.fecha)
        });
      });
    });
    return capturas.sort((a, b) => b.peso - a.peso);
  }

  /**
   * Agrega capturas al PDF
   */
  addCapturasPDF(doc, yPosition, color, capturas) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    this.addPDFSection(doc, 'REGISTRO DE CAPTURAS', yPosition, color);
    yPosition += 15;

    const capturasData = capturas.map(captura => [
      captura.participante,
      captura.tipoPez,
      FormatUtils.formatWeight(captura.peso),
      captura.fecha
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Participante', 'Tipo de Pez', 'Peso', 'Fecha']],
      body: capturasData,
      theme: 'striped',
      headStyles: { fillColor: color, textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [250, 250, 250] }
    });
  }

  /**
   * Agrega estadísticas al PDF
   */
  addEstadisticasPDF(doc, yPosition, color, capturas) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    this.addPDFSection(doc, 'ESTADÍSTICAS', yPosition, color);
    yPosition += 15;

    const totalCapturas = capturas.length;
    const pesoTotal = capturas.reduce((sum, c) => sum + c.peso, 0);
    const pesoPromedio = totalCapturas > 0 ? (pesoTotal / totalCapturas).toFixed(2) : 0;
    const capturaMasPesada = totalCapturas > 0 ? Math.max(...capturas.map(c => c.peso)) : 0;
    const capturaMasLiviana = totalCapturas > 0 ? Math.min(...capturas.map(c => c.peso)) : 0;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    const estadisticas = [
      `- Total de capturas registradas: ${totalCapturas}`,
      `- Peso total acumulado: ${FormatUtils.formatWeight(pesoTotal)}`,
      `- Peso promedio por captura: ${FormatUtils.formatWeight(pesoPromedio)}`,
      `- Captura más pesada: ${FormatUtils.formatWeight(capturaMasPesada)}`,
      `- Captura más liviana: ${FormatUtils.formatWeight(capturaMasLiviana)}`
    ];

    estadisticas.forEach(stat => {
      doc.text(stat, 20, yPosition);
      yPosition += 8;
    });
  }

  /**
   * Agrega pie de página al PDF
   */
  addPDFFooter(doc, colorGris) {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...colorGris);
      doc.text(`Reporte generado el ${FormatUtils.formatDate(new Date().toISOString())} - Página ${i} de ${pageCount}`, 105, 285, { align: 'center' });
      doc.text(`${APP_CONFIG.APP_NAME} - Sistema de Gestión de Competencias`, 105, 290, { align: 'center' });
    }
  }
}
