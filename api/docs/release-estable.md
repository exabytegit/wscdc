# Release estable

## v0.1.0-produccion-validada

Fecha de cierre: 2026-05-05

## Estado actual

Consulta APOC queda cerrada en una version estable para uso operativo controlado.

- API local validada contra ARCA produccion real.
- Frontend local conectado a la API real.
- WSAA productivo validado para obtencion y reuso de TA.
- WSAPOC productivo validado con `Dummy`, consulta por CUIT y consulta por rango.
- `authserver=NO` se trata como estado degradado cuando `appserver=OK` y `dbserver=OK`.

Advertencia operativa:

`Este entorno consulta ARCA PRODUCCION real. Usar unicamente consultas controladas. No ejecutar pruebas masivas, loops ni cargas automaticas sin autorizacion.`

## Que fue validado

- Inicio de API con `npm run dev:prod`.
- Inicio de frontend estatico en `127.0.0.1:5500`.
- `GET /api/health` con metadatos publicos seguros: `arcaEnv`, `service`, `status`, `appserver`, `dbserver`, `authserver`.
- Badge visible de `PRODUCCION` en frontend.
- Banner visible de advertencia para ARCA produccion real.
- Estado degradado visible sin bloquear consultas cuando el `Dummy` informa `authserver=NO`.
- Consulta por CUIT con respuesta real.
- Consulta por rango con respuesta real.
- Frontend sin exposicion de `Token`, `Sign`, certificados, private key ni rutas sensibles.

## Comandos manuales

API produccion:

```powershell
cd C:\EXAPP\api
npm run dev:prod
```

Frontend:

```powershell
cd C:\EXAPP\frontend
py -m http.server 5500 --bind 127.0.0.1
```

Navegador:

```text
http://127.0.0.1:5500/index.html
http://127.0.0.1:5500/estado-api.html
```

## URLs locales

- API local: `http://localhost:3001/api`
- Frontend local: `http://127.0.0.1:5500/index.html`
- Estado tecnico: `http://127.0.0.1:5500/estado-api.html`

## Smoke tests minimos

```powershell
Invoke-RestMethod http://localhost:3001/api/health
Invoke-RestMethod http://localhost:3001/api/consulta/cuit/20307764327
Invoke-RestMethod "http://localhost:3001/api/consulta/rango?desde=01/01/2025&hasta=31/01/2025"
```

Resultado esperado:

- `arcaEnv=produccion`
- `service=wsapoc`
- `appserver=OK`
- `dbserver=OK`
- `authserver=NO` o `authserver=OK`, sin tratarlo como caida total si el resto responde
- consulta por CUIT con `200`
- consulta por rango con `200`

## Checklist operativo

- [ ] API iniciada con `arcaEnv=produccion`.
- [ ] Frontend iniciado en `127.0.0.1:5500`.
- [ ] `/api/health` responde `appserver=OK`.
- [ ] `/api/health` responde `dbserver=OK`.
- [ ] `authserver=NO` se muestra como degradado, no como error fatal.
- [ ] Consulta por CUIT responde `200`.
- [ ] Consulta por rango responde `200`.
- [ ] Frontend muestra badge `PRODUCCION`.
- [ ] Frontend muestra estado operativo/degradado.
- [ ] No se exponen `Token`, `Sign`, certificados, private key ni rutas sensibles.
- [ ] `git status` limpio antes de cerrar.

## Nota de version

`v0.1.0-produccion-validada`

- API WSAPOC productiva validada.
- WSAA productivo validado.
- TA productivo cacheado correctamente.
- Frontend conectado a API real.
- Health degradado por `authserver=NO` documentado.
- Consulta por CUIT validada.
- Consulta por rango validada.

## No hacer

- No cambiar certificados.
- No regenerar CSR.
- No tocar `.env.production`.
- No borrar `tmp/ta-produccion-wsapoc.json`.
- No hacer pruebas masivas contra ARCA.
- No commitear secretos.
- No cambiar endpoints productivos.
