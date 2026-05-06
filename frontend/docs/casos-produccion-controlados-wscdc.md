# Casos de produccion controlados WSCDC

Este documento registra casos reales controlados para `ComprobanteConstatar` contra WSCDC produccion.

No ejecutar estos casos automaticamente. No usarlos en homologacion. No hacer pruebas masivas. No registrar Token, Sign, certificados, claves privadas, rutas sensibles ni XML SOAP completo.

## Condiciones de uso

Antes de ejecutar cualquier caso de este documento:

- La API debe estar levantada con `ARCA_ENV=produccion`.
- El servicio WSCDC productivo debe estar autorizado para el computador fiscal correspondiente.
- `.env.production`, certificados productivos y TA cache productivo deben estar configurados fuera del control de version.
- Debe ejecutarse una unica prueba manual por caso.
- Debe registrarse el resultado obtenido sin exponer secretos.

## Comando manual base

Usar solo con la API levantada en produccion:

```powershell
Invoke-RestMethod `
  -Method POST `
  -Uri "http://localhost:3002/api/wscdc/constatar" `
  -ContentType "application/json" `
  -Body '<PAYLOAD_JSON>'
```

## Caso: factura A Soluciones OnLine S.A.

- Tipo: aprobado
- Marcador: CASO REAL PRODUCCION CONTROLADO
- Fuente del dato: factura real y constatacion manual de ARCA.
- Ambiente correcto: produccion.
- Estado: pendiente de ejecucion automatica; disponible solo para prueba manual controlada.
- Resultado esperado: autorizado, `Resultado=A`.

La constatacion manual de ARCA indica que los datos ingresados coinciden con una autorizacion otorgada por ARCA.

### Datos del comprobante

- `CbteModo`: `CAE`
- `CuitEmisor`: `30714687650`
- `PtoVta`: `2`
- `CbteTipo`: `1`
- `CbteNro`: `531979`
- `CbteFch`: `20260504`
- `ImpTotal`: `225786.00`
- `CodAutorizacion`: `86184110432968`
- `DocTipoReceptor`: `80`
- `DocNroReceptor`: `20307764327`

### Payload

```json
{
  "CbteModo": "CAE",
  "CuitEmisor": "30714687650",
  "PtoVta": 2,
  "CbteTipo": 1,
  "CbteNro": 531979,
  "CbteFch": "20260504",
  "ImpTotal": 225786.00,
  "CodAutorizacion": "86184110432968",
  "DocTipoReceptor": "80",
  "DocNroReceptor": "20307764327"
}
```

### Comando manual del caso

No ejecutar desde scripts ni tests. Ejecutar una unica vez cuando produccion este configurada y autorizada.

```powershell
Invoke-RestMethod `
  -Method POST `
  -Uri "http://localhost:3002/api/wscdc/constatar" `
  -ContentType "application/json" `
  -Body '{
    "CbteModo": "CAE",
    "CuitEmisor": "30714687650",
    "PtoVta": 2,
    "CbteTipo": 1,
    "CbteNro": 531979,
    "CbteFch": "20260504",
    "ImpTotal": 225786.00,
    "CodAutorizacion": "86184110432968",
    "DocTipoReceptor": "80",
    "DocNroReceptor": "20307764327"
  }'
```

### Resultado esperado

```json
{
  "ok": true,
  "verdict": "approved",
  "resultado": "A"
}
```

Puede incluir `events` informativos. Si ARCA devuelve `Observaciones`, registrar el caso como `approved_with_observations` y documentar los codigos.

### Resultado obtenido

Intento registrado el `2026-05-05 21:04:00 -03:00`.

- API iniciada en `ARCA_ENV=produccion`, `service=wscdc`, `port=3002`.
- Verificacion previa `GET /api/health`: `HTTP 502`.
- Error resumido: `NETWORK_ERROR` al invocar `ComprobanteDummy` contra WSCDC produccion.
- Detalle tecnico no sensible: handshake TLS rechazado por `dh key too small`.
- `POST /api/wscdc/constatar`: no ejecutado.
- Motivo: la verificacion previa de health no fue exitosa.

No pegar Token, Sign, certificados, claves, rutas sensibles ni XML SOAP.

### Observaciones

Este caso no sirve para validar homologacion. Si se necesita un caso de homologacion, solicitar/producir un comprobante controlado en ese ambiente y registrarlo en `casos-homologacion-wscdc.md`.
