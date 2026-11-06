# Higgsfield por API: cuenta, saldo, claves y generación

La skill usa la **API de Higgsfield**, no los planes mensuales de la web. La diferencia, para
explicársela al usuario en simple:

- **Plan de la web (higgsfield.ai):** se paga todos los meses, se use o no.
- **API (open.higgsfield.ai):** se carga saldo una vez, en dólares, y se descuenta solo lo
  que se genera. Sin mensualidad. El saldo vence al año de cargarlo.

Para una página como esta, la API sale mucho más barata: una página completa cuesta entre
US$3 y US$5.

Todo se hace con el script `scripts/higgsfield.mjs`, que corres tú. El usuario solo crea la
cuenta, carga el saldo y pega sus claves en un archivo.

## Paso 1 · Crear la cuenta de API

Díselo así, de a un paso, esperando que confirme cada uno:

1. Entra a **https://open.higgsfield.ai** y aprieta el botón para registrarte. Puedes usar
   tu cuenta de Google. Si te pregunta, elige cuenta personal (Individual).
2. Si ya tienes cuenta en higgsfield.ai, igual tienes que entrar a open.higgsfield.ai: la
   API es una cuenta aparte, con su propio saldo.

## Paso 2 · Cargar saldo

1. En open.higgsfield.ai, entra a **Billing**.
2. Agrega una tarjeta y carga saldo. El mínimo es US$5. **Recomienda US$10**: alcanza para
   la página y para repetir los videos que salgan mal.
3. **No actives la recarga automática** (auto top-up). Así nunca se cobra más de lo que
   cargó.

Nunca le pidas los datos de su tarjeta ni los escribas por él: ese paso lo hace él solo, en
la página de Higgsfield.

## Paso 3 · Crear las claves

1. En open.higgsfield.ai, entra a **API Keys** y crea una clave nueva. Ponle un nombre
   como `mi-pagina-web`.
2. Higgsfield muestra la clave **una sola vez**: un ID y un secreto, a veces juntos en una
   sola línea separada por dos puntos. Que no cierre esa ventana todavía.
3. Corre `node <skill>/scripts/higgsfield.mjs configurar`. Se abre un archivo de texto en su
   computador. Que pegue ahí el ID y el secreto, guarde y cierre. Si la clave venía en una
   sola línea, puede pegarla entera en el ID.
4. Corre `node <skill>/scripts/higgsfield.mjs probar` y confírmale que funcionan.

**Por qué así:** el archivo vive en `~/.web-cinematica/higgsfield.env`, en su carpeta
personal y fuera de la carpeta de la página. Nunca puede terminar publicado en internet.
**Que no pegue las claves en el chat**: el chat no es un lugar seguro para guardarlas. Si
igual las pega, dile que las borre en open.higgsfield.ai y cree unas nuevas.

## Paso 4 · El tope de gasto

Pregúntale cuánto quiere gastar como máximo este mes y fíjalo:

```
node <skill>/scripts/higgsfield.mjs tope 10
```

El script se niega a generar si una generación pasa ese tope. Es una segunda barrera, además
del saldo cargado.

## Cotizar y generar

**Siempre en dos pasos.** Cotizar es gratis; solo generar cobra.

```
node <skill>/scripts/higgsfield.mjs cotizar video --prompt "..." --inicio fuentes/maestra.png
```

Devuelve el costo y un número de cotización. Muéstrale el costo, lo que lleva gastado y
espera su sí. Recién ahí:

```
node <skill>/scripts/higgsfield.mjs generar <cotización> --carpeta fuentes --nombre 02-puerta
```

El script espera a que termine (un video tarda de 1 a 5 minutos; córrelo en segundo plano si
tu entorno lo permite) y baja el archivo a `fuentes/`.

### Imágenes

```
node <skill>/scripts/higgsfield.mjs cotizar imagen --prompt "..." [--referencias foto1.jpg,foto2.png]
```

- Sin referencias usa **Soul 2** (1080p): muy barato y fotorrealista. Ideal para la imagen
  maestra.
- Con referencias usa **Grok Imagine 2.0**: sirve cuando el usuario tiene fotos reales de su
  producto, o para poner al mismo protagonista en otro lugar.
