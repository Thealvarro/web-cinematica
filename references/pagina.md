# La plantilla

```
mi-pagina/
├── index.html      Textos y estructura
├── estilos.css     Colores y tipografías (variables al inicio)
├── guion.js        Qué videos van en cada escena y en qué orden
├── motor.js        El motor. No se toca.
├── vercel.json     Cabeceras de seguridad para publicar
├── assets/
│   ├── cuadros/    Una carpeta por video (y su versión -movil). La llena cuadros.mjs.
│   ├── img/        Fotos de las secciones quietas
│   └── musica.mp3
└── fuentes/        Videos originales e imágenes de trabajo. NO se publica.
```

## Cómo funciona (para explicarlo en simple)

Cada video se convierte en unas 60 fotos (cuadros). Mientras el visitante baja, la página
muestra la foto que corresponde a cuánto bajó: es como pasar las hojas de un libro animado
con el dedo. Por eso el movimiento va exactamente al ritmo del scroll, hacia adelante y
hacia atrás, y funciona igual en el celular.

Se usan fotos y no el video directo porque los navegadores (sobre todo Safari y los
celulares) saltan y se traban al adelantar un video con el scroll.

## guion.js

```js
window.GUION = {
  secuencias: { 'tablero': 58, 'puerta': 58, 'giro': 61, 'costa': 45 },
  escenas: {
    apertura: { alto: 320, tramos: [{ seq: 'encendido', peso: 1 }] },
    relato: {
      alto: 1200,
      tramos: [
        { seq: 'tablero', peso: 260, alReves: true },
        { seq: 'puerta', peso: 260, alReves: true },
        { seq: 'giro', peso: 340 },
        { seq: 'costa', peso: 440 },
      ],
    },
  },
  musica: { archivo: 'assets/musica.mp3', volumen: 0.6 },
};
```

- **secuencias:** cuántos cuadros tiene cada video. Lo anota solo `cuadros.mjs`.
- **escenas:** una por cada `<section data-escena="...">` del HTML.
- **alto:** cuánto hay que bajar para recorrer la escena, en altos de pantalla. Regla:
  **unos 100 de alto por cada 2 a 3 segundos de video**. Menos, y el video vuela; más, y
  se siente pegado.
- **tramos:** los videos de la escena, en orden. `peso` reparte el recorrido: un tramo con
  peso 440 dura casi el doble que uno de 260. `alReves: true` lo reproduce hacia atrás.
- **musica:** `null` para una página sin música.

## Los textos (beats)

Cada texto que aparece sobre una escena es un `<div class="beat">` dentro de su `.escena`:

```html
<div class="beat izq abajo" data-desde="0.42" data-hasta="0.72">
  <p class="kicker">Capítulo 03 · Por dentro</p>
  <h2 class="subtitulo">Cuero negro,<br><em>costura roja.</em></h2>
  <p class="bajada">Una línea que explica.</p>
</div>
```

- `data-desde` y `data-hasta` van de 0 (la escena recién llega) a 1 (termina). Usa 1.01
  como final del último texto para que no se apague justo antes de salir.
- Posición: `izq`, `der` o `centro`, combinado con `arriba` o `abajo`.
- **Para ubicar un texto en un momento del video:** si los tramos tienen pesos 260, 260,
  340 y 440 (total 1300), el tramo 3 va de 520/1300 = 0,40 a 860/1300 = 0,66. Un texto
  sobre el giro va entre 0,41 y 0,64.
- Deja huecos sin texto entre beats (0,03 a 0,05) para que el video respire.
- Revisa que el texto no tape lo importante del video: si el protagonista está a la derecha,
  el texto va a la izquierda.

## Capítulos y anclas

El índice lateral (`.capitulos`) marca dónde va el visitante. Cada `<a data-ir="x">` se
activa cuando pasa la mitad de la pantalla un elemento con `data-capitulo="x"`.

Dentro de una escena larga, los capítulos se marcan con anclas invisibles:

```html
<span class="ancla" id="forma" data-capitulo="forma" data-en="0.40"></span>
```

`data-en` es el punto del recorrido (0 a 1) donde parte ese capítulo. El motor las ubica
solo; con eso el link `#forma` del índice lleva justo a ese momento.

## Secciones quietas

- `.respiro`: foto con parallax y un número gigante de fondo. Para el origen o la historia.
- `.cifras-seccion`: números que cuentan solos al aparecer (`data-cuenta`, `data-decimales`).
- `.cierre`: la invitación final con su botón.

Puedes agregar otras (galería, modelos, testimonios), siempre después del plano continuo.

## Música

Con `musica` en `guion.js`, al terminar la carga aparecen dos botones: **Entrar con sonido**
y **Entrar sin sonido**. Los navegadores no dejan sonar audio sin un clic del visitante, y
esa es la forma elegante de pedirlo. La música entra subiendo de a poco, se repite en bucle,
se pausa sola si el visitante cambia de pestaña y tiene un botón flotante (las barritas
abajo a la derecha) para silenciarla.

La pista sale de Pixabay y se deja liviana con `cuadros.mjs musica` (ver `higgsfield.md`,
sección "Música libre de derechos"). Si el usuario quiere darle crédito al autor, va en el
pie de la página; Pixabay no lo exige.

## Colores y tipografía

Todo se cambia en las variables del inicio de `estilos.css`: `--fondo`, `--texto`,
`--acento` (kicker, barra de progreso, unidades), `--fuente-titulos` y `--fuente-texto`.
Si cambias de fuente, cambia también el link de Google Fonts del `<head>` de `index.html`.

Reglas de diseño que funcionan:
- Fondo casi negro: los videos se ven más ricos y los textos claros se leen sobre cualquier
  cuadro.
- Un solo color de acento, sacado del protagonista (el rojo del auto, el ámbar del perfume).
- Títulos en una fuente condensada y gruesa; texto corrido en una sans limpia.

## Celular

- El motor usa los cuadros de la carpeta `-movil` (720 px) en pantallas de menos de 800 px.
- En vertical, el video se ajusta al ancho y se amplía (`zoomVertical`, 1,45 por defecto)
  para que el protagonista no quede chico. Si se corta mucho, bájalo a 1,2.
- El índice de capítulos se oculta.

## Peso

Meta: **menos de 25 MB en total en escritorio y 10 MB en celular**, sabiendo que se carga por
partes. Si te pasas:
1. Baja los cuadros por segundo: `--fps 10` en vez de 12.
2. Recorta los segundos que no aportan.
3. Revisa que ningún video tenga más de 130 cuadros.

## Seguridad que trae la plantilla

- CSP en el `<meta>` y en `vercel.json`: solo scripts y archivos propios, más Google Fonts.
  Por eso **nada de `style="..."` en el HTML** (el CSP lo bloquea); los estilos van en
  `estilos.css`.
- `form-action 'none'`: no hay formularios que manden datos.
- Links externos con `target="_blank" rel="noopener noreferrer"`.
- Si el usuario pide agregar algo de otro dominio (un video de YouTube, un widget de chat),
  hay que sumarlo al CSP de los dos lugares, y explicarle que eso abre la página a ese
  dominio.
