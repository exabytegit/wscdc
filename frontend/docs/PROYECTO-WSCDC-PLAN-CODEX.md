# Proyecto WSCDC — Plan técnico para desarrollo Front HTML/CSS/JS + API intermedia

**Versión del documento:** 0.1.0  
**Objetivo:** servir como documento base del repositorio para que Codex entienda el alcance, arquitectura, fuentes, decisiones técnicas, roadmap y riesgos del nuevo proyecto de consulta de **Constatación de Comprobantes WSCDC**.

---

## 1. Propósito del proyecto

Este proyecto busca construir una aplicación web liviana, mantenible y extensible para consultar el **Web Service de Constatación de Comprobantes (WSCDC)** de ARCA/AFIP.

La solución debe tener:

- **Frontend HTML5/CSS3/JavaScript sin framework**.
- **HTML5 semántico**.
- **CSS3 modular**, responsive y con estados visuales definidos.
- **JavaScript moderno con ES Modules**, `fetch`, validadores, servicios y renderizadores propios.
- **Sin framework UI**, salvo decisión posterior fundada.
- **API intermedia propia o existente** que encapsule WSAA + SOAP/XML + certificados + Token + Sign.
- Preparación arquitectónica para una futura convivencia con el proyecto ya desarrollado de **WSAPOC**.

El navegador **no debe hablar directamente con ARCA/AFIP**, ni con WSAA ni con SOAP. El frontend debe consumir solamente endpoints JSON propios.

---

## 2. Fuentes documentales del proyecto

### 2.1 Fuentes principales

1. `WSCDC-manual-desarrollador-v4.pdf`  
   Manual oficial de ARCA/AFIP para WSCDC, revisión correspondiente al **1 de diciembre de 2025**.

2. WSDL oficial WSCDC homologación:

```text
https://wswhomo.afip.gob.ar/WSCDC/service.asmx?WSDL
```

3. WSDL oficial WSCDC producción:

```text
https://servicios1.arca.gob.ar/WSCDC/service.asmx?WSDL
```

4. Documentación WSAA oficial ya utilizada en el proyecto WSAPOC:
   - WSAA Manual del Desarrollador.
   - Especificación Técnica WSAA.
   - Documentación de certificados homologación/producción.
   - Administrador de Relaciones / delegación de WebServices.

### 2.2 Fuentes auxiliares

1. `ConstatacionComprobantesejemplo.pdf`  
   Usar **solo como ejemplo práctico**, principalmente por su relación con PyAfipWs y ejemplos históricos.

2. AFIP SDK — Constatación de Comprobantes:

```text
https://docs.afipsdk.com/siguientes-pasos/web-services/constatacion-de-comprobantes
```

3. AFIP SDK — pasos para producción:

```text
https://docs.afipsdk.com/siguientes-pasos/ir-a-produccion
```

4. jsDelivr / npm `afip-apis`:

```text
https://www.jsdelivr.com/package/npm/afip-apis
```

5. Gist de ejemplo:

```text
https://gist.github.com/Reflej0/e30bfd999bcde47e880327bd5c4d824d
```

### 2.3 Criterio de prioridad

Cuando exista contradicción entre fuentes:

1. Gana el **manual oficial WSCDC vigente**.
2. Luego el **WSDL oficial**.
3. Luego documentación oficial WSAA / ARCA.
4. Luego SDKs o ejemplos de terceros.
5. Finalmente ejemplos comunitarios o históricos.

AFIP SDK y `afip-apis` pueden ayudar a entender flujos y ejemplos, pero **no reemplazan el contrato oficial de ARCA**.

---

## 3. Alcance técnico de WSCDC

WSCDC permite constatar comprobantes emitidos con:

- **CAI**.
- **CAE**.
- **CAEA**.

El servicio está pensado para verificar si un comprobante se encuentra registrado/autorizado y si los datos informados coinciden con las bases de ARCA.

No se debe prometer soporte para flujos “sin CAI” hasta confirmar si pertenecen realmente al contrato WSCDC o a otro circuito distinto.

---

## 4. Operaciones oficiales de WSCDC

El manual oficial enumera las siguientes operaciones:

