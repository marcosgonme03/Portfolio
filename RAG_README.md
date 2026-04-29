# RAG Intelligence — Retrieval Augmented Generation System

Sistema de Retrieval Augmented Generation (RAG) con búsqueda semántica end-to-end. Extrae documentos automáticamente, genera embeddings vectoriales, realiza búsqueda semántica y devuelve respuestas contextualizadas con IA generativa.

## 🎯 ¿Qué resuelve?

Muchas aplicaciones necesitan hacer preguntas a sus documentos sin entrenamiento de modelos. Este sistema permite:

- **Carga dinámmica** de documentos (PDF, TXT, DOCX)
- **Búsqueda semántica** (no por palabras clave, sino por significado)
- **Respuestas contextualizadas** basadas en los documentos cargados
- **Arquitectura escalable** lista para producción

## 🛠️ Stack Técnico

| Componente | Tecnología |
|---|---|
| **Backend** | Python, Flask |
| **BD Vectorial** | Chroma DB |
| **Embeddings** | OpenAI API / Gemini API |
| **LLM** | OpenAI GPT / Gemini |
| **BD Relacional** | SQLite |
| **Extracción** | PyPDF2, python-docx, txt parsing |
| **Frontend** | HTML5, CSS3, Vanilla JS |

## 📋 Arquitectura

```
┌──────────────────┐
│  Cargar Doc      │ (PDF, TXT, DOCX)
└────────┬─────────┘
         │
┌────────▼──────────┐
│ Extractor Module  │ (pdf extraction, text splitting)
└────────┬──────────┘
         │
┌────────▼──────────┐
│ Embeddings Gen    │ (OpenAI/Gemini API)
└────────┬──────────┘
         │
┌────────▼──────────┐
│ Chroma DB Storage │ (Vector DB)
└────────┬──────────┘
         │
┌────────▼──────────┐
│ Query Processing  │ (User question)
└────────┬──────────┘
         │
┌────────▼──────────┐
│ Semantic Search   │ (Cosine similarity)
└────────┬──────────┘
         │
┌────────▼──────────┐
│ LLM Response Gen  │ (Context + LLM)
└──────────────────┘
```

## 🚀 Características principales

✅ **Búsqueda semántica de verdad** — Entiende significado, no solo palabras
✅ **Multi-documento** — Carga varios documentos y busca en todos
✅ **Contexto en respuestas** — Incluye referencias a los documentos
✅ **Manejo de errores** — Validaciones en cada paso
✅ **Interfaz limpia** — Frontend sencillo pero funcional
✅ **Escalable** — Estructura lista para agregar más documentos

## 📦 Instalación y Ejecución

### Requisitos previos

```bash
Python 3.9+
pip (gestor de paquetes)
API Keys: OpenAI o Gemini
```

### Pasos

1. **Clonar el repositorio**

```bash
git clone https://github.com/marcosgonme03/RAG-EMPAQUETADO.git
cd RAG-EMPAQUETADO
```

2. **Crear entorno virtual**

```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. **Instalar dependencias**

```bash
pip install -r requirements.txt
```

4. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz:

```env
# API Keys
OPENAI_API_KEY=tu_clave_aqui
# O si usas Gemini:
GEMINI_API_KEY=tu_clave_aqui

# Configuración
FLASK_ENV=development
DEBUG=True
```

5. **Ejecutar la aplicación**

```bash
python main.py
```

Abre `http://localhost:5000` en tu navegador.

## 💡 Cómo usar

1. **Carga documentos** — Haz clic en "Subir documento" y selecciona PDF/TXT
2. **Espera procesamiento** — El sistema genera embeddings (puede tardar unos segundos)
3. **Haz preguntas** — Escribe cualquier pregunta sobre los documentos
4. **Obtén respuestas** — El sistema busca contexto relevante y genera una respuesta

## 📊 Estructura de carpetas

```
RAG-EMPAQUETADO/
├── main.py                 ← Punto de entrada (Flask app)
├── rag.py                  ← Lógica RAG principal
├── database.py             ← Gestión de BD SQLite
├── embeddings.py           ← Generación de embeddings
├── extractors.py           ← Extracción de documentos
├── requirements.txt        ← Dependencias
├── chroma_db/              ← Base de datos vectorial (local)
├── uploads/                ← Documentos subidos por usuarios
├── templates/              ← Plantillas HTML
├── static/                 ← CSS y JS
├── rag.sqlite              ← BD relacional
└── .env                    ← Variables de entorno (no en Git)
```

## 🔑 Conceptos clave implementados

### 1. **Embeddings Vectoriales**
Cada documento se convierte en un vector en espacio multidimensional. El modelo entiende semántica, no solo palabras.

### 2. **Chroma DB (Vector Store)**
Base de datos especializada para almacenar y buscar embeddings rápidamente con similitud coseno.

### 3. **Recuperación Semántica**
Cuando preguntas, tu pregunta se convierte en embedding y se busca en el espacio vectorial. No es búsqueda por palabras clave.

### 4. **Augmented Generation**
Las respuestas se generan por LLM, pero con contexto de los documentos reales (no alucinaciones).

## 🧪 Caso de uso real

Imagina que tienes:
- Manual técnico de 200 páginas
- Reportes de proyectos anteriores
- Documentación de API interna

Con RAG Intelligence puedes:
```
Usuario: "¿Cuál es el timeout máximo de la API?"
Sistema: Busca en todos los docs, encuentra la respuesta, y responde:
"Según la documentación de API (pág. 45), el timeout máximo es 30 segundos."
```

## 📈 Mejoras futuras

- [ ] Soporte para imágenes y tablas en PDFs
- [ ] Respuestas en múltiples idiomas
- [ ] Caché de embeddings para optimización
- [ ] API REST para integración en otros proyectos
- [ ] Dashboard de analytics (documentos procesados, queries frecuentes)
- [ ] Autenticación de usuarios

## ⚙️ Configuración avanzada

### Cambiar modelo de embeddings

En `embeddings.py`:
```python
# Cambiar de OpenAI a Gemini
from google.generativeai import embed_content
```

### Ajustar tamaño de chunks

En `extractors.py`:
```python
CHUNK_SIZE = 1000  # palabras por chunk
CHUNK_OVERLAP = 200  # solapamiento
```

## 🤝 Contribuciones

Este es un proyecto personal de portfolio. Si tienes sugerencias:
1. Fork el repo
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit (`git commit -m 'Añade mejora'`)
4. Push (`git push origin feature/mejora`)
5. Abre un Pull Request

## 📄 Licencia

Código personal. Si lo reutilizas, da crédito a Marcos González Mesa.

## 👨‍💻 Autor

**Marcos González Mesa**
- GitHub: [@marcosgonme03](https://github.com/marcosgonme03)
- LinkedIn: [marcos-gonzalez-471348273](https://www.linkedin.com/in/marcos-gonzalez-471348273)
- Email: marcosgonme03@gmail.com

---

**Último update:** Abril 2026
