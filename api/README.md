# API WSCDC

API interna Node.js para encapsular WSAA, OpenSSL, TA cache y SOAP WSCDC.

## Scripts

```bash
npm run dev:homo
npm test
```

`npm run dev:prod` existe para preparar configuracion, pero no debe ejecutarse hasta completar checklist productivo y credenciales reales fuera del repo.

## Endpoints

- `GET /api/health`
- `GET /api/wscdc/dummy`
- `GET /api/wscdc/catalogos/modalidades`
- `GET /api/wscdc/catalogos/comprobantes`
- `GET /api/wscdc/catalogos/documentos`
- `GET /api/wscdc/catalogos/opcionales`
- `POST /api/wscdc/constatar`

`constatar` valida payload y responde `501 CONSTATAR_PENDING_OFFICIAL_CASES` hasta cerrar casos oficiales de homologacion.
