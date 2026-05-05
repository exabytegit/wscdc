# Flujo WSAA y WSAPOC

Para el camino completo de homologacion a produccion, ver `camino-produccion-wsapoc-wsaa.md`.

## Diferencia conceptual

- `WSAA`: autentica y autoriza. Emite el TA con `Token` + `Sign`.
- `WSAPOC`: WebService de negocio. Consulta contribuyentes apocrifos usando la `Credencial`.
- `Administrador de Certificados Digitales`: emite certificados productivos.
- `Administrador de Relaciones`: delega/asocia WebServices de negocio y computadores fiscales.
- `WSASS`: gestiona certificados y autorizaciones de homologacion/testing.

## WSAA

1. La API genera un `LoginTicketRequest` con `service=wsapoc`.
2. Firma el XML con OpenSSL usando `certificado.pem` y `privada.key`.
3. Envia el CMS Base64 a `loginCms`.
4. Parsea `loginCmsReturn` y extrae `token`, `sign` y `expirationTime`.
5. Cachea el TA en memoria y lo renueva antes del vencimiento.

Comando conceptual usado por la API:

```powershell
openssl cms -sign -in LoginTicketRequest.xml -signer certificado.pem -inkey privada.key -outform DER -nodetach -out LoginTicketRequest.cms
```

La API no registra `token`, `sign` ni contenido de certificados.

## WSAPOC

La API arma envelopes SOAP manuales para:

- `Dummy`
- `GetPublicacionAPOC`
- `GetAllByPublicacion`

El contrato real del WSDL usado por la API es:

- `Dummy`
- `GetPublicacionAPOC` con `<cuit>`
- `GetAllByPublicacion` con `<desde>` y `<hasta>`
- `SOAPAction` con formato `http://tempuri.org/Service/...`

En las operaciones de negocio inyecta:

```xml
<Credencial>
  <Token>...</Token>
  <Sign>...</Sign>
  <CUITDelegado>...</CUITDelegado>
</Credencial>
```

Luego normaliza la respuesta XML a los DTOs JSON consumidos por el frontend.
