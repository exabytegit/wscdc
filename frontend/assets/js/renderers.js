export function renderResult(target, result, state = 'success-approved') {
  target.dataset.state = state;
  target.textContent = typeof result === 'string' ? result : formatResult(result);
}

export function stateFromVerdict(result) {
  if (result?.verdict === 'approved') return 'success-approved';
  if (result?.verdict === 'approved_with_observations') return 'success-approved-with-observations';
  if (result?.verdict === 'rejected' || result?.verdict === 'rejected_business' || result?.verdict === 'rejected_format') return 'rejected';
  return result?.ok === false ? 'technical-error' : 'success-approved';
}

function formatMessages(label, messages = []) {
  if (!messages.length) return '';
  return `${label}:\n${messages.map((item) => `- ${item.code}: ${item.msg}`).join('\n')}`;
}

function formatResult(result) {
  const lines = [
    `Resultado: ${result.verdict || 'sin verdict'}`,
    `ARCA: ${result.resultado || 'sin resultado'}`,
    `Servicio: ${result.service || 'wscdc'} / ${result.arcaEnv || 'homologacion'}`,
  ];

  const cmp = result.cmpResp || {};
  if (cmp.cbteModo || cmp.cuitEmisor) {
    lines.push(`Comprobante: ${cmp.cbteModo || '-'} ${cmp.cuitEmisor || '-'} PV ${cmp.ptoVta || '-'} Nro ${cmp.cbteNro || '-'}`);
  }

  for (const block of [
    formatMessages('Observaciones', result.observaciones),
    formatMessages('Errores', result.errors),
    formatMessages('Eventos', result.events),
  ]) {
    if (block) lines.push(block);
  }

  if (result.descripcion) lines.push(`Detalle: ${result.descripcion}`);
  if (result.scenario) lines.push(`Escenario: ${result.scenario}`);
  return lines.join('\n\n');
}

export function renderStatus(target, status) {
  const isOk = status.ok === true || (status.appserver === 'OK' && status.dbserver === 'OK' && status.authserver === 'OK');
  const visualState = isOk ? 'operational' : status.status || 'unavailable';
  const cards = [
    ['API', isOk ? 'OK' : status.api || 'NO'],
    ['AppServer', status.appserver || 'NO'],
    ['DbServer', status.dbserver || 'NO'],
    ['AuthServer', status.authserver || 'NO'],
    ['Ambiente', status.arcaEnv || 'desconocido'],
    ['Servicio', status.service || 'wscdc'],
    ['Actualizado', status.updatedAt || new Date().toLocaleString('es-AR')],
  ];

  target.innerHTML = cards.map(([label, value]) => `
    <article class="status-card" data-state="${visualState}">
      <p class="eyebrow">${label}</p>
      <h2>${value}</h2>
    </article>
  `).join('') + (status.descripcion ? `
    <article class="status-card status-card-wide" data-state="unavailable">
      <p class="eyebrow">Detalle</p>
      <h2>${status.descripcion}</h2>
    </article>
  ` : '');
}

export function renderStoredResult(target, stored) {
  if (!stored) {
    target.dataset.state = 'technical-error';
    target.textContent = 'No hay resultado guardado. Vuelva a constatar un comprobante.';
    return;
  }

  const state = stateFromVerdict(stored.response);
  renderResult(target, stored.response, state);
}
