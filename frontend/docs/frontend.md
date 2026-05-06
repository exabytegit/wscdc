# Frontend WSCDC estable

Esta version del frontend WSCDC consulta la API propia del proyecto y nunca expone credenciales de WSAA ni detalles sensibles de infraestructura.

## Levantar API

```powershell
cd C:\ARCA-PROYECTOS\wscdc-constatacion\api
npm run dev:prod
```

## Levantar frontend

```powershell
cd C:\ARCA-PROYECTOS\wscdc-constatacion\frontend
py -m http.server 5500 --bind 127.0.0.1
```

## URLs locales

- `http://127.0.0.1:5500/index.html`
- `http://127.0.0.1:5500/constatar.html`
- `http://127.0.0.1:5500/resultado.html`
- `http://127.0.0.1:5500/estado-api.html`

La API esperada por el frontend es:

- `http://localhost:3002/api`

## Uso del formulario

La pantalla `constatar.html` se organiza en dos bloques:

- Datos del comprobante
- Documento del receptor

Campos requeridos para un comprobante `CAE`, `CAI` o `CAEA`:

- `cbteModo`
- `cuitEmisor`
- `codAutorizacion`
- `cbteFch`
- `cbteTipo`
- `ptoVta`
- `cbteNro`
- `impTotal`

Campos del receptor:

- `docTipoReceptor`
- `docNroReceptor`

Si se informa documento del receptor, deben informarse ambos campos.

El formulario incluye:

- Prefill desde query string
- Boton `Cargar ejemplo validado`
- Validaciones por campo antes de enviar
- Bloqueo del boton durante la consulta
- Redireccion a `resultado.html` cuando la respuesta es exitosa

## Resultado de la consulta

Significados principales:

- `resultado=A`: el comprobante coincide con una autorizacion otorgada por ARCA
- `resultado=R`: el comprobante no pudo ser constatado como autorizado
- `observaciones`: mensajes funcionales devueltos por ARCA
- `errors`: errores de formato o datos invalidos
- `events`: mensajes informativos del servicio

La pantalla `resultado.html` muestra:

- CUIT emisor
- Codigo de autorizacion
- Fecha de emision
- Tipo de comprobante
- Punto de venta y numero de comprobante
- Importe total
- Documento receptor
- Fecha de proceso si viene en la respuesta

## Selects locales

`cbteTipo` y `docTipoReceptor` usan `select` locales cargados desde:

- `frontend/assets/js/catalogos.js`

Estos catalogos estan basados funcionalmente en el formulario publico de ARCA para constatacion de comprobantes, pero se renderizan localmente y no dependen de endpoints dinamicos para esta version.

## Seguridad

El frontend no expone:

- `Token`
- `Sign`
- certificados
- claves privadas
- rutas de certificados
- rutas de `.env`
- contenido de `tmp/`
- contenido de TA cache

La autenticacion WSAA, la firma CMS, el cache TA y el acceso SOAP quedan encapsulados del lado de la API.

## Advertencia operativa

Este sistema consulta **ARCA PRODUCCION real**.

- No hacer pruebas masivas
- No ejecutar loops
- Usar solo comprobantes reales y consultas manuales controladas
