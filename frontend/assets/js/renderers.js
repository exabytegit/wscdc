export function renderResult(target, result, state = 'success-approved') {
  target.dataset.state = state;
  target.textContent = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
}

export function renderStatus(target, status) {
  const cards = [
    ['API', status.api || 'NO'],
    ['AppServer', status.appserver || 'NO'],
    ['DbServer', status.dbserver || 'NO'],
    ['AuthServer', status.authserver || 'NO'],
    ['Ambiente', status.arcaEnv || 'desconocido'],
    ['Servicio', status.service || 'wscdc'],
  ];

  target.innerHTML = cards.map(([label, value]) => `
    <article class="status-card" data-state="${status.status || 'unavailable'}">
      <p class="eyebrow">${label}</p>
      <h2>${value}</h2>
    </article>
  `).join('');
}
