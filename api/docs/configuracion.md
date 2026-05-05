# Configuracion

Copiar `.env.example` a `.env` y ajustar los valores locales.

Variables principales:

| Variable | Uso |
|---|---|
| `PORT` | Puerto HTTP local de la API. |
| `API_BASE_PATH` | Prefijo REST expuesto al frontend, por defecto `/api`. |
| `ARCA_ENV` | Ambiente logico: `homologacion` o `produccion`. |
| `ARCA_SERVICE` | Servicio WSAA solicitado. Para este proyecto: `wsapoc`. |
| `ARCA_CUIT_DELEGADO` | CUIT enviado en la credencial WSAPOC. |
| `WSAA_URL` | Endpoint SOAP WSAA `LoginCms`. |
| `WSAPOC_URL` | Endpoint SOAP WSAPOC sin `?WSDL`. |
| `WSAPOC_NAMESPACE` | Namespace SOAP usado para operaciones WSAPOC. |
| `ARCA_CERT_PATH` | Ruta al certificado PEM. |
| `ARCA_KEY_PATH` | Ruta a la clave privada PEM. |
| `TA_RENEW_SKEW_SECONDS` | Margen para renovar el TA antes del vencimiento. |
| `REQUEST_TIMEOUT_MS` | Timeout para llamadas externas y OpenSSL. |
| `OPENSSL_BIN` | Ruta opcional al binario OpenSSL si no esta en `PATH`. Actualmente documentado como referencia. |
| `TA_CACHE_DIR` | Directorio opcional para cache de TA. Actualmente la API usa `tmp/` bajo la raiz de `api/`. |

Valores iniciales de homologacion:

```env
ARCA_ENV=homologacion
ARCA_SERVICE=wsapoc
ARCA_CUIT_DELEGADO=
WSAA_URL=https://wsaahomo.afip.gov.ar/ws/services/LoginCms
WSAPOC_URL=https://eapoc-ws-qaext.afip.gob.ar/Service.asmx
ARCA_CERT_PATH=./certs/homologacion/certificado.pem
ARCA_KEY_PATH=./certs/homologacion/privada.key
REQUEST_TIMEOUT_MS=60000
```

Si ARCA migra definitivamente los hostnames, cambiar `WSAA_URL` por `https://wsaahomo.arca.gov.ar/ws/services/LoginCms` sin tocar codigo.

## Preparacion para produccion

Seleccion de ambiente:

- Si `ARCA_ENV` existe en la shell, la API usa ese valor.
- Si `NODE_ENV=production` y `ARCA_ENV` no esta definido en la shell, la API usa `produccion`.
- Si no hay nada definido, la API usa `homologacion`.
- `.env.production` se carga para `NODE_ENV=production`, pero no debe versionarse.

La API actual deriva `WSAA_URL` y `WSAPOC_URL` desde las variables por ambiente, salvo que se definan explicitamente en la shell. Para documentar ambos ambientes sin secretos, `.env.example` tambien incluye placeholders:

```env
ARCA_WSAA_HOMO_URL=
ARCA_WSAA_PROD_URL=
ARCA_WSAPOC_HOMO_URL=
ARCA_WSAPOC_PROD_URL=
OPENSSL_BIN=
TA_CACHE_DIR=
```

En despliegue productivo, cargar los endpoints productivos en las variables efectivas y mantener `.env` fuera del repositorio.

Guia completa: `camino-produccion-wsapoc-wsaa.md`.

## Comandos por ambiente

```powershell
npm run dev:homo
npm run dev:prod
```

## Rutas productivas esperadas

```env
ARCA_CERT_PATH=C:\EXAPP\api\certs\produccion\wsapoc-produccion.crt
ARCA_KEY_PATH=C:\EXAPP\api\certs\produccion\wsapoc-produccion.key
TA_CACHE_DIR=C:\EXAPP\api\tmp
```

No subir `.env.production`, certificados ni TA persistidos al repositorio.
