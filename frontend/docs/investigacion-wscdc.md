# Investigacion WSCDC

Fuente principal: manual oficial WSCDC ARCA/AFIP y WSDL oficial vigente.

Manual incorporado al proyecto:

- `C:\APPVAR\Constata_Comprobantes\WSCDC-manual-desarrollador-v4.pdf`
- Revision correspondiente al `1 de diciembre de 2025`
- Historial relevante detectado en el manual:
  - `20-08-2025`: nuevos topes de facturacion para identificar al receptor.
  - `01-12-2025`: adecuaciones por reemplazo de comprobantes clase M y cambios en errores `113` y `114`.

Endpoints de referencia:

- Homologacion runtime: `https://wswhomo.afip.gob.ar/WSCDC/service.asmx`
- Homologacion WSDL: `https://wswhomo.afip.gob.ar/WSCDC/service.asmx?WSDL`
- Produccion runtime: `https://servicios1.afip.gov.ar/WSCDC/service.asmx`
- Produccion WSDL: `https://servicios1.afip.gov.ar/WSCDC/service.asmx?WSDL`

Operaciones previstas:

- `ComprobanteDummy`
- `ComprobantesModalidadConsultar`
- `ComprobantesTipoConsultar`
- `DocumentosTipoConsultar`
- `OpcionalesTipoConsultar`
- `ComprobanteConstatar`

Hallazgos concretos aplicables a la API:

- `ComprobanteConstatar` usa `Auth { Token, Sign, Cuit }` y `CmpReq`.
- `ComprobanteDummy` no recibe `Auth`; es un ping de infraestructura.
- `Resultado=A` significa autorizado; `Resultado=R` significa rechazado.
- Rechazos de formato vuelven en `Errors`.
- Rechazos funcionales vuelven en `Observaciones`.
- Los catalogos devuelven `ResultGet`, `Errors` y `Events`.
- El manual define validaciones excluyentes de formato `1..10`, funcionales `100..153` y no excluyentes `200`.
- `DocTipoReceptor` debe ser numerico de 2 digitos.
- `DocNroReceptor` debe ser numerico y el apartado de validacion de formato lo trata como hasta 11 digitos.

Reglas funcionales especialmente importantes para la siguiente etapa:

- Error `110`: `ImpTotal` admite margen relativo `<= 0.01%` o error absoluto `<= 1`.
- Errores `113` y `114`: comprobantes tipo A y A con leyenda requieren datos del receptor; el manual 2025 indica cambios recientes aqui.
- Errores `115` y `116`: para varios tipos B/C/R y afines, el documento del receptor pasa a ser obligatorio por importe alto.
- Error `117`: si se informa uno de los datos de receptor, deben informarse ambos.
- Error `118`: comprobantes tipo T solo aceptan documentos `80`, `91`, `94`, `96`.

Pendientes que el manual deja listos para una implementacion real de `constatar`:

- Mapeo detallado de `Errors`, `Observaciones` y `Events` por codigo.
- Reglas condicionales por `CbteTipo`, `CbteModo` e importe.
- Carga de casos reales de homologacion antes de habilitar el POST productivamente.

Prioridad documental:

- Manual oficial WSCDC.
- WSDL oficial.
- Documentacion oficial WSAA.
- SDKs o ejemplos externos solo como referencia complementaria.

Decision actual: dummy, catalogos y `ComprobanteConstatar` quedan implementados contra homologacion real; falta cargar un caso oficial para smoke funcional sin inventar datos.
