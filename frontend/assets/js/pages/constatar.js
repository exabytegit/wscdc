import { USE_MOCK } from '../config.js';
import { constatar } from '../api.js';
import { validateConstatarForm } from '../validators.js';
import { renderResult } from '../renderers.js';

const form = document.querySelector('#constatar-form');
const output = document.querySelector('#result-output');

function formToPayload(formData) {
  return Object.fromEntries(formData.entries());
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = formToPayload(new FormData(form));
  const errors = validateConstatarForm(payload);

  if (errors.length) {
    renderResult(output, errors.join('\n'), 'functional-error');
    return;
  }

  if (USE_MOCK) {
    renderResult(output, {
      ok: true,
      service: 'wscdc',
      arcaEnv: 'homologacion',
      verdict: 'mock_pending',
      mensaje: 'Validacion local correcta. ComprobanteConstatar real queda pendiente de casos oficiales.',
      payload,
    });
    return;
  }

  try {
    renderResult(output, 'Consultando API...', 'loading');
    renderResult(output, await constatar(payload));
  } catch (error) {
    renderResult(output, error.data || error.message, 'technical-error');
  }
});

form.addEventListener('reset', () => {
  renderResult(output, 'Esperando datos.', 'idle');
});
