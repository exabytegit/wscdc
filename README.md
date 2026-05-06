# wscdc-constatacion

Proyecto independiente para constatacion de comprobantes WSCDC.

La solucion separa:

- `api/`: API intermedia Node.js para WSAA, SOAP, TA cache y normalizacion JSON.
- `frontend/`: HTML, CSS y JavaScript sin framework.
- `frontend/docs/`: documentacion operativa y tecnica.

No se incluyen certificados, `.env.production`, credenciales reales ni TA cache.

## Documentacion clave

- `frontend/docs/manual-wscdc-notas-api.md`: resumen tecnico del manual oficial WSCDC.
- `frontend/docs/casos-homologacion-wscdc.md`: plantilla y procedimiento para pruebas controladas de `ComprobanteConstatar`.
- `frontend/docs/casos-produccion-controlados-wscdc.md`: casos reales controlados de produccion, solo para ejecucion manual.
- `frontend/docs/checklist-homologacion.md`: pasos operativos de homologacion.
- `frontend/docs/troubleshooting.md`: errores conocidos de conectividad y TLS.

## Ejecucion local produccion WSCDC

Levantar API:

```powershell
cd C:\ARCA-PROYECTOS\wscdc-constatacion\api
npm run dev:prod
```

Levantar frontend:

```powershell
cd C:\ARCA-PROYECTOS\wscdc-constatacion\frontend
py -m http.server 5500 --bind 127.0.0.1
```

URLs:

- `http://127.0.0.1:5500/index.html`
- `http://127.0.0.1:5500/constatar.html`
- `http://127.0.0.1:5500/resultado.html`
- `http://127.0.0.1:5500/estado-api.html`

Advertencia: este sistema consulta ARCA PRODUCCION real. No hacer pruebas masivas.
