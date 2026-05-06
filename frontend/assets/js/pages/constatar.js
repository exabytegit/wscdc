import { MODALIDADES, TIPOS_COMPROBANTE, TIPOS_DOCUMENTO } from '../catalogos.js';
import { constatar } from '../api.js';
import { getConstatarFieldErrors, normalizeConstatarPayload, validateConstatarForm } from '../validators.js';
import { renderResult } from '../renderers.js';

const form = document.querySelector('#constatar-form');
const output = document.querySelector('#result-output');
const submitButton = form.querySelector('button[type="submit"]');
const exampleButton = document.querySelector('#load-example');
const fieldErrorNodes = new Map(
  Array.from(document.querySelectorAll('[data-error-for]')).map((node) => [node.dataset.errorFor, node]),
);

export const CONSTATAR_FIELD_NAMES = [
  'cbteModo',
  'cuitEmisor',
  'ptoVta',
  'cbteTipo',
  'cbteNro',
  'cbteFch',
  'impTotal',
  'codAutorizacion',
  'docTipoReceptor',
  'docNroReceptor',
];

const VALIDATED_EXAMPLE = {
  cbteModo: 'CAE',
  cuitEmisor: '30714687650',
  ptoVta: '2',
  cbteTipo: '1',
  cbteNro: '531979',
  cbteFch: '20260504',
  impTotal: '225786.00',
  codAutorizacion: '86184110432968',
  docTipoReceptor: '80',
  docNroReceptor: '20307764327',
};

function renderSelectOptions(select, items, placeholder) {
  select.innerHTML = [
    `<option value="">${placeholder}</option>`,
    ...items.map((item) => `<option value="${item.value}">${item.label}</option>`),
  ].join('');
}

function hydrateCatalogs() {
  renderSelectOptions(form.elements.namedItem('cbteModo'), MODALIDADES, 'Seleccionar modalidad');
  renderSelectOptions(form.elements.namedItem('cbteTipo'), TIPOS_COMPROBANTE, 'Seleccionar tipo de comprobante');
  renderSelectOptions(form.elements.namedItem('docTipoReceptor'), TIPOS_DOCUMENTO, 'Seleccionar tipo de documento');
}

function formToPayload(formData) {
  return Object.fromEntries(formData.entries());
}

function fillForm(values) {
  for (const name of CONSTATAR_FIELD_NAMES) {
    if (!Object.prototype.hasOwnProperty.call(values, name)) continue;
    const field = form.elements.namedItem(name);
    if (field) field.value = values[name];
  }
}

function prefillFromQueryString() {
  const params = new URLSearchParams(window.location.search);
  const values = {};

  for (const name of CONSTATAR_FIELD_NAMES) {
    if (params.has(name)) values[name] = params.get(name);
  }

  if (Object.keys(values).length) {
    fillForm(values);
    renderResult(output, 'Datos cargados desde la URL. Revise el comprobante antes de consultar ARCA PRODUCCION real.', 'idle');
  }
}

function clearFieldErrors() {
  for (const [name, node] of fieldErrorNodes.entries()) {
    node.textContent = '';
    const field = form.elements.namedItem(name);
    if (field) field.removeAttribute('aria-invalid');
  }
}

function applyFieldErrors(payload) {
  clearFieldErrors();
  const fieldErrors = getConstatarFieldErrors(payload);
  for (const [field, messages] of Object.entries(fieldErrors)) {
    const node = fieldErrorNodes.get(field);
    if (node) node.textContent = messages[0];
    const input = form.elements.namedItem(field);
    if (input) input.setAttribute('aria-invalid', 'true');
  }
}

hydrateCatalogs();
prefillFromQueryString();

exampleButton.addEventListener('click', () => {
  fillForm(VALIDATED_EXAMPLE);
  clearFieldErrors();
  renderResult(output, 'Ejemplo validado cargado. Ejecutar solo como consulta manual controlada.', 'idle');
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = normalizeConstatarPayload(formToPayload(new FormData(form)));
  const errors = validateConstatarForm(payload);

  if (errors.length) {
    applyFieldErrors(payload);
    renderResult(output, errors.join('\n'), 'functional-error');
    return;
  }

  try {
    clearFieldErrors();
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
  clearFieldErrors();
  renderResult(output, 'Esperando datos.', 'idle');
});
