# Troubleshooting WSCDC

## TLS en WSCDC produccion

Sintoma:

```text
Hostname/IP does not match certificate's altnames.
Host: servicios1.arca.gob.ar is not in cert's altnames.
Cert altnames: servicios1.afip.gob.ar, www.servicios1.afip.gob.ar.
```

Diagnostico:

La documentacion de ARCA puede mencionar `servicios1.arca.gob.ar`, pero el certificado TLS actual del servicio WSCDC produccion responde para:

```text
servicios1.afip.gob.ar
www.servicios1.afip.gob.ar
```

Configuracion correcta para WSCDC produccion:

```env
ARCA_WSCDC_PROD_URL=https://servicios1.afip.gob.ar/WSCDC/service.asmx
```

WSDL productivo:

```text
https://servicios1.afip.gob.ar/WSCDC/service.asmx?WSDL
```

Mantener `SOAPAction` y namespace:

```text
http://servicios1.afip.gob.ar/wscdc/
```

No desactivar TLS. No usar `NODE_TLS_REJECT_UNAUTHORIZED=0`.
