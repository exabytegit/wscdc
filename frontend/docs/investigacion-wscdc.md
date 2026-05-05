# Investigacion WSCDC

Fuente principal: manual oficial WSCDC ARCA/AFIP y WSDL oficial vigente.

Endpoints de referencia:

- Homologacion runtime: `https://wswhomo.afip.gob.ar/WSCDC/service.asmx`
- Homologacion WSDL: `https://wswhomo.afip.gob.ar/WSCDC/service.asmx?WSDL`
- Produccion runtime: `https://servicios1.arca.gob.ar/WSCDC/service.asmx`
- Produccion WSDL: `https://servicios1.arca.gob.ar/WSCDC/service.asmx?WSDL`

Operaciones previstas:

- `ComprobanteDummy`
- `ComprobantesModalidadConsultar`
- `ComprobantesTipoConsultar`
- `DocumentosTipoConsultar`
- `OpcionalesTipoConsultar`
- `ComprobanteConstatar`

Prioridad documental:

- Manual oficial WSCDC.
- WSDL oficial.
- Documentacion oficial WSAA.
- SDKs o ejemplos externos solo como referencia complementaria.

Decision v1: dummy y catalogos quedan preparados para homologacion real; `ComprobanteConstatar` queda stub validado hasta tener casos oficiales.
