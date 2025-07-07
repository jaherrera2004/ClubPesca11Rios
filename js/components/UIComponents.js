import { APP_CONFIG, MESSAGES } from '../config/constants.js';
import { FormatUtils, DOMUtils } from '../utils/helpers.js';
import { UIService } from '../services/UIService.js';

/**
 * Componente para renderizar tarjetas de competencias
 */
export class CompetenciaCard {
  static render(competencia, onDelete, onViewDetails) {
    const template = document.getElementById("competenciaTemplate");
    if (!template) return null;

    const clone = template.content.cloneNode(true);

    // Configurar contenido
    clone.querySelector(".card-title").textContent = competencia.nombre;
    clone.querySelector(".fecha-competencia").textContent = FormatUtils.formatDate(competencia.fecha);
    clone.querySelector(".lugar-competencia").textContent = competencia.lugar;

    // Configurar estado
    const estadoElement = clone.querySelector(".estado-competencia");
    estadoElement.textContent = competencia.estado;
    estadoElement.classList.add(
      competencia.estado === APP_CONFIG.ESTADOS.EN_CURSO ? 'bg-success' : 'bg-secondary'
    );

    // Aplicar estilos
    clone.querySelector(".card-header").classList.add(APP_CONFIG.CSS_CLASSES.BG_NARANJA);
    clone.querySelector(".card").classList.add(APP_CONFIG.CSS_CLASSES.CARD_HOVER);

    // Crear botones
    const btnEliminar = UIService.createButton('Eliminar', ['btn-danger', 'flex-fill']);
    btnEliminar.addEventListener('click', (e) => {
      e.stopPropagation();
      onDelete(competencia.id);
    });

    const btnDetalles = UIService.createButton('Ver detalles',
      [APP_CONFIG.CSS_CLASSES.BTN_OUTLINE_NARANJA, 'flex-fill']);
    btnDetalles.addEventListener('click', (e) => {
      e.preventDefault();
      onViewDetails(competencia.id);
    });

    // Configurar contenedor de botones
    const btnsContainer = clone.querySelector('.d-grid.gap-2');
    btnsContainer.classList.remove('d-grid');
    btnsContainer.classList.add('d-flex', 'gap-2');
    btnsContainer.innerHTML = '';
    btnsContainer.appendChild(btnEliminar);
    btnsContainer.appendChild(btnDetalles);

    return clone;
  }
}

/**
 * Componente para renderizar el podio de ganadores
 */
export class PodioComponent {
  static render(ranking) {
    if (!ranking || ranking.length === 0) {
      return '<div class="text-center py-4 text-muted">No hay participantes para mostrar en el podio</div>';
    }

    const podioHTML = `
      <div class="podio-container mb-4">
        <h4 class="text-center mb-4">
          <i class="fa-solid fa-trophy text-warning me-2"></i>
          Podio de Ganadores
        </h4>
        <div class="row justify-content-center">
          ${this.renderPodioPositions(ranking)}
        </div>
      </div>
    `;

    return podioHTML;
  }

  static renderPodioPositions(ranking) {
    const positions = [];
    const colors = ['warning', 'secondary', 'danger']; // Oro, Plata, Bronce
    const icons = ['fa-trophy', 'fa-medal', 'fa-medal'];
    const heights = ['120px', '100px', '80px'];

    // Ordenar posiciones para mostrar: 2do, 1ro, 3ro
    const displayOrder = [1, 0, 2];

    displayOrder.forEach((index, displayIndex) => {
      if (ranking[index]) {
        const item = ranking[index];
        const position = index + 1;
        const colorClass = colors[index];
        const iconClass = icons[index];
        const height = heights[index];

        positions.push(`
          <div class="col-4 text-center">
            <div class="podio-position bg-light rounded p-3 shadow-sm" style="min-height: ${height};">
              <div class="podio-icon mb-2">
                <i class="${iconClass} fa-2x text-${colorClass}"></i>
              </div>
              <div class="podio-position-number">
                <span class="badge bg-${colorClass} fs-6">${position}°</span>
              </div>
              <div class="podio-participant mt-2">
                <strong class="d-block">${item.participante.getNombreCompleto()}</strong>
                <small class="text-muted">${FormatUtils.formatWeight(item.pesoTotal)}</small>
              </div>
            </div>
          </div>
        `);
      }
    });

    return positions.join('');
  }
}

/**
 * Componente para renderizar la lista de participantes en el modal
 */
