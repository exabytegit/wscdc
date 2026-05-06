# Troubleshooting WSCDC

## TLS en WSCDC produccion

Sintoma:

```text
Hostname/IP does not match certificate's altnames.
Host: servicios1.afip.gob.ar is not in cert's altnames.
Cert altnames: servicios1.afip.gov.ar, www.servicios1.afip.gov.ar.
```

Diagnostico:

La documentacion de ARCA puede mencionar `servicios1.arca.gob.ar` o `servicios1.afip.gob.ar`, pero el certificado TLS actual del servicio WSCDC produccion responde para:

```text
servicios1.afip.gov.ar
www.servicios1.afip.gov.ar
```

Configuracion correcta para WSCDC produccion:

```env
ARCA_WSCDC_PROD_URL=https://servicios1.afip.gov.ar/WSCDC/service.asmx
```

WSDL productivo:

```text
https://servicios1.afip.gov.ar/WSCDC/service.asmx?WSDL
```

Mantener `SOAPAction` y namespace:

```text
http://servicios1.afip.gob.ar/wscdc/
```

No desactivar TLS. No usar `NODE_TLS_REJECT_UNAUTHORIZED=0`.

## `dh key too small` en WSCDC produccion

Sintoma:

```text
write EPROTO ... tls_process_ske_dhe:dh key too small
```

Diagnostico:

El endpoint productivo WSCDC puede negociar parametros Diffie-Hellman considerados legacy por la politica TLS/OpenSSL usada por Node.js. En ese caso la validacion TLS sigue activa, pero el handshake se corta por nivel de seguridad antes de llegar a SOAP.

Node.js documenta que la lista de cifrados puede ajustarse con `--tls-cipher-list` o mediante `NODE_OPTIONS`, y que `minDHSize` valida el tamano minimo aceptado para parametros DH en conexiones TLS. Referencia oficial: `https://nodejs.org/api/tls.html`.

Comando controlado para levantar WSCDC produccion:

```powershell
npm run dev:prod:legacy-tls
```

El script aplica:

```text
NODE_OPTIONS=--tls-cipher-list=DEFAULT@SECLEVEL=1
```

Esta excepcion es solo para compatibilidad TLS del endpoint WSCDC produccion. No usar `NODE_TLS_REJECT_UNAUTHORIZED=0`, no bajar a `SECLEVEL=0` y no desactivar la validacion de certificados.
