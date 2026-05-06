import { renderStoredResult } from '../renderers.js';

const output = document.querySelector('#result-output');
const meta = document.querySelector('#result-meta');
const raw = sessionStorage.getItem('wscdc:last-result');
const stored = raw ? JSON.parse(raw) : null;

renderStoredResult(output, stored);

if (stored && meta) {
  const createdAt = stored.createdAt ? new Date(stored.createdAt).toLocaleString('es-AR') : 'sin fecha';
  meta.textContent = `Consulta manual registrada: ${createdAt}. No se guardan secretos en el navegador.`;
}