- Para variantes, cotiza y genera varias veces el mismo prompt.

### Videos

```
node <skill>/scripts/higgsfield.mjs cotizar video --prompt "..." --inicio cuadro.png [--final cuadro.png] [--duracion 5]
```

- Usa **Kling 3.0 Pro**, imagen a video, sin sonido (la página no lo usa y sale más barato).
- `--inicio` es la imagen desde la que parte: la maestra o el último cuadro del video
  anterior. Puede ser un archivo local; el script lo sube solo.
- `--final` es opcional: el cuadro exacto en que tiene que terminar. Ver `empalmes.md`.
- 5 segundos alcanzan para casi todo.

### Costos de referencia (noviembre de 2026; cotiza siempre, cambian)

| Qué | Costo aprox. |
|---|---|
| Imagen Soul 2 | US$0,006 |
| Imagen con referencias (Grok Imagine) | US$0,09 |
| Video de 5 s, Kling 3.0 Pro | US$0,56 |

Página típica: 4 imágenes de prueba + 5 videos = **unos US$3**. Con un par de repeticiones,
US$4 a US$5.

## Ver el gasto

```
node <skill>/scripts/higgsfield.mjs gasto
```

Muestra lo gastado este mes según el script. El saldo real de la cuenta está en
open.higgsfield.ai, sección Billing.

## Si algo falla

| Mensaje | Qué hacer |
|---|---|
| Higgsfield rechazó las claves | Revisar que estén bien copiadas, sin espacios. Si no, crear unas nuevas |
| No hay saldo suficiente | Cargar saldo en Billing |
| Pasaría el tope mensual | Preguntarle si quiere subirlo con `tope` |
| Terminó en "nsfw" | El filtro de contenido lo bloqueó. No se cobra. Cambiar el prompt |
| Terminó en "failed" | No se cobra. Reintentar una vez; si vuelve a fallar, simplificar el prompt |
| Pasaron 15 minutos | Puede terminar igual: revisar el pedido en la consola, los archivos duran 7 días |

## Si un modelo deja de existir

Los modelos están definidos al inicio de `higgsfield.mjs` (`MODELOS`). El catálogo vigente
está en https://open.higgsfield.ai/explore y la documentación de cada uno en
https://docs.higgsfield.ai. Para video, el reemplazo tiene que aceptar una imagen inicial y,
idealmente, una final.

---

# Música libre de derechos

La API de Higgsfield no genera música. La pista se saca de **Pixabay Music**, que es gratis,
se puede usar en una página comercial y no exige dar crédito.

Guíalo así:

1. Pregúntale qué emoción busca y propón dos o tres palabras de búsqueda en inglés, que
   funcionan mejor. Ejemplos:
   - Auto o tecnología: `cinematic ambient`, `dark synth`, `epic minimal`.
   - Lujo o perfume: `luxury piano`, `elegant ambient`.
   - Casa o naturaleza: `calm acoustic`, `warm ambient`.
   - Restaurante: `lounge jazz`, `cozy evening`.
2. Que entre a **https://pixabay.com/music/**, busque, escuche y baje la que le guste (botón
   de descarga, formato MP3). Si le pide crear una cuenta, es gratis.
3. Que te diga dónde quedó el archivo (normalmente en Descargas).
4. Pásala por `node <skill>/scripts/cuadros.mjs musica <archivo-bajado> assets/musica.mp3`:
   la deja en MP3 de 128 kbps, que pesa 2 a 3 MB por cada 2 minutos y suena bien en una web.

**Recomendaciones:**
- Instrumental, sin voz: una voz compite con los textos de la página.
- Que empiece suave: el visitante entra con un clic y la música sube de a poco.
- Ojo con las pistas muy cortas (menos de 1 minuto): el bucle se nota.

**Lo que no se puede:** usar canciones comerciales (Spotify, YouTube, radio) aunque sean un
pedazo. Si el usuario insiste, explícale que puede recibir un reclamo de derechos de autor
y que su página puede ser bajada.

Si no quiere música: `musica: null` en `guion.js`.
