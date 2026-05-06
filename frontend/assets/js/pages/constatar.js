import { constatar } from '../api.js';
import { normalizeConstatarPayload, validateConstatarForm } from '../validators.js';
import { renderResult } from '../renderers.js';

const form = document.querySelector('#constatar-form');
const output = document.querySelector('#result-output');
const submitButton = form.querySelector('button[type="submit"]');

function formToPayload(formData) {
  return Object.fromEntries(formData.entries());
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = normalizeConstatarPayload(formToPayload(new FormData(form)));
  const errors = validateConstatarForm(payload);

  if (errors.length) {
    renderResult(output, errors.join('\n'), 'functional-error');
    return;
  }

  try {
    submitButton.disabled = true;
    submitButton.textContent = 'Consultando...';
    renderResult(output, 'Consultando API...', 'loading');
    const result = await constatar(payload);
    sessionStorage.setItem('wscdc:last-result', JSON.stringify({
      payload,
      response: result,
      createdAt: new Date().toISOString(),
    }));
    window.location.href = 'resultado.html';
  } catch (error) {
    const state = error.status === 400 ? 'functional-error' : 'technical-error';
    renderResult(output, error.data || error.message, state);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Constatar comprobante';
  }
});

form.addEventListener('reset', () => {
  renderResult(output, 'Esperando datos.', 'idle');
});