export class ParticipantesModalComponent {
  static render(participantes, esFinalizada, onEliminar) {
    if (!participantes || participantes.length === 0) {
      return `
        <div class="text-center py-4 text-muted">
          <i class="fa-solid fa-users fs-1 mb-3"></i>
          <p>${MESSAGES.INFO.NO_PARTICIPANTES}</p>
        </div>
      `;
    }

    const participantesHTML = participantes.map((participante, index) => {
      const pesoTotal = participante.getPesoTotal();
      const totalCapturas = participante.getTotalCapturas();

      return `
        <div class="card mb-3 shadow-sm">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-md-6">
                <h6 class="card-title mb-1">
                  <i class="fa-solid fa-user me-2 text-primary"></i>
                  ${participante.getNombreCompleto()}
                </h6>
                <small class="text-muted">Participante #${index + 1}</small>
              </div>
              <div class="col-md-4">
                <div class="row text-center">
                  <div class="col-6">
                    <div class="border-end">
                      <div class="fw-bold text-success">${totalCapturas}</div>
                      <small class="text-muted">Capturas</small>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="fw-bold text-info">${FormatUtils.formatWeight(pesoTotal)}</div>
                    <small class="text-muted">Peso Total</small>
                  </div>
                </div>
              </div>
              <div class="col-md-2 text-end">
                ${!esFinalizada ? `
                  <button class="btn btn-outline-danger btn-sm eliminar-participante-modal"
                          data-id="${participante.id}"
                          title="Eliminar participante">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    return participantesHTML;
  }
}

/**
 * Componente para renderizar la tabla de capturas
 */
export class CapturaTableComponent {
  static render(capturas, esFinalizada, onEditar, onEliminar) {
    if (!capturas || capturas.length === 0) {
      return `
        <tr>
          <td colspan="4" class="text-center py-3 text-muted">
            <i class="fa-solid fa-fish me-2"></i>
            ${MESSAGES.INFO.NO_CAPTURAS}
          </td>
        </tr>
      `;
    }

    // Ordenar capturas por peso descendente
    const capturasOrdenadas = [...capturas].sort((a, b) => b.captura.peso - a.captura.peso);

    return capturasOrdenadas.map((item, index) => {
      const { participante, captura } = item;
      const esLaMasPesada = index === 0;

      return `
        <tr ${esLaMasPesada ? 'class="table-warning"' : ''}>
          <td>
            <div class="d-flex align-items-center">
              <i class="fa-solid fa-user me-2 text-primary"></i>
              <span>${participante.getNombreCompleto()}</span>
              ${esLaMasPesada ? '<i class="fa-solid fa-crown ms-2 text-warning" title="Captura más pesada"></i>' : ''}
            </div>
          </td>
          <td>
            <span class="badge bg-info">
              ${captura.tipoPez || 'No especificado'}
            </span>
          </td>
          <td>
            <strong class="text-success">${FormatUtils.formatWeight(captura.peso)}</strong>
          </td>
          <td>
            ${!esFinalizada ? `
              <div class="btn-group btn-group-sm" role="group">
                <button class="btn btn-outline-primary btn-editar-captura"
                        data-participante-id="${participante.id}"
                        data-captura-id="${captura.id}"
                        title="Editar captura">
                  <i class="fa-solid fa-edit"></i>
                </button>
                <button class="btn btn-outline-danger btn-eliminar-captura"
                        data-participante-id="${participante.id}"
                        data-captura-id="${captura.id}"
                        title="Eliminar captura">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            ` : `
              <span class="text-muted">
                <i class="fa-solid fa-lock me-1"></i>
                Finalizada
              </span>
            `}
          </td>
        </tr>
      `;
    }).join('');
  }
}

/**
 * Componente para mostrar estadísticas rápidas
 */
export class EstadisticasComponent {
  static render(competencia) {
    const estadisticas = competencia.getEstadisticas();

    return `
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card text-center bg-primary text-white">
            <div class="card-body">
              <i class="fa-solid fa-users fa-2x mb-2"></i>
              <h4>${estadisticas.totalParticipantes}</h4>
              <small>Participantes</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center bg-success text-white">
            <div class="card-body">
              <i class="fa-solid fa-fish fa-2x mb-2"></i>
              <h4>${estadisticas.totalCapturas}</h4>
              <small>Capturas</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center bg-info text-white">
            <div class="card-body">
              <i class="fa-solid fa-weight-hanging fa-2x mb-2"></i>
              <h4>${FormatUtils.formatWeight(estadisticas.pesoTotal)}</h4>
              <small>Peso Total</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center bg-warning text-white">
            <div class="card-body">
              <i class="fa-solid fa-chart-line fa-2x mb-2"></i>
              <h4>${FormatUtils.formatWeight(estadisticas.pesoPromedio)}</h4>
              <small>Promedio</small>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Componente para alertas y notificaciones
 */
export class AlertComponent {
  static renderSuccess(message) {
    return `
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="fa-solid fa-check-circle me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
  }

  static renderError(message) {
    return `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="fa-solid fa-exclamation-triangle me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
  }

  static renderWarning(message) {
    return `
      <div class="alert alert-warning alert-dismissible fade show" role="alert">
        <i class="fa-solid fa-exclamation-circle me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
  }

  static renderInfo(message) {
    return `
      <div class="alert alert-info alert-dismissible fade show" role="alert">
        <i class="fa-solid fa-info-circle me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
  }
}