```text
ComprobanteConstatar
ComprobantesModalidadConsultar
ComprobantesTipoConsultar
DocumentosTipoConsultar
OpcionalesTipoConsultar
ComprobanteDummy
```

### 4.1 ComprobanteConstatar

Operación principal. Permite constatar un comprobante enviando datos mínimos del comprobante:

- Modalidad de autorización.
- CUIT del emisor.
- Punto de venta.
- Tipo de comprobante.
- Número de comprobante.
- Fecha del comprobante.
- Importe total.
- Código de autorización.
- Datos del receptor, si corresponden.
- Opcionales, si corresponden.

### 4.2 ComprobantesModalidadConsultar

Devuelve modalidades válidas:

```text
CAE
CAEA
CAI
```

### 4.3 ComprobantesTipoConsultar

Devuelve tipos de comprobantes válidos.

### 4.4 DocumentosTipoConsultar

Devuelve tipos de documento válidos.

### 4.5 OpcionalesTipoConsultar

Devuelve tipos de datos opcionales.

### 4.6 ComprobanteDummy

Verifica estado de infraestructura del servicio.

Debe usarse para health check técnico, no para validar credenciales funcionales de consulta.

---

## 5. Endpoints oficiales WSCDC

### 5.1 Homologación

Runtime:

```text
https://wswhomo.afip.gob.ar/WSCDC/service.asmx
```

WSDL:

```text
https://wswhomo.afip.gob.ar/WSCDC/service.asmx?WSDL
```

### 5.2 Producción

Runtime:

```text
https://servicios1.arca.gob.ar/WSCDC/service.asmx
```

WSDL:

```text
https://servicios1.arca.gob.ar/WSCDC/service.asmx?WSDL
```

---

## 6. Autenticación WSAA

WSCDC requiere autenticación vía WSAA.

Flujo:

```text
Certificado + private key
        ↓
TRA XML con service="wscdc"
        ↓
CMS firmado con OpenSSL
        ↓
WSAA LoginCms
        ↓
TA = Token + Sign
        ↓
WSCDC Auth { Token, Sign, Cuit }
```

El frontend nunca debe conocer:

- Certificados.
- Private keys.
- Token.
- Sign.
- TRA.
- CMS.
- SOAP XML.

Todo eso corresponde a la API intermedia.

---

## 7. Identificador de servicio WSAA

Para solicitar TA al WSAA se debe usar el identificador del servicio correspondiente a WSCDC.

Valor esperado:

```text
wscdc
```

Este valor debe quedar centralizado en configuración:

```env
ARCA_SERVICE=wscdc
```

No hardcodear el service en múltiples archivos.

---

## 8. Arquitectura recomendada

### 8.1 Flujo general

```text
[ Frontend HTML/CSS/JS ]
          ↓ fetch JSON
[ API Intermedia Propia ]
          ↓ WSAA / TA
[ WSAA ARCA ]
          ↓ Token + Sign
[ API Intermedia Propia ]
          ↓ SOAP/XML
[ WSCDC ARCA ]
          ↓ SOAP/XML
[ API Intermedia Propia ]
          ↓ JSON normalizado
[ Frontend HTML/CSS/JS ]
```

### 8.2 Principio rector

El frontend trabaja en JSON y UI.

La API trabaja con:

- Certificados.
- WSAA.
- TA cache.
- SOAP XML.
- Parseo XML.
- Normalización de respuestas.
- Manejo de errores técnicos.
- Mapeo de errores funcionales.

---

## 9. Estructura sugerida del repositorio

