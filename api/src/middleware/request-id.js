import crypto from 'node:crypto';

export function requestId(req, res, next) {
  const incoming = req.get('X-Request-Id');
  req.id = incoming && incoming.trim() ? incoming.trim() : crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
}
