# Checklist Homologacion

- [ ] Crear carpeta segura de certificados de homologacion fuera de Git.
- [ ] Generar private key.
- [ ] Generar CSR.
- [ ] Subir CSR en WSASS.
- [ ] Descargar certificado de homologacion.
- [ ] Autorizar servicio `wscdc`.
- [ ] Configurar `.env` local con `ARCA_ENV=homologacion`.
- [ ] Configurar `ARCA_SERVICE=wscdc`.
- [ ] Validar `OPENSSL_BIN`.
- [ ] Validar WSAA y crear `ta-homologacion-wscdc.json`.
- [ ] Probar `GET /api/wscdc/dummy`.
- [ ] Probar catalogos.
- [ ] Cargar casos oficiales para `ComprobanteConstatar`.
- [ ] Reemplazar stub de constatacion por llamada SOAP real.
- [ ] Validar CORS desde frontend local.
