# Guía de despliegue — Portfolio Marcos González

Esta guía resuelve dos problemas concretos:

1. **Conectar tus proyectos** (los que están solo en local) a tu portfolio.
2. **Publicar el portfolio** completo (frontend + backend) para que cualquiera pueda visitarlo desde Internet.

Sigue los pasos en orden. Cada bloque es independiente — puedes hacer uno hoy y otro mañana.

---

## Tabla de contenidos

1. Subir tus proyectos locales a GitHub
2. Desplegar tus proyectos para tener una URL en vivo
3. Conectarlos al portfolio (rellenar `data-repo` y `data-demo`)
4. Añadir capturas reales a cada proyecto
5. Publicar el portfolio (frontend)
6. Publicar el backend del formulario de contacto
7. Conectar el frontend con el backend en producción
8. Dominio personalizado (opcional)
9. Seguridad: rota la contraseña de Gmail filtrada

---

## 1. Subir tus proyectos locales a GitHub

Por cada proyecto que tengas solo en tu PC y quieras enseñar:

```bash
cd ruta/al/proyecto
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/marcosgonme03/NOMBRE-DEL-REPO.git
git push -u origin main
```

Antes del primer commit, añade un `.gitignore` apropiado (el de Node lleva `node_modules`, `.env`, `dist`, `build`, etc.) y un `README.md` con tres secciones:

- **Qué hace el proyecto** (1 párrafo).
- **Stack** (lenguajes, frameworks, BD).
- **Cómo arrancarlo en local** (3-4 comandos).

Ese README es lo primero que verá un reclutador. No lo descuides.

---

## 2. Desplegar tus proyectos para tener una URL en vivo

| Tipo de proyecto | Hosting recomendado | Coste |
|---|---|---|
| Web estática (HTML/CSS/JS o React/Vue/Vite) | **Vercel** o **Netlify** | Gratis |
| App Node.js / Express con backend | **Render** (Web Service) | Gratis con limitación |
| Proyecto Python (RAG, scripts) | **Render** o **Hugging Face Spaces** | Gratis |
| App con base de datos | **Render + PostgreSQL** o **Railway** | Gratis con límites |

**Flujo típico (Vercel/Netlify):**

1. Crea cuenta en `vercel.com` o `netlify.com` con tu GitHub.
2. Pulsa "New project" → seleccionas el repo → deploy.
3. En 1-2 minutos tienes una URL pública del tipo `https://gymapp-pro.vercel.app`.

**Flujo típico (Render para backend Node):**

1. `render.com` → New Web Service → conecta el repo.
2. Build command: `npm install`. Start command: `npm start`.
3. Define variables de entorno en el panel (las de tu `.env`).
4. Render te da una URL del tipo `https://gymapp-pro.onrender.com`.

---

## 3. Conectarlos al portfolio

Abre `index.html`. Cada `<article class="project-card">` tiene dos atributos clave:

```html
<article class="project-card"
         data-repo="https://github.com/marcosgonme03/gymapp-pro"
         data-demo="https://gymapp-pro.vercel.app">
```

- `data-repo` → el repositorio de GitHub.
- `data-demo` → la URL en vivo (si la tienes).

Reglas que aplica el JS automáticamente:

- Si **`data-demo` está vacío** (`data-demo=""`), el botón **"Ver demo" se oculta**.
- Si **`data-repo` está vacío**, el botón **"Código" se oculta**.
- Si los dos están vacíos, aparece la etiqueta **"Próximamente"**.

Por eso es preferible dejarlos vacíos antes que poner enlaces rotos. Llénalos según los vayas teniendo.

---

## 4. Añadir capturas reales a cada proyecto

1. Crea la carpeta `images/projects/`.
2. Haz una captura de cada proyecto (1600×800 px aprox.) y guárdala como:
   - `images/projects/01-gymapp.png`
   - `images/projects/02-rag.png`
   - `images/projects/03-landing.png`
   - `images/projects/04-correcaminos.png`
3. En `index.html`, dentro de cada card, sustituye el bloque:

```html
<div class="card-image-placeholder" aria-label="Preview del proyecto GymApp">
  <span class="card-num">01</span>
</div>
```

por:

```html
<img src="images/projects/01-gymapp.png"
     alt="Captura de GymApp Pro mostrando el dashboard"
     class="card-image-real"
     loading="lazy"
     decoding="async"
     width="1600" height="800">
```

Y añade al CSS (en la sección PROJECTS):

```css
.card-image-real { width: 100%; height: 100%; object-fit: cover; }
```

Las capturas reales suben muchísimo la percepción de calidad. Es la mejora con más impacto-por-esfuerzo.

