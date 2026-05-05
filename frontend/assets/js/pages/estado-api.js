import { getHealth } from '../api.js';
import { renderStatus } from '../renderers.js';

const output = document.querySelector('#status-output');
const button = document.querySelector('#refresh-status');

async function refresh() {
  output.innerHTML = '<article class="status-card"><p class="eyebrow">Cargando</p><h2>Consultando API</h2></article>';
  try {
    renderStatus(output, await getHealth());
  } catch (error) {
    renderStatus(output, {
      status: 'unavailable',
      api: 'NO',
      descripcion: error.message,
      service: 'wscdc',
    });
  }
}

button.addEventListener('click', refresh);
refresh();
