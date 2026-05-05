# Casos controlados de homologacion WSCDC

Este documento organiza pruebas manuales para `ComprobanteConstatar` en homologacion.

No registra credenciales, Token, Sign, certificados, claves privadas ni XML SOAP completo. La prueba debe realizarse siempre contra la API local WSCDC y nunca contra produccion.

## Campos requeridos

`ComprobanteConstatar` recibe `Auth` generado por la API y un `CmpReq` con los datos del comprobante.

Campos de `CmpReq`:

- `CbteModo`: modalidad de autorizacion. Valores esperados: `CAE`, `CAEA`, `CAI`.
- `CuitEmisor`: CUIT del emisor del comprobante.
- `PtoVta`: punto de venta.
- `CbteTipo`: tipo de comprobante.
- `CbteNro`: numero de comprobante.
- `CbteFch`: fecha del comprobante en formato `yyyymmdd`.
- `ImpTotal`: importe total.
- `CodAutorizacion`: CAE, CAEA o CAI, de 14 digitos.
- `DocTipoReceptor`: tipo de documento receptor, cuando corresponda.
- `DocNroReceptor`: numero de documento receptor, cuando corresponda.
- `Opcionales`: arreglo opcional de `{ "id": "...", "valor": "..." }`.

## Advertencia

No usar comprobantes inventados para validar funcionamiento real. Un comprobante inventado solo sirve para verificar validaciones locales, rechazo controlado o manejo de errores; no demuestra que `ComprobanteConstatar` funciona funcionalmente contra ARCA.

No ejecutar pruebas masivas. Cada caso debe ejecutarse una vez y registrarse.

## Tipos de casos

- `aprobado`: ARCA devuelve `Resultado=A` sin observaciones.
- `aprobado observado`: ARCA devuelve `Resultado=A` con `Observaciones`.
- `rechazado por formato`: ARCA devuelve `Resultado=R` con `Errors`.
- `rechazado funcional`: ARCA devuelve `Resultado=R` con `Observaciones`.
- `error tecnico`: la API devuelve error HTTP por red, WSAA, SOAP fault, timeout o configuracion.

## Plantilla de caso

````md
## Caso: <nombre del caso>

- Tipo: aprobado | aprobado observado | rechazado por formato | rechazado funcional | error tecnico
- Fuente del dato: manual oficial | caso provisto por ARCA | comprobante real controlado | dato ficticio para validacion local
- Fecha de prueba:
- Responsable:

### Payload

```json
{
  "cbteModo": "",
  "cuitEmisor": "",
  "ptoVta": 0,
  "cbteTipo": 0,
  "cbteNro": 0,
  "cbteFch": "",
  "impTotal": 0,
  "codAutorizacion": "",
  "docTipoReceptor": "",
  "docNroReceptor": "",
  "opcionales": []
}
```

### Resultado esperado

Describir `verdict`, `resultado`, `observaciones`, `errors` y `events` esperados.

### Resultado obtenido

Registrar HTTP status y respuesta JSON normalizada. No pegar Token, Sign ni XML SOAP.

### Observaciones

Registrar contexto, decision tomada y si el caso queda aprobado para repetir en futuras regresiones.
````

## Ejemplos ficticios

Estos ejemplos son `NO OFICIAL` y no deben ejecutarse masivamente. Sirven para validar forma del payload, validaciones locales y comportamiento controlado del frontend/API.

### NO OFICIAL: payload con fecha invalida

Uso esperado: debe ser rechazado por validacion local/backend antes de llamar a ARCA.

```json
{
  "cbteModo": "CAE",
  "cuitEmisor": "20111111112",
  "ptoVta": 1,
  "cbteTipo": 1,
  "cbteNro": 123,
  "cbteFch": "20250231",
  "impTotal": 1000.5,
  "codAutorizacion": "12345678901234",
  "docTipoReceptor": "",
  "docNroReceptor": "",
  "opcionales": []
}
```

### NO OFICIAL: payload formalmente valido pero no comprobante real

Uso esperado: no usar para afirmar funcionamiento real. Puede generar rechazo funcional si se ejecuta una unica vez en homologacion.

```json
{
  "cbteModo": "CAE",
  "cuitEmisor": "20111111112",
  "ptoVta": 1,
  "cbteTipo": 1,
  "cbteNro": 123,
  "cbteFch": "20250131",
  "impTotal": 1000.5,
  "codAutorizacion": "12345678901234",
  "docTipoReceptor": "",
  "docNroReceptor": "",
  "opcionales": []
}
```

## Ejecucion manual de un unico caso

1. Levantar la API en homologacion:

```powershell
cd C:\ARCA-PROYECTOS\wscdc-constatacion\api
npm run dev:homo
```

2. Verificar estado tecnico:

```powershell
Invoke-RestMethod -UseBasicParsing -Uri "http://localhost:3002/api/health"
```

3. Levantar el frontend:

```powershell
cd C:\ARCA-PROYECTOS\wscdc-constatacion\frontend
py -m http.server 5501 --bind 127.0.0.1
```

4. Abrir el formulario:

```text
http://127.0.0.1:5501/constatar.html
```

5. Cargar el payload del caso, ejecutar una sola vez y registrar:

- HTTP status.
- `ok`.
- `verdict`.
- `resultado`.
- `observaciones`.
- `errors`.
- `events`.
- `requestId`, si aparece.

## Casos a completar

### Caso aprobado

- Tipo: aprobado
- Fuente del dato: pendiente de caso oficial ARCA o comprobante real controlado de homologacion.
- Estado: pendiente.

### Caso aprobado observado

- Tipo: aprobado observado
- Fuente del dato: pendiente de caso oficial ARCA o comprobante real controlado de homologacion.
- Estado: pendiente.

### Caso rechazado por formato

- Tipo: rechazado por formato
- Fuente del dato: se puede usar payload ficticio de fecha invalida para validar corte local.
- Estado: disponible para validacion local; no demuestra funcionamiento real de ARCA.

### Caso rechazado funcional

- Tipo: rechazado funcional
- Fuente del dato: pendiente de caso oficial ARCA o comprobante real controlado de homologacion.
- Estado: pendiente.

### Caso error tecnico

- Tipo: error tecnico
- Fuente del dato: simular entorno controlado sin API o sin conectividad.
- Estado: pendiente de ejecucion controlada si hace falta validar UX de error.

## Proximos datos necesarios

Para validar `ComprobanteConstatar` funcionalmente se necesita al menos un caso oficial o controlado con:

- CUIT emisor.
- Punto de venta.
- Tipo y numero de comprobante.
- Fecha.
- Importe exacto.
- CAE, CAEA o CAI.
- Datos de receptor cuando el tipo de comprobante lo requiera.
- Resultado esperado documentado.
