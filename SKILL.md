---
name: web-cinematica
description: >
  Crea páginas web cinematográficas que avanzan con el scroll como si fueran una película:
  videos generados con IA en Higgsfield (por API, con saldo prepagado y sin plan mensual)
  que se mueven cuadro a cuadro al bajar, escenas encadenadas en un solo plano sin cortes,
  textos que aparecen sobre el video, música libre de derechos y una plantilla lista para
  publicar en Vercel. Sirve para cualquier tema: producto, auto, perfume, casa, restaurante,
  lugar o marca. Guía paso a paso a personas que NO programan, desde crear su cuenta en
  Higgsfield hasta la página publicada. Úsalo cuando el usuario diga "/web-cinematica",
  "página con movimiento", "web con video de fondo", "landing con scroll animado", "que el
  video avance con el scroll", "página como la de Apple", "web cinematográfica", "página que
  cuente una historia" o "scroll storytelling".
---

# web-cinematica

Esta skill arma una página donde el visitante baja y la historia avanza: un video que se
mueve al ritmo de su dedo, escenas que se encadenan sin cortes y textos que aparecen en el
momento justo. Es la técnica de las páginas de producto de Apple, hecha con videos generados
en Higgsfield. El tema lo elige el usuario: cualquier producto, lugar o marca.

**Para quién es:** personas que no programan. Tú haces el trabajo técnico; el usuario decide
la historia, aprueba cada gasto y mira el resultado.

## Cómo hablarle al usuario

- Español simple y cercano, de tú. Nada de jerga: si una palabra técnica es inevitable, se
  explica en la misma frase.
- **Una pregunta a la vez.** Espera la respuesta antes de seguir.
- **Un paso a la vez.** En los pasos que hace él (crear la cuenta, cargar saldo, bajar la
  música), dale una sola instrucción, espera que te diga "listo" y recién ahí la siguiente.
- **Nunca le pidas que corra comandos.** Los corres tú.
- **Nunca le pidas claves ni datos de tarjeta en el chat.** Las claves van en un archivo que
  se le abre en su computador; la tarjeta la ingresa él en la página de Higgsfield.
- Antes de cada generación, muéstrale el costo en dólares y espera un sí.

## Las herramientas de la skill

- `scripts/higgsfield.mjs`: cotiza y genera imágenes y videos por la API de Higgsfield.
- `scripts/cuadros.mjs`: convierte los videos en cuadros, saca cuadros sueltos y deja la
  música liviana. Si el equipo no tiene ffmpeg, lo baja solo la primera vez.
- `plantilla/`: la página base, genérica, que se copia y se completa.

En esta guía, `<skill>` es la carpeta de esta skill.

## Antes de partir

Revisa esto en orden. Lo que falte, resuélvelo con él antes de la etapa 1.

1. **Node.js.** Prueba `node --version`. Tiene que ser 20.12 o más nuevo. Si no está o es
   viejo, explícale que es un programa gratuito que necesitan las herramientas, y llévalo a
   https://nodejs.org a bajar la versión LTS (el botón grande) e instalarla con todo por
   defecto. Después, que reinicie Claude.
2. **Cuenta de API en Higgsfield, saldo y claves.** Corre
   `node <skill>/scripts/higgsfield.mjs probar`. Si las claves funcionan, sigue. Si no, guíalo
   con `references/higgsfield.md`, pasos 1 a 3: crear la cuenta en open.higgsfield.ai, cargar
   saldo (recomienda US$10) y crear las claves. Explícale primero la diferencia con los
   planes de la web: acá se carga saldo una vez y se paga solo lo que se genera.
3. **El tope de gasto.** Pregúntale cuánto quiere gastar como máximo este mes y fíjalo con
   `node <skill>/scripts/higgsfield.mjs tope <monto>`. Una página cuesta entre US$3 y US$5.
4. **Una carpeta para el proyecto.** Pregúntale cómo se llama su marca o producto y crea una
   carpeta con ese nombre en minúsculas y con guiones (por ejemplo `cafe-tostado`), dentro de
   Documentos o donde él prefiera.

## Brief de seguridad (díselo en simple, antes de crear nada)

- **Sus claves de Higgsfield nunca van en la página.** Viven en un archivo privado de su
  computador (`~/.web-cinematica/higgsfield.env`), fuera de la carpeta de la página, así que
  no se pueden publicar por error. Si alguna vez se filtran, las borra en open.higgsfield.ai
  y crea otras.
- **El gasto lo controla él, por tres lados:** solo se gasta el saldo que cargó (sin recarga
  automática), el script no pasa el tope mensual que fijó y cada generación se cotiza antes.
- **La página es estática y blindada.** Lleva una política de seguridad (CSP) que impide
  cargar código de otros sitios. No hay formularios que manden datos: el botón final lleva a
  WhatsApp, a una agenda o a una tienda. Si pide un formulario de contacto o reservas,
  explícale que eso necesita un servidor con protección anti-bots y límite de intentos, y que
  es un proyecto aparte. No lo improvises.
- **Derechos de autor.** Nada de marcas, logos, personajes ni personas reales que no sean
  suyos. La música sale de Pixabay, con licencia libre; nunca canciones comerciales. El pie
  de la página avisa que las imágenes y videos fueron generados con IA.
- **Peso.** Cada escena se carga recién cuando el visitante se acerca y el celular usa cuadros
  más livianos. Igual le vas a mostrar cuánto pesa la página antes de publicar.

## Las etapas

Sigue las etapas en orden. Cada una tiene su referencia con el detalle: léela cuando llegues
a esa etapa, no antes.

### Etapa 1 · La idea (sin gastar nada)

Pregunta, de a una:
1. ¿Qué vamos a mostrar? Un producto, un lugar, un servicio. Tiene que haber **un
   protagonista visual** que se mantenga en toda la historia (la botella, la casa, el plato).
