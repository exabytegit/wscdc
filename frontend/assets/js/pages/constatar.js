import { constatar } from '../api.js';
import { validateConstatarForm } from '../validators.js';
import { renderResult, stateFromVerdict } from '../renderers.js';

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

  try {
    renderResult(output, 'Consultando API...', 'loading');
    const result = await constatar(payload);
    renderResult(output, result, stateFromVerdict(result));
  } catch (error) {
    const state = error.status === 400 ? 'functional-error' : 'technical-error';
    renderResult(output, error.data || error.message, state);
  }
});

form.addEventListener('reset', () => {
  renderResult(output, 'Esperando datos.', 'idle');
});