```text
wscdc-project/
├─ frontend/
│  ├─ index.html
│  ├─ constatar.html
│  ├─ estado.html
│  ├─ resultado.html
│  ├─ assets/
│  │  ├─ css/
│  │  │  ├─ base.css
│  │  │  ├─ layout.css
│  │  │  ├─ forms.css
│  │  │  ├─ states.css
│  │  │  ├─ components/
│  │  │  │  ├─ buttons.css
│  │  │  │  ├─ cards.css
│  │  │  │  ├─ badges.css
│  │  │  │  └─ alerts.css
│  │  │  └─ pages/
│  │  │     ├─ constatar.css
│  │  │     └─ estado.css
│  │  └─ js/
│  │     ├─ config.js
│  │     ├─ api.js
│  │     ├─ validators.js
│  │     ├─ renderers.js
│  │     ├─ formatters.js
│  │     ├─ state.js
│  │     └─ pages/
│  │        ├─ constatar.js
│  │        ├─ resultado.js
│  │        └─ estado.js
│  └─ README.md
│
├─ api/
│  ├─ src/
│  │  ├─ server.js
│  │  ├─ config.js
│  │  ├─ core/
│  │  │  ├─ wsaa.js
│  │  │  ├─ soap-client.js
│  │  │  ├─ ta-cache.js
│  │  │  ├─ errors.js
│  │  │  └─ logger.js
│  │  ├─ services/
│  │  │  └─ wscdc/
│  │  │     ├─ wscdc.soap.js
│  │  │     ├─ wscdc.mapper.js
│  │  │     ├─ wscdc.validators.js
│  │  │     ├─ wscdc.catalogs.js
│  │  │     └─ wscdc.constants.js
│  │  ├─ routes/
│  │  │  ├─ health.routes.js
│  │  │  └─ wscdc.routes.js
│  │  └─ tests/
│  │     ├─ wscdc.test.js
│  │     └─ wsaa.test.js
│  ├─ certs/
│  │  ├─ homologacion/
│  │  └─ produccion/
│  ├─ tmp/
│  ├─ .env.example
│  ├─ package.json
│  └─ README.md
│
├─ docs/
│  ├─ investigacion-wscdc.md
│  ├─ contrato-wscdc.md
│  ├─ roadmap.md
│  ├─ seguridad.md
│  ├─ checklist-homologacion.md
│  └─ checklist-produccion.md
│
├─ .gitignore
└─ README.md
```

---

## 10. Estructura recomendada del frontend

### 10.1 HTML semántico

Usar:

- `header`.
- `nav`.
- `main`.
- `section`.
- `article`.
- `footer`.
- `form`.
- `fieldset`.
- `legend`.
- `label`.
- `output`.

Ejemplo conceptual de pantallas:

```text
index.html       → Home / acceso a constatación.
constatar.html   → Formulario principal.
resultado.html   → Resultado detallado.
estado.html      → Estado técnico de API / WSCDC.
```

### 10.2 Estados visuales

Definir estados:

```text
idle
loading
success-approved
success-approved-with-observations
rejected
functional-error
technical-error
unavailable
degraded
empty
```

### 10.3 Responsive

El diseño debe funcionar como mínimo en:

- 320px mobile.
- 768px tablet.
- 1024px desktop.
- 1366px desktop.

### 10.4 JavaScript con ES Modules

Módulos sugeridos:

```text
config.js       → API_BASE_URL, USE_MOCK, ambiente visual.
api.js          → fetch wrapper, timeout, errores HTTP.
validators.js   → validaciones frontend.
renderers.js    → render de resultados, errores y estados.
formatters.js   → fechas, importes, CUIT, código autorización.
state.js         → estado simple de la UI.
pages/*.js      → lógica específica de cada pantalla.
```

---

## 11. API interna propuesta

### 11.1 Health general

```http
GET /api/health
```

Respuesta sugerida:

```json
{
  "ok": true,
  "service": "wscdc",
  "arcaEnv": "homologacion",
  "status": "operational",
  "api": "OK"
}
```

### 11.2 Dummy WSCDC

```http
GET /api/wscdc/dummy
```

Respuesta sugerida:

```json
{
  "ok": true,
  "service": "wscdc",
  "arcaEnv": "homologacion",
  "appserver": "OK",
  "dbserver": "OK",
  "authserver": "OK",
  "status": "operational"
}
```

### 11.3 Catálogos

```http
GET /api/wscdc/catalogos/modalidades
GET /api/wscdc/catalogos/comprobantes
GET /api/wscdc/catalogos/documentos
GET /api/wscdc/catalogos/opcionales
```

### 11.4 Constatar comprobante

```http
POST /api/wscdc/constatar
Content-Type: application/json
```