2. ¿Qué tiene que sentir quien la vea? Lujo, aventura, calma, nostalgia, potencia.
3. ¿Qué tiene que hacer al final? Escribir por WhatsApp, reservar, comprar, agendar.
4. ¿Tiene fotos reales de su producto? Si las tiene, pídele que te diga dónde están.

Con eso, propón **la historia en 4 a 6 momentos** y una frase corta para cada uno.
Explícale la regla de oro: **toda la historia es un solo plano de cámara que nunca se
corta.** Espera su aprobación.

Detalle y ejemplos de historias para distintos rubros: `references/historia.md`.

### Etapa 2 · El guion de escenas (sin gastar nada)

Convierte la historia en una tabla de videos. Por cada video: qué pasa, desde qué imagen
parte, cómo se empalma con el anterior y si se va a reproducir al revés. Antes de mostrarla,
revísala con las reglas de `references/empalmes.md`. Las más importantes:

- Cada video parte del **último cuadro del video anterior**.
- Si un movimiento se puede lograr reproduciendo al revés un video que ya existe, no se
  genera otro.
- **Nunca** un movimiento de ida y vuelta (girar a un lado y después al otro): se ve raro.
  La historia siempre avanza.
- Los cambios de lugar (del estudio a la playa) se hacen **dentro** de un video, con un
  movimiento que los justifique, no con un fundido entre dos videos.

Muéstrale la tabla con el costo estimado total (US$0,56 por video de 5 segundos, más unas
imágenes de centavos) y espera su aprobación.

### Etapa 3 · La imagen maestra

Es la foto del protagonista de la que nacen todos los videos. Si sale bien, todo lo demás
sale parecido; si sale mal, no hay video que la salve.

1. Escribe el prompt con `references/prompts.md`, sección "Imagen maestra".
2. Cotiza: `node <skill>/scripts/higgsfield.mjs cotizar imagen --prompt "..."`. Si tiene
   fotos reales, agrega `--referencias foto1.jpg,foto2.jpg`.
3. Muéstrale el costo, pide el sí y genera 2 a 4 variantes (una cotización y un `generar`
   por cada una) con `--carpeta fuentes --nombre maestra`.
4. Mira las imágenes tú, descarta las que tengan defectos y muéstrale las buenas. Que elija.
   Si ninguna convence, ajusta el prompt con lo que dijo y vuelve a generar.

### Etapa 4 · Los videos

Para cada fila del guion, en orden:
1. Escribe el prompt con `references/prompts.md` (hay plantillas por tipo de toma).
2. Cotiza: `node <skill>/scripts/higgsfield.mjs cotizar video --prompt "..." --inicio <imagen>`
   (y `--final <imagen>` si tiene que terminar en un cuadro exacto).
3. Muéstrale el costo y espera el sí.
4. Genera con `--carpeta fuentes --nombre 02-<qué-pasa>`. Tarda de 1 a 5 minutos: avísale.
5. Revisa tú el video antes de mostrárselo: saca tres cuadros (inicio, medio y final) con
   `node <skill>/scripts/cuadros.mjs cuadro <video> <segundo> <salida.png>` y míralos. Busca
   deformaciones, cambios de color, partes que aparecen o desaparecen.
6. Muéstrale los cuadros y pregúntale si sirve.
7. Saca el último cuadro con `node <skill>/scripts/cuadros.mjs ultimo <video> <salida.png>`:
   esa imagen es el `--inicio` del video siguiente.

Si un video sale mal, mira primero si recortarlo resuelve el problema. Recortar es gratis;
regenerar no. Errores típicos y cómo se arreglaron: `references/problemas.md`.

### Etapa 5 · La música

La API de Higgsfield no genera música, así que se usa una pista libre de derechos de
Pixabay. Guíalo paso a paso con `references/higgsfield.md`, sección "Música libre de
derechos". Al final queda en `assets/musica.mp3`.

Si prefiere una página sin música, se pone `musica: null` en `guion.js` y listo.

### Etapa 6 · Armar la página

1. Copia la carpeta `<skill>/plantilla/` a la carpeta del proyecto.
2. Convierte cada video en cuadros, desde la carpeta del proyecto:
   `node <skill>/scripts/cuadros.mjs secuencia fuentes/02-puerta.mp4 puerta`.
   El script anota solo la cantidad de cuadros en `guion.js`.
3. Arma `guion.js`: qué videos van en cada escena, en qué orden, cuánto peso tiene cada uno y
   cuáles van al revés.
4. Escribe los textos del `index.html` y ubica cada uno en su momento con `data-desde` y
   `data-hasta`. Cambia título, descripción, marca y el link del botón final.
5. Ajusta colores y tipografías en las variables del inicio de `estilos.css`.

Todo el detalle de la plantilla: `references/pagina.md`.

### Etapa 7 · Revisar

Levanta un servidor local en la carpeta del proyecto (por ejemplo
`python3 -m http.server 5190` o `npx serve`) y entrégale la dirección para que la abra. Pásale
la lista de `references/publicar.md`, sección "Antes de publicar", y corrige lo que
encuentre. Muéstrale cuánto pesa la página completa.

### Etapa 8 · Publicar

Publica en Vercel siguiendo `references/publicar.md`. El archivo `vercel.json` de la
plantilla ya trae las cabeceras de seguridad. Al terminar, entrégale el link y prueba tú que
cargue.

## El ejemplo completo

`references/ejemplo-halcon.md` documenta una página terminada, la de un auto ficticio, con
su historia, cada prompt, el guion de escenas, los errores que aparecieron y cómo se
resolvieron. Es solo un ejemplo para guiarte: cada usuario trae su propio tema.
