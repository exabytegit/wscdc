# Camino a Produccion WSAPOC / WSAA

Esta guia consolida el camino tecnico para operar la API interna de consulta APOC en homologacion y produccion. Las fuentes principales son oficiales de ARCA/AFIP; AFIP SDK queda solo como referencia practica secundaria.

## Fuentes

Fuentes oficiales ARCA/AFIP:

- Delegacion/asociacion de WebServices con Administrador de Relaciones: https://www.arca.gob.ar/ws/WSAA/ADMINREL.DelegarWS.pdf
- Obtencion de certificado digital de produccion: https://www.arca.gob.ar/ws/WSAA/WSAA.ObtenerCertificado.pdf
- Documento relacionado de certificado productivo: https://www.arca.gob.ar/ws/WSAA/wsaa_obtener_certificado_produccion.pdf
- Asociacion de certificado digital a un WSN productivo: https://www.arca.gob.ar/ws/WSAA/wsaa_asociar_certificado_a_wsn_produccion.pdf
- Manual del desarrollador WSAA: https://www.arca.gob.ar/ws/WSAA/WSAAmanualDev.pdf
- Manual WSAPOC 1.0.9: https://www.afip.gob.ar/ws/wsapoc/ManualUsuario-1.0.9.pdf

Fuente complementaria no oficial:

- AFIP SDK: https://docs.afipsdk.com/
- AFIP SDK, ir a produccion: https://docs.afipsdk.com/siguientes-pasos/ir-a-produccion
- AFIP SDK, automatizacion `create-cert-prod` para Node.js: https://afipsdk.com/docs/automations/create-cert-prod/nodejs/

Prioridad documental: si una guia del SDK contradice a ARCA/AFIP, prevalece ARCA/AFIP.

## Conceptos

- `WSAA`: servicio de autenticacion/autorizacion. Recibe un CMS firmado, emite un TA y devuelve `Token` + `Sign`.
- `WSAPOC`: WebService de negocio para consultar contribuyentes apocrifos. Usa `Credencial` con `Token`, `Sign` y `CUITDelegado`.
- `Administrador de Certificados Digitales`: servicio usado para emitir certificados productivos.
- `Administrador de Relaciones`: servicio usado para delegar/asociar WebServices de negocio y computadores fiscales.
- `WSASS`: herramienta de homologacion/testing para certificados y autorizaciones.
- `service="wsapoc"`: valor que debe viajar en el `LoginTicketRequest` de WSAA para obtener un TA valido para WSAPOC.

## Ambientes

### Homologacion / Testing

Flujo operativo:

1. Generar una clave privada local protegida.
2. Generar un CSR.
3. Subir el CSR en WSASS.
4. Obtener el certificado de homologacion.
5. Autorizar el servicio `wsapoc` en homologacion.
6. Configurar la API con endpoints de homologacion.
7. Solicitar TA al WSAA de homologacion usando `service="wsapoc"`.
8. Usar `Token` + `Sign` contra WSAPOC homologacion.
9. Ejecutar smoke tests: `Dummy`, consulta por CUIT y consulta por rango.

Notas:

- Homologacion valida conectividad, contrato SOAP y manejo de errores.
- La base QA puede no coincidir con bases descargadas o productivas.
- `authserver=NO` en `Dummy` puede indicar degradacion sin bloquear todas las consultas.

### Produccion

Flujo operativo:

1. Generar clave privada fuera del frontend y protegerla.
2. Generar CSR con OpenSSL.
3. Ingresar a ARCA con clave fiscal.
4. Usar `Administracion de Certificados Digitales`.
5. Crear un alias.
6. Subir el CSR.
7. Descargar el certificado productivo.
8. Asociar/delegar el WebService de Negocio desde `Administrador de Relaciones`.
9. Para este proyecto, asociar/delegar el servicio `wsapoc`.
10. Configurar endpoints productivos de WSAA y WSAPOC.
11. Solicitar TA al WSAA de produccion usando `service="wsapoc"`.
12. Usar `Token` + `Sign` contra WSAPOC produccion.
13. Ejecutar smoke tests productivos controlados.

## Escenarios productivos

### A. Desarrollo propio

La misma empresa opera su backend/API. El Administrador de Relaciones autoriza el WebService `wsapoc` para un computador fiscal propio. La API usa el certificado propio y el `CUITDelegado` que corresponda a la entidad representada.

### B. Tercerizacion

Un contribuyente delega el WebService a un tercero. El tercero acepta la designacion desde el Administrador de Relaciones y luego asigna su computador fiscal/certificado para operar ese servicio. La API opera con el certificado correspondiente y con el `CUITDelegado` definido para la relacion autorizada.

## Configuracion sugerida

La API actual usa `WSAA_URL` y `WSAPOC_URL` como endpoints efectivos. Para preparar produccion sin secretos reales, mantener `.env.example` con placeholders y decidir en despliegue que valores se vuelcan a las variables efectivas.

