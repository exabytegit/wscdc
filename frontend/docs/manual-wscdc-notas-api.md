# Manual WSCDC 2025: notas para la API

Resumen operativo extraido del manual oficial `WSCDC-manual-desarrollador-v4.pdf` de ARCA/AFIP, revision `1 de diciembre de 2025`.

## Contratos

- `ComprobanteConstatar` recibe:
  - `Auth` con `Token`, `Sign`, `Cuit`
  - `CmpReq` con `CbteModo`, `CuitEmisor`, `PtoVta`, `CbteTipo`, `CbteNro`, `CbteFch`, `ImpTotal`, `CodAutorizacion`, receptor y opcionales
- `ComprobanteDummy` no recibe parametros.
- Catalogos `ComprobantesModalidadConsultar`, `ComprobantesTipoConsultar`, `DocumentosTipoConsultar` y `OpcionalesTipoConsultar` reciben `Auth`.

## Estructuras de respuesta

- Errores:
  - `Errors > Err > Code, Msg`
- Eventos:
  - `Events > Evt > Code, Msg`
- Observaciones de constatacion:
  - `Observaciones > Obs > Code, Msg`
- Respuesta de `ComprobanteConstatar`:
  - `CmpResp`
  - `Resultado`
  - `Observaciones`
  - `FchProceso`
  - `Events`
  - `Errors`

## Semantica funcional

- `Resultado=A`: autorizado.
- `Resultado=R`: rechazado.
- Validaciones excluyentes de formato:
  - devuelven `Resultado=R` y `Errors`
- Validaciones excluyentes funcionales:
  - devuelven `Resultado=R` y `Observaciones`
- Validaciones no excluyentes:
  - aprueban con `Resultado=A` y `Observaciones`

## Reglas que conviene implementar en la siguiente etapa

- `1..10`: formato basico de `CmpReq`
- `100..153`: validaciones funcionales
- `200`: CAEA vigente pero no rendida, comprobante observado
- `110`: tolerancia de importe con error relativo `<= 0.01%` o absoluto `<= 1`
- `113..118`: reglas de documento receptor por tipo de comprobante e importe

## Impacto en esta base

- Confirmado: el namespace/forma SOAP que usamos para `Dummy` y catalogos es consistente con el manual.
- Implementado: `ComprobanteConstatar` usa `Auth` y `CmpReq`, validando localmente antes de invocar ARCA.
- Ajustado: validacion local de `DocTipoReceptor` a 2 digitos y `DocNroReceptor` a valor numerico corto segun el apartado de validacion del manual.
- Pendiente: cargar un caso oficial de homologacion para smoke real sin inventar datos.
