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