```env
ARCA_ENV=homologacion|produccion
ARCA_SERVICE=wsapoc
ARCA_CUIT_DELEGADO=
ARCA_WSAA_HOMO_URL=
ARCA_WSAA_PROD_URL=
ARCA_WSAPOC_HOMO_URL=
ARCA_WSAPOC_PROD_URL=
ARCA_CERT_PATH=
ARCA_KEY_PATH=
OPENSSL_BIN=
TA_CACHE_DIR=
```

Variables efectivas actuales:

```env
WSAA_URL=
WSAPOC_URL=
WSAPOC_NAMESPACE=http://tempuri.org/
```

## Checklist productiva

- [ ] Clave privada generada y protegida.
- [ ] CSR generado.
- [ ] Certificado productivo descargado.
- [ ] Certificado asociado al WSN.
- [ ] Servicio `wsapoc` delegado/asociado.
- [ ] Endpoint WSAA produccion configurado.
- [ ] Endpoint WSAPOC produccion configurado.
- [ ] `service="wsapoc"` validado.
- [ ] `CUITDelegado` definido.
- [ ] `.env` productivo configurado sin subirse al repo.
- [ ] Smoke test WSAA produccion.
- [ ] Smoke test `Dummy` WSAPOC produccion.
- [ ] Smoke test consulta por CUIT.
- [ ] Smoke test consulta por rango.
- [ ] Logs sin `Token`, `Sign` ni datos sensibles.

## Seguridad

- Nunca guardar certificados ni claves privadas en el frontend.
- Nunca consumir WSAA/WSAPOC directo desde HTML/JS del navegador.
- El frontend debe consumir solo nuestra API REST/JSON.
- La API es responsable de WSAA, certificados, `Token`, `Sign` y SOAP.
- Excluir `certs/`, `tmp/`, `.env`, TA y archivos sensibles del control de versiones.
- No exponer `Token`, `Sign`, clave privada, certificado ni CUIT sensible en logs ni respuestas JSON.

## Estado del codigo actual

Verificado en el repo:

- `api/src/services/wsaa.js` genera el `LoginTicketRequest` usando `config.ARCA_SERVICE`; para este proyecto debe ser `wsapoc`.
- `api/src/services/wsapoc.js` usa el contrato real del WSDL:
- `Dummy`
- `GetPublicacionAPOC` con `<cuit>`
- `GetAllByPublicacion` con `<desde>` y `<hasta>`
- `SOAPAction` con formato `http://tempuri.org/Service/...`
- Los tests cubren `service=wsapoc`, `alreadyAuthenticated`, `Dummy`, `SOAPAction` y `<cuit>`.

No se requieren cambios de codigo para esta alineacion documental.

## AFIP SDK como apoyo

AFIP SDK puede servir como guia practica para entender pasos generales de alta, certificados, homologacion y produccion. Para este proyecto, la integracion es propia contra WSAA/WSAPOC: el SDK no reemplaza los manuales oficiales, el WSDL ni los procedimientos de ARCA.

Como checklist secundario, AFIP SDK recuerda que al pasar a produccion se deben usar certificado y clave productivos, y cambiar la configuracion del entorno a produccion. En esta API eso se traduce en `ARCA_ENV=produccion`, endpoints productivos, certificado productivo y asociacion/delegacion productiva del servicio `wsapoc`.

### Automatizacion `create-cert-prod`

AFIP SDK documenta una automatizacion llamada `create-cert-prod` para crear un certificado de produccion con Node.js. Segun esa documentacion, la automatizacion recibe:

- `cuit`: CUIT a usar en la pagina de ARCA.
- `username`: CUIT usado para iniciar sesion en ARCA.
- `password`: contrasena para iniciar sesion en ARCA.
- `alias`: nombre alfanumerico para el certificado.

La respuesta documentada incluye:

- `cert`: certificado emitido.
- `key`: clave privada asociada.

Advertencias para este proyecto:

- Esta fuente no es oficial de ARCA/AFIP.
- La propia pagina indica que `afipsdk.com` es un sitio comercial sin relacion con sitios u organismos oficiales.
- Las fuentes oficiales ARCA/AFIP prevalecen sobre esta automatizacion.
- No se recomienda usar `create-cert-prod` en produccion sin un analisis formal de seguridad, cumplimiento y responsabilidades, porque implica entregar credenciales de clave fiscal/login ARCA a un tercero o a una integracion externa.
- El camino principal del proyecto sigue siendo el oficial: OpenSSL, CSR, Administracion de Certificados Digitales, descarga de certificado y asociacion/delegacion del WSN `wsapoc` en Administrador de Relaciones.
- Si alguna vez se evalua esta automatizacion, no registrar `username`, `password`, `cert`, `key`, access tokens ni respuestas completas en logs o tickets.

## Nombres de archivos

El archivo `frontend/WSAA.pdf` contiene el manual WSAPOC 1.0.9, no un manual WSAA. Recomendacion futura: renombrarlo a `WSAPOC-Manual-1.0.9.pdf` y actualizar las referencias internas. No se renombra automaticamente para evitar romper referencias locales existentes.