Body sugerido:

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
  "docTipoReceptor": "80",
  "docNroReceptor": "30714509566",
  "opcionales": []
}
```

Respuesta normalizada sugerida:

```json
{
  "ok": true,
  "service": "wscdc",
  "arcaEnv": "homologacion",
  "verdict": "approved",
  "resultado": "A",
  "cmpResp": {
    "cbteModo": "CAE",
    "cuitEmisor": "20111111112",
    "ptoVta": 1,
    "cbteTipo": 1,
    "cbteNro": 123,
    "cbteFch": "20250131",
    "impTotal": 1000.5,
    "codAutorizacion": "12345678901234",
    "docTipoReceptor": "80",
    "docNroReceptor": "30714509566"
  },
  "observaciones": [],
  "errors": [],
  "events": [],
  "fchProceso": "20260101123000"
}
```

---

## 12. Contrato SOAP conceptual

### 12.1 Auth WSCDC

WSCDC recibe un objeto `Auth`:

```xml
<Auth>
  <Token>...</Token>
  <Sign>...</Sign>
  <Cuit>...</Cuit>
</Auth>
```

Donde:

- `Token`: devuelto por WSAA.
- `Sign`: devuelto por WSAA.
- `Cuit`: CUIT representada / contribuyente autorizado.

### 12.2 CmpReq

```xml
<CmpReq>
  <CbteModo>CAE</CbteModo>
  <CuitEmisor>20111111112</CuitEmisor>
  <PtoVta>1</PtoVta>
  <CbteTipo>1</CbteTipo>
  <CbteNro>123</CbteNro>
  <CbteFch>20250131</CbteFch>
  <ImpTotal>1000.5</ImpTotal>
  <CodAutorizacion>12345678901234</CodAutorizacion>
  <DocTipoReceptor>80</DocTipoReceptor>
  <DocNroReceptor>30714509566</DocNroReceptor>
  <Opcionales>
    <Opcional>
      <Id>...</Id>
      <Valor>...</Valor>
    </Opcional>
  </Opcionales>
