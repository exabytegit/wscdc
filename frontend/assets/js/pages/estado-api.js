import { getDummy } from '../api.js';
import { renderStatus } from '../renderers.js';

const output = document.querySelector('#status-output');
const button = document.querySelector('#refresh-status');

async function refresh() {
  output.innerHTML = '<article class="status-card"><p class="eyebrow">Cargando</p><h2>Consultando API</h2></article>';
  try {
    const status = await getDummy();
    renderStatus(output, { ...status, updatedAt: new Date().toLocaleString('es-AR') });
  } catch (error) {
    renderStatus(output, {
      status: 'unavailable',
      api: 'NO',
      descripcion: error.message,
      service: 'wscdc',
      arcaEnv: 'produccion',
      updatedAt: new Date().toLocaleString('es-AR'),
    });
  }
}

button.addEventListener('click', refresh);
refresh();
