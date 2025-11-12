# Backend dinâmico — V2 (cron + API)

## Deploy rápido (Vercel)
1. Crie o projeto na Vercel com estes arquivos (ou conecte seu Git).
2. Em **Settings → Environment Variables**, preencha:
   - `STORAGE_DRIVER=S3` (prod) ou `FILE` (dev)
   - `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` (caso S3/R2)
   - `RSS_SOURCES` (já populado com fontes confiáveis)
   - `BRAND_QUERIES` (lista de marcas)
   - (opcional) `MAX_DAYS`, `MAX_ITEMS`
3. Deploy.

## Agendamento
- `vercel.json` agenda `/api/refresh` diariamente às **09:00 UTC (~06:00 BRT)**.
- Para popular agora: `POST /api/refresh` (Functions → Run).

## Front-end
- O portal consome `GET /api/news.json?days=...&brand=...&theme=...&region=...&limit=...`.

## Observação
- `attachBrands` reconhece sinônimos: **SAB → Brahma**, **AB InBev → Budweiser**, **Itaipava/TNT → Grupo Petrópolis** etc.