</CmpReq>
```

---

## 13. Campos principales de ComprobanteConstatar

| Campo | Tipo | Obligatorio | Descripción |
|---|---:|:---:|---|
| CbteModo | string(4) | Sí | CAI, CAE o CAEA |
| CuitEmisor | long(11) | Sí | CUIT del emisor |
| PtoVta | int(5) | Sí | Punto de venta |
| CbteTipo | int(3) | Sí | Tipo de comprobante |
| CbteNro | long(8) | Sí | Número del comprobante |
| CbteFch | string(8) | Sí | Fecha en formato yyyymmdd |
| ImpTotal | double(13+2) | Sí | Importe total |
| CodAutorizacion | string(14) | Sí | CAI, CAE o CAEA |
| DocTipoReceptor | string(2) | No* | Tipo de documento receptor |
| DocNroReceptor | string(20) | No* | Documento receptor |
| Opcionales | array | No | Campos auxiliares |

\* Puede ser obligatorio según tipo de comprobante, importe o regla funcional vigente.

---

## 14. Resultado funcional

WSCDC devuelve `Resultado`.

Valores principales:

```text
A = Autorizado / aprobado
R = Rechazado
```

Fuentes auxiliares históricas también mencionan `O = Observado`, pero para el diseño del MVP conviene modelar el estado observado como:

```text
Resultado = A + Observaciones
```

y mapearlo internamente como:

```text
approved_with_observations
```

---

## 15. Mapeo de respuesta recomendado

### 15.1 Aprobado sin observaciones

```text
resultado = A
observaciones = []
errors = []
verdict = approved
```

### 15.2 Aprobado con observaciones

```text
resultado = A
observaciones.length > 0
verdict = approved_with_observations
```

### 15.3 Rechazado por formato

```text
resultado = R
errors.length > 0
verdict = rejected_format
```

### 15.4 Rechazado por validación funcional

```text
resultado = R
observaciones.length > 0
verdict = rejected_business
```

### 15.5 Error técnico

```text
HTTP 500/502/503
verdict = technical_error
```

---

## 16. Errores y observaciones importantes

### 16.1 Errores infraestructura

```text
500 Error interno de aplicación
501 Error interno de base de datos
502 Transacción activa
503 No existen datos en nuestros registros
```

### 16.2 Errores Auth

```text
600 No se corresponden token y firma / usuario no autorizado
601 CUIT representada no incluida en token
602 CUIT representada no activa o vigente
```

### 16.3 Validaciones de formato relevantes

```text
1  CbteModo inválido
2  CuitEmisor inválido
3  PtoVta inválido
4  CbteTipo inválido
5  CbteNro inválido
6  CbteFch inválida / formato yyyymmdd
7  ImpTotal inválido
8  DocTipoReceptor inválido
9  DocNroReceptor inválido
10 CodAutorizacion inválido
```

### 16.4 Validaciones funcionales relevantes

```text
100 Código CAI/CAE/CAEA no existe o no autorizado
101 Fecha anterior a 20130101
102 CUIT emisor no coincide con código autorización
103 Tipo comprobante no coincide
104 Punto venta no coincide
105 Número comprobante no coincide
106 CAEA no rendido / vigencia
107 Fecha no coincide con CAE/CAEA
108 Fecha fuera de rango CAI
109 Punto de venta CAEA no habilitado
110 Importe no coincide
111 Tipo documento receptor no coincide
112 Número documento receptor no coincide
113 Reglas de documento para comprobantes A / A con leyenda / MiPyme
114 Documento receptor obligatorio para comprobantes A / A con leyenda
115 Documento receptor obligatorio según importe para determinados comprobantes
116 Número documento receptor obligatorio según importe para determinados comprobantes
117 Si informa tipo o número de documento, debe informar ambos
118 Comprobantes T: documentos válidos 80, 91, 94, 96
150/151/152/153 Opcionales inválidos
200 CAEA existente pero no rendido o no coincide con datos registrados
```

---

## 17. Validaciones frontend

El frontend debe validar antes de enviar:

- `CbteModo` obligatorio: CAI, CAE, CAEA.
- CUIT emisor: 11 dígitos numéricos.
- Punto de venta: 1 a 99998.
- Tipo de comprobante: entero válido.
- Número: 1 a 99999999.
- Fecha: formato `yyyymmdd`.
- Importe: número >= 0, máximo 13 enteros y 2 decimales.
- Código de autorización: 14 dígitos numéricos.
- Si informa DocTipoReceptor o DocNroReceptor, informar ambos.

La validación frontend mejora UX, pero la validación backend es obligatoria y manda.

---

## 18. Validaciones backend

El backend debe repetir validaciones críticas:

- Sanitizar strings.
- Evitar XML injection.
- Validar números y longitudes.
- Validar CUIT.
- Validar fechas.
- Validar importe.
- Validar reglas de receptor.
- Validar opcionales.
- Normalizar respuesta.
- No loguear Token ni Sign.

---

## 19. Catálogos

No hardcodear definitivamente:

- Modalidades.
- Tipos de comprobante.
- Tipos de documento.
- Opcionales.

Usar los métodos oficiales y cachear:

```text
ComprobantesModalidadConsultar
ComprobantesTipoConsultar
DocumentosTipoConsultar
OpcionalesTipoConsultar
```

Estrategia sugerida:

- Cache en memoria por 12 horas.
- Endpoint para refrescar manualmente en desarrollo.
- Persistencia opcional futura.

---

## 20. Configuración por ambiente

`.env.example` sugerido:

```env
NODE_ENV=development
ARCA_ENV=homologacion
ARCA_SERVICE=wscdc
ARCA_CUIT=

ARCA_WSAA_HOMO_URL=https://wsaahomo.afip.gov.ar/ws/services/LoginCms
ARCA_WSAA_PROD_URL=https://wsaa.afip.gov.ar/ws/services/LoginCms

ARCA_WSCDC_HOMO_URL=https://wswhomo.afip.gob.ar/WSCDC/service.asmx
ARCA_WSCDC_PROD_URL=https://servicios1.arca.gob.ar/WSCDC/service.asmx

ARCA_CERT_PATH=
ARCA_KEY_PATH=
OPENSSL_BIN=
TA_CACHE_DIR=tmp

