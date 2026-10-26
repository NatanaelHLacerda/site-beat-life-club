# site-beat-life-club

Página de parcerias da The Beat Life Club. Site estático: `index.html`, `css/`, `js/`, `fonts/`, `img/`, `video/`.

A ficha de parceria (modal, `js/ficha.js`) envia direto ao CRM de Parcerias pela função pública `enviar_ficha` do Supabase; a empresa entra no funil como "Empresa recebida". A chave usada é a publicável (pública por definição); o banco decide o que ela pode fazer.

Para ver localmente:

```bash
python3 -m http.server 8090
```
