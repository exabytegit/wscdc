# Troubleshooting

## Criterio general

No registrar ni pegar en tickets `Token`, `Sign`, clave privada, certificado completo, PFX, `.env` ni TA persistidos. Para diagnostico, usar `requestId`, `scenario`, codigo HTTP y mensajes SOAP sanitizados.

## OpenSSL no esta disponible

Sintoma: `scenario=OPENSSL_NOT_FOUND`.

Accion: instalar OpenSSL y confirmar:

```powershell
openssl version
```

## Certificado no autorizado

Sintoma frecuente: error WSAA de computador no autorizado o codigo WSAPOC `201`.

Acciones:

- Verificar que el certificado sea del mismo ambiente que el endpoint.
- Verificar que el certificado este asociado al servicio `wsapoc`.
- Verificar `ARCA_CUIT_DELEGADO`.
- En produccion, verificar en Administrador de Relaciones que el WSN `wsapoc` este delegado/asociado al computador fiscal correcto.

## Certificado no asociado al WSN

Sintomas posibles: WSAA emite error de autorizacion, WSAPOC devuelve codigo `201`, o el servicio responde que las credenciales no son validas.

Acciones:

- Confirmar que el certificado productivo fue descargado desde Administracion de Certificados Digitales.
- Confirmar que el WSN `wsapoc` fue asociado/delegado desde Administrador de Relaciones.
- En tercerizacion, confirmar que el tercero acepto la designacion y asigno su computador fiscal.

## WSAA responde alreadyAuthenticated

Sintoma: faultstring `El CEE ya posee un TA valido para el acceso al WSN solicitado`.

Acciones:

- Mantener la API levantada para que reutilice el TA en memoria.
- Verificar que exista el cache local persistido en `tmp/ta-homologacion-wsapoc.json`.
- Si el TA fue emitido por una version anterior que no lo persistia, esperar su vencimiento o regenerar el flujo con una nueva emision controlada.

## Service incorrecto

Sintoma: WSAA emite TA para otro WebService o WSAPOC rechaza credenciales.

Acciones:

- Verificar `ARCA_SERVICE=wsapoc`.
- Verificar que el `LoginTicketRequest` incluya `<service>wsapoc</service>`.
- Recordar que un TA es especifico del WebService de Negocio solicitado.

## CUITDelegado incorrecto

Sintoma: codigo WSAPOC `201`, credenciales invalidas o respuestas vacias inesperadas en un ambiente donde el dato deberia existir.

Acciones:

- Verificar `ARCA_CUIT_DELEGADO`.
- Confirmar que ese CUIT coincide con la relacion autorizada.
- En tercerizacion, confirmar que se usa el CUIT representado/delegado que corresponde a la relacion.

## Hostname WSAA

Si falla `wsaahomo.afip.gov.ar`, probar en `.env`:

```env
WSAA_URL=https://wsaahomo.arca.gov.ar/ws/services/LoginCms
```

## Namespace WSAPOC

La API deja `WSAPOC_NAMESPACE` configurable. Si homologacion devuelve SOAP Fault por accion o namespace, revisar el WSDL real y ajustar solo `.env`.

## SOAPAction incorrecto

Sintoma: HTTP 400, SOAP Fault o error de accion no reconocida.

Acciones:

- Confirmar `SOAPAction` con formato `http://tempuri.org/Service/...`.
- Confirmar casing de operaciones: `Dummy`, `GetPublicacionAPOC`, `GetAllByPublicacion`.
- Confirmar parametros: `<cuit>`, `<desde>` y `<hasta>`.

## authserver=NO en Dummy

Sintoma: `GET /api/health` responde `appserver=OK`, `dbserver=OK`, `authserver=NO`.

Acciones:

- Tratarlo como estado degradado, no necesariamente como caida total.
- Probar una consulta real por CUIT para confirmar si el negocio sigue respondiendo.
- Vigilar renovacion de TA, porque el componente de autenticacion puede causar errores intermitentes.

## Checklist de smoke homologacion

- `npm test` pasa.
- `openssl version` responde.
- `GET /api/health` responde.
- `GET /api/consulta/cuit/:cuit` llega a WSAPOC.
- `GET /api/consulta/rango?...` llega a WSAPOC.
- El frontend usa `USE_MOCK=false` y consume `/api`.

## Checklist de smoke produccion

- `.env` productivo configurado fuera del repo.
- Certificado productivo asociado al WSN `wsapoc`.
- `ARCA_SERVICE=wsapoc`.
- `CUITDelegado` definido.
- WSAA produccion emite TA.
- `Dummy` WSAPOC produccion responde.
- Consulta por CUIT responde.
- Consulta por rango responde.
- Logs sin `Token`, `Sign` ni datos sensibles.

Comandos sugeridos:

```powershell
npm run dev:prod
Invoke-RestMethod http://localhost:3001/api/health
Invoke-RestMethod http://localhost:3001/api/consulta/cuit/20307764327
Invoke-RestMethod "http://localhost:3001/api/consulta/rango?desde=01/01/2025&hasta=31/01/2025"
```

Si `authserver=NO` en `Dummy`, registrar el servicio como degradado y continuar con una consulta real controlada antes de declararlo caido.