---

## 5. Publicar el portfolio (frontend)

**Opción A — GitHub Pages (gratis, lo más sencillo):**

1. Crea un repo nuevo: `marcosgonme03/portfolio`.
2. Sube TODO el contenido de la carpeta `Portfolio Marcos` (sin la subcarpeta `backend/node_modules`).
3. En GitHub: Settings → Pages → Source: `main / root` → Save.
4. URL pública: `https://marcosgonme03.github.io/portfolio/`.

**Opción B — Vercel (recomendado, mejor rendimiento):**

1. `vercel.com` → New Project → importa `portfolio` → Deploy.
2. URL pública: `https://portfolio-marcos.vercel.app`.

---

## 6. Publicar el backend del formulario de contacto

El backend (`backend/server.js`) **no se sube a GitHub Pages ni Vercel directamente** porque es un servicio Node.js. Se despliega en Render:

1. Crea otro repo: `marcosgonme03/portfolio-backend` (solo la carpeta `backend/`).
2. Render → New Web Service → conecta el repo.
3. Configuración:
   - Build command: `npm install`
   - Start command: `npm start` (asegúrate de tener `"start": "node server.js"` en package.json)
4. Variables de entorno (Settings → Environment):
   ```
   GMAIL_USER=marcosgonme03@gmail.com
   GMAIL_APP_PASSWORD=tu-app-password-NUEVA   ← ver paso 9
   CONTACT_RECIPIENT=marcosgonme03@gmail.com
   ALLOWED_ORIGINS=https://portfolio-marcos.vercel.app
   ```
5. Deploy. Render te da una URL: `https://portfolio-backend-xxxx.onrender.com`.
6. Verifica: visita `https://portfolio-backend-xxxx.onrender.com/health` — debe devolver JSON con `"status":"ok"`.

> **Aviso:** el plan gratuito de Render duerme el servicio tras 15 min sin tráfico. La primera petición tras dormir tarda ~30s. Para portfolio personal es aceptable.

---

## 7. Conectar el frontend con el backend en producción

Abre `js/main.js` y busca esta línea:

```js
const PROD_BACKEND = 'https://TU-BACKEND-DESPLEGADO.onrender.com/api/contact';
```

Sustitúyela por la URL real que te dio Render, por ejemplo:

```js
const PROD_BACKEND = 'https://portfolio-backend-xxxx.onrender.com/api/contact';
```

Haz commit y push. Vercel re-despliega automáticamente. El formulario ya envía mensajes desde producción.

---

## 8. Dominio personalizado (opcional, paso final)

Compra un `.dev` o `.com` (ej. en Namecheap, Cloudflare Registrar, ~10€/año):

- En Vercel: Settings → Domains → Add → introduce tu dominio.
- Vercel te dará registros DNS (A o CNAME) que tienes que copiar en el panel de tu registrador.
- En 5-30 minutos: `https://marcosgonzalez.dev` apunta a tu portfolio con HTTPS gratis.

Después actualiza:

- `index.html` → todas las URLs `https://marcosgonzalez.dev/` (canonical, OG, JSON-LD) ya están preparadas para ese dominio.
- En Render → variable `ALLOWED_ORIGINS` añade el nuevo dominio.

---

## 9. URGENTE — Rota tu contraseña de Gmail

En el `.env.example` original tenías escrita una App Password real (`cktk lzhc taak clrw`). Si ese archivo llegó a estar en un repo público, **revoca esa contraseña ya**:

1. https://myaccount.google.com/apppasswords
2. Localiza la entrada con esa contraseña → "Eliminar".
3. Genera una nueva.
4. Actualiza tu `.env` local **y** la variable de entorno en Render con la nueva.

He saneado el `.env.example` para que solo tenga placeholders. El `.env` real ya estaba correctamente excluido por `.gitignore`.

---

## Checklist final antes de enseñar el portfolio a alguien

- [ ] Los 4 proyectos tienen `data-repo` con URL real
- [ ] Al menos 2 proyectos tienen `data-demo` en vivo
- [ ] Cada proyecto tiene captura propia (no el placeholder con número)
- [ ] El CV está en la raíz como `cv-marcos-gonzalez.pdf`
- [ ] El formulario de contacto envía emails desde la URL pública
- [ ] El portfolio carga rápido (medir con PageSpeed Insights)
- [ ] Probado en móvil real (no solo en el simulador del navegador)
- [ ] Las URLs canonical/OG en `index.html` apuntan a tu dominio real
- [ ] La App Password antigua de Gmail está revocada

Cuando todos estén marcados, estás listo para incluir el enlace en LinkedIn, GitHub bio y CV.
