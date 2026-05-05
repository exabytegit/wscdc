# Arquitectura

## Flujo

```text
Frontend HTML/CSS/JS -> API JSON propia -> WSAA -> WSCDC SOAP -> API JSON propia -> Frontend
```

El navegador nunca conoce certificados, claves, Token, Sign, TRA, CMS ni XML SOAP con credenciales.

## Backend

- `src/config.js`: variables por ambiente.
- `src/services/wsaa.js`: LoginTicketRequest, OpenSSL y TA cache.
- `src/services/wscdc/`: SOAP, validadores, mappers y catalogos WSCDC.
- `src/routes/`: endpoints JSON internos.

El TA se persiste como `ta-{ambiente}-{servicio}.json`, por ejemplo `ta-homologacion-wscdc.json`.

## Frontend

- HTML semantico.
- CSS modular responsive.
- JavaScript ES Modules.
- `fetch` solo contra la API propia.
- Formulario de constatacion conectado a `POST /api/wscdc/constatar`.
