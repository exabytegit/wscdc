# Seguridad

## Nunca exponer

- Token.
- Sign.
- Private key.
- Certificados.
- CSR.
- PFX/P12.
- `.env`.
- `.env.production`.
- XML SOAP completo con Auth.

## Git

El repo ignora `.env`, `.env.*`, `certs/`, `tmp/`, claves, certificados y caches TA.

Solo se versionan `.env.example` y `.gitkeep` necesarios para preservar estructura.

## Logs

Permitido:

- Ambiente.
- Servicio.
- Endpoint logico.
- Request ID.
- Estado HTTP.
- Resultado funcional.

Prohibido:

- Token.
- Sign.
- Private key.
- Certificados.
- XML completo con credenciales.

## Cuarentena inicial

El material sensible heredado fue movido sin leer contenido a `C:\tmp\wscdc-constatacion-quarantine\20260505-153000`.
