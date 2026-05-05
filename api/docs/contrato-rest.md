# Contrato REST

La API expone JSON estable para el frontend y oculta SOAP, certificado, `Token` y `Sign`.

## `GET /api/health`

Respuesta:

```json
{ "appserver": "OK", "dbserver": "OK", "authserver": "OK" }
```

## `GET /api/consulta/cuit/:cuit`

Respuesta con resultado:

```json
{
  "codigo": 0,
  "descripcion": "Ejecucion exitosa.",
  "resultado": {
    "CUIT": "20111111112",
    "Descripcion": "TEST",
    "FechaCondicion": "01/01/2026",
    "FechaPublicacion": "02/01/2026"
  }
}
```

Respuesta sin resultado:

```json
{ "codigo": 0, "descripcion": "No se encontraron resultados.", "resultado": null }
```

## `GET /api/consulta/rango`

Parametros:

- `desde`: fecha `DD/MM/YYYY`.
- `hasta`: fecha `DD/MM/YYYY`.
- `page`: pagina, default `1`.
- `pageSize`: tamano de pagina, default `10`, maximo `100`.

Respuesta:

```json
{
  "codigo": 0,
  "descripcion": "Ejecucion exitosa.",
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 10,
  "totalPages": 0
}
```

## Errores

```json
{
  "codigo": 201,
  "descripcion": "Error de autenticacion",
  "scenario": "AUTH_EXPIRED",
  "requestId": "..."
}
```

Mapeo principal:

| Caso | HTTP | `scenario` |
|---|---:|---|
| Validacion local o codigo WSAPOC `200` | 400 | `VALIDATION_ERROR` |
| Credenciales o codigo WSAPOC `201` | 401 | `AUTH_EXPIRED` |
| SOAP Fault o respuesta externa invalida | 502 | `SOAP_FAULT` |
| Timeout externo | 504 | `TIMEOUT` |
