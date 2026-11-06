# web-cinematica

**Una skill gratis para Claude Code que te arma una página web que avanza con el scroll como
si fuera una película.** El visitante baja y el video avanza al ritmo de su dedo: las escenas
se encadenan sin cortes y los textos aparecen en el momento justo. Es la técnica de las
páginas de producto de Apple, hecha con videos que generas con IA en Higgsfield.

No necesitas saber programar. La skill te guía paso a paso, de a una pregunta, desde crear
tu cuenta hasta tener la página publicada.

![Demo del Halcón, un auto ficticio](docs/demo-halcon.jpg)

**Mira la demo:** https://alvarocofre.dev/demo-scrolly-telling
**Guía completa en español:** https://alvarocofre.dev/web-cinematica

---

## Qué puedes hacer con ella

Una página para lo que quieras mostrar, mientras haya un protagonista que se vea en todas
las escenas:

- Un **producto**: una botella de perfume que gira, una zapatilla que se arma pieza por pieza.
- Un **auto o una moto**: desde el tablero hasta la carretera, como en la demo.
- Una **casa o un departamento**: la cámara entra por la puerta y recorre cada pieza.
- Un **restaurante**: del ingrediente al plato servido.
- Una **marca o un lugar**: lo que tú quieras contar.

## Qué hace la skill por ti

1. **Te ayuda a armar la historia** en 4 a 6 momentos, como un solo plano de cámara.
2. **Escribe los prompts** de la imagen principal y de cada video.
3. **Genera las imágenes y los videos** en Higgsfield, mostrándote el costo antes de cada uno.
4. **Empalma los videos** para que se vean como uno solo, sin cortes.
5. **Te ayuda a elegir música** libre de derechos.
6. **Arma la página** con una plantilla lista, que en el celular usa imágenes más livianas.
7. **La publica en Vercel**, gratis, con la seguridad ya configurada.

## Qué necesitas

| Qué | Para qué | Cuánto cuesta |
|---|---|---|
| [Claude Code](https://alvarocofre.dev/instalar-claude-code) | Es el Claude que trabaja en tu computador. En el chat normal no funciona | Viene con tu plan de Claude |
| [Node.js](https://nodejs.org) (versión LTS) | Lo usan las herramientas de la skill | Gratis |
| Cuenta de API en [Higgsfield](https://open.higgsfield.ai) | Para generar las imágenes y los videos | Cargas saldo una vez, mínimo US$5. Una página sale entre US$3 y US$5 |
| Cuenta en [Vercel](https://vercel.com) | Para publicar la página | Gratis |

**Ojo:** la cuenta de API de Higgsfield es distinta a los planes de su web. Acá no pagas una
mensualidad: cargas saldo y se descuenta solo lo que generas. La skill te guía para crearla.

## Cómo se instala, con un solo mensaje

Abre Claude Code, copia este mensaje y pégalo:

```
Instala la skill web-cinematica en mi computador: https://github.com/Thealvarro/web-cinematica

Descárgala en la carpeta de skills de Claude Code: en Mac o Linux es ~/.claude/skills/web-cinematica y en Windows es %USERPROFILE%\.claude\skills\web-cinematica. Si no tengo git, bájala como ZIP y descomprímela ahí. Hazlo tú de principio a fin, yo no sé de programación. Revisa también que tenga Node.js versión 20.12 o más nueva; si no lo tengo, dime exactamente cómo instalarlo, de a un paso. Cuando termines, avísame si tengo que cerrar y volver a abrir Claude.
```

## Cómo se usa

Ya instalada, escribe en Claude Code:

```
/web-cinematica Quiero una página para [lo que quieres mostrar]. Guíame paso a paso.
```

La skill parte revisando que tengas todo, te explica la seguridad y te hace las preguntas
de a una.

## Seguridad

- **Tus claves de Higgsfield nunca van en la página.** Quedan en un archivo privado de tu
  computador (`~/.web-cinematica/higgsfield.env`), fuera de la carpeta de la página. Nunca las
  pegues en el chat.
- **El gasto lo controlas tú:** solo se gasta el saldo que cargaste, la skill respeta un tope
  mensual que tú fijas y te muestra el precio antes de cada generación.
- **La página es estática:** no tiene base de datos ni formularios que se puedan atacar, y
  trae una política de seguridad que impide cargar código de otros sitios.

## Qué trae este repositorio

```
SKILL.md          Las instrucciones que sigue Claude, en 8 etapas
references/       Guías detalladas: historia, prompts, empalmes, Higgsfield, plantilla, publicar
plantilla/        La página base que se copia y se completa
scripts/
  higgsfield.mjs  Cotiza y genera imágenes y videos por la API de Higgsfield
  cuadros.mjs     Convierte los videos en cuadros y deja liviana la música
```

## Cómo funciona por dentro

Cada video se convierte en unas 60 imágenes. Mientras el visitante baja, la página dibuja la
imagen que corresponde a cuánto bajó, como un libro animado que se pasa con el dedo. Por eso
el movimiento sigue exacto al scroll, hacia adelante y hacia atrás, también en Safari y en el
celular, donde adelantar un video directo se traba.

Para que varios videos se vean como uno solo, cada video nuevo parte del último cuadro del
anterior. Y un video reproducido al revés sirve gratis como otro movimiento: una puerta que
se abre, al revés, es una puerta que se cierra.

## Autor

Hecha por [Álvaro Cofré](https://alvarocofre.dev). Si la usas para algo, me encantaría verlo.

Licencia MIT: úsala libremente, también para tus clientes.