API_PORT=3002
CORS_ORIGIN=http://127.0.0.1:5501
LOG_LEVEL=info
```

---

## 21. Seguridad

### 21.1 Nunca exponer en frontend

```text
Token
Sign
Private key
Certificado
CSR
PFX/P12
.env
Paths reales de certificados
SOAP XML completo con credenciales
```

### 21.2 Ignorar en Git

`.gitignore` mínimo:

```gitignore
.env
.env.*
!/.env.example
certs/
tmp/
*.key
*.pem
*.crt
*.csr
*.pfx
*.p12
*.log
```

### 21.3 Logs

Los logs pueden mostrar:

- Ambiente.
- Servicio.
- Endpoint lógico.
- Request ID.
- HTTP status.
- Resultado funcional.

No deben mostrar:

- Token.
- Sign.
- Private key.
- Certificado.
- XML completo con Auth.

---

## 22. Homologación: checklist

```text
[ ] Crear carpeta segura de certificados homologación.
[ ] Generar private key.
[ ] Generar CSR.
[ ] Subir CSR en WSASS.
[ ] Descargar certificado homologación.
[ ] Autorizar servicio wscdc.
[ ] Configurar .env homologación.
[ ] Validar OpenSSL.
[ ] Validar WSAA con service=wscdc.
[ ] Crear TA cache homologación.
[ ] Probar ComprobanteDummy.
[ ] Probar catálogos.
[ ] Probar ComprobanteConstatar con caso de homologación.
[ ] Validar respuesta JSON normalizada.
[ ] Levantar frontend local.
[ ] Validar CORS.
[ ] Validar estados visuales.
```

---

## 23. Producción: checklist futuro

```text
[ ] Generar private key productiva.
[ ] Generar CSR productivo.
[ ] Subir CSR en Administración de Certificados Digitales.
[ ] Descargar certificado productivo.
[ ] Asociar / delegar servicio wscdc en Administrador de Relaciones.
[ ] Configurar .env.production.
[ ] Validar certificado y key.
[ ] Validar WSAA producción.
[ ] Crear TA cache producción.
[ ] Probar ComprobanteDummy producción.
[ ] Probar catálogos producción.
[ ] Probar una constatación real controlada.
[ ] Activar badge visual PRODUCCIÓN.
[ ] Documentar uso interno.
[ ] No realizar pruebas masivas.
```

---

## 24. Roadmap de desarrollo

### Etapa 1 — Investigación y documentación

- Consolidar documentación oficial.
- Crear `docs/contrato-wscdc.md`.
- Crear `docs/roadmap.md`.
- Crear `docs/seguridad.md`.
- Registrar fuentes y prioridad documental.

### Etapa 2 — API base

- Crear proyecto Node.
- Configurar Express.
- Configurar env por ambiente.
- Configurar logger.
- Configurar CORS.
- Crear `/api/health`.

### Etapa 3 — WSAA

- Reutilizar patrón del proyecto WSAPOC.
- Crear TRA con service `wscdc`.
- Firmar CMS con OpenSSL.
- Obtener Token + Sign.
- Cachear TA por ambiente + servicio.

### Etapa 4 — WSCDC Dummy y catálogos

- Implementar `ComprobanteDummy`.
- Implementar catálogos.
- Parsear XML.
- Normalizar JSON.
- Crear tests.

### Etapa 5 — ComprobanteConstatar

- Implementar SOAP request.
- Implementar validadores backend.
- Implementar mapeo de respuesta.
- Implementar errores / observaciones / events.
- Agregar fixtures de test.

### Etapa 6 — Frontend

- Crear HTML semántico.
- Crear CSS modular.
- Crear JS con ES Modules.
- Crear formulario dinámico.
- Crear render de resultados.
- Crear estado técnico.
- Conectar con API.

### Etapa 7 — QA homologación

- Smoke WSAA.
- Smoke Dummy.
- Smoke catálogos.
- Smoke constatación.
- Validar estados visuales.
- Validar errores funcionales.
- Validar errores técnicos.

### Etapa 8 — Preparación producción

- Documentar certificados.
- Asociar servicio wscdc.
- Configurar `.env.production`.
- Pruebas controladas.
- Cierre de versión estable.

---

## 25. Compatibilidad futura con WSAPOC

No mezclar ahora reglas WSCDC con WSAPOC.

Diseñar un core común:

```text
core/wsaa.js
core/soap-client.js
core/ta-cache.js
core/config.js
core/logger.js
core/errors.js
```

Y servicios separados:

```text
services/wscdc/
services/wsapoc/
```

A futuro, la API podría exponer:

```text
/api/wscdc/...
/api/wsapoc/...
```

Compartiendo:

- Configuración.
- Certificados.
- WSAA.
- TA cache.
- Logging.
- Seguridad.

Pero separando:

- Contrato SOAP.
- Validaciones.
- Mapeo de respuesta.
- UI específica.

---

## 26. Decisiones técnicas iniciales

```text
[DECISIÓN] Frontend sin framework.
[DECISIÓN] API intermedia obligatoria.
[DECISIÓN] JSON interno, SOAP solo backend.
[DECISIÓN] WSAA reutilizable.
[DECISIÓN] Catálogos cacheables.
[DECISIÓN] Manual oficial WSCDC 2025 como fuente principal.
[DECISIÓN] AFIP SDK solo como referencia secundaria.
[DECISIÓN] No exponer secretos al navegador.
[DECISIÓN] Preparar compatibilidad futura con WSAPOC sin acoplar ahora.
```

---

## 27. Riesgos técnicos

### 27.1 Manuales o ejemplos viejos

Hay ejemplos históricos que pueden contener reglas desactualizadas.

Mitigación:

- Priorizar manual oficial 2025.
- Contrastar con WSDL vigente.
- Testear en homologación.

### 27.2 SOAPAction / namespaces

El contrato SOAP puede fallar por diferencias finas de namespace, wrapper o action.

Mitigación:

- Centralizar templates SOAP.
- Crear tests de XML.
- Comparar contra WSDL.

### 27.3 Token WSAA ya válido

WSAA puede devolver que ya existe TA válido.

Mitigación:

- Cachear TA por ambiente + servicio.
- Persistir en `tmp/`.
- Manejar error de recuperación.

### 27.4 Errores funcionales vs técnicos

Un comprobante rechazado no necesariamente es un error HTTP.

Mitigación:

- HTTP 200 para respuesta funcional válida.
- Campo `verdict` para estado del comprobante.
- 5xx solo para error técnico.

### 27.5 Exposición de secretos

Mitigación:

- Nunca exponer Token/Sign/certs.
- Redactar logs.
- Revisar git status.
- `.gitignore` estricto.

---

## 28. Prompt inicial sugerido para Codex

```text
Vamos a iniciar el proyecto WSCDC.

Objetivo:
Crear la base del proyecto para una aplicación de constatación de comprobantes usando Frontend HTML/CSS/JS sin framework y una API intermedia Node.js que encapsule WSAA + SOAP/XML.

Usar como referencia principal este documento del repo:
docs/investigacion-wscdc.md

Reglas:
- No implementar producción todavía.
- No usar certificados reales.
- No exponer Token, Sign ni claves.
- No conectar el frontend directo a ARCA.
- Preparar estructura frontend y api separadas.
- Reutilizar el patrón técnico del proyecto WSAPOC solo como inspiración, no copiar secretos ni certificados.

Tareas:
1. Crear estructura de carpetas frontend/, api/ y docs/.
2. Crear documentación inicial README.md.
3. Crear .gitignore seguro.
4. Crear .env.example sin secretos.
5. Crear frontend básico con HTML semántico, CSS modular y JS ES Modules.
6. Crear API base con /api/health.
7. Dejar stubs documentados para WSAA y WSCDC, sin implementación real todavía.
8. Agregar scripts de desarrollo.
9. No tocar certificados reales.
10. Al final informar archivos creados y próximos pasos.
```

---

## 29. Resultado esperado de la primera versión

La primera versión estable de base debe permitir:

```text
[OK] Levantar API local.
[OK] Ver /api/health.
[OK] Levantar frontend local.
[OK] Ver pantalla inicial.
[OK] Ver formulario mock de constatación.
[OK] Ver estados visuales simulados.
[OK] Tener documentación clara para implementar WSAA.
[OK] Tener documentación clara para implementar WSCDC.
[OK] No incluir secretos.
```

Luego se avanza a homologación real.

---

## 30. Notas finales

Este proyecto debe arrancar como módulo independiente de WSCDC, pero diseñado desde el inicio para compartir núcleo técnico con WSAPOC.

El aprendizaje más importante del proyecto WSAPOC aplica de nuevo:

```text
Frontend simple y seguro.
API intermedia robusta.
WSAA centralizado.
SOAP encapsulado.
JSON normalizado.
Ambiente visible.
Secretos fuera del repo.
```

