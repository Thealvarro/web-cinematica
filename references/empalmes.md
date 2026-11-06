# Empalmes: que varios videos se vean como uno solo

Este es el secreto de la técnica. Higgsfield genera videos de 5 segundos; la página necesita
un plano largo sin cortes. Se logra encadenando videos de modo que **el último cuadro de uno
sea el primer cuadro del siguiente.**

## Las cuatro herramientas

### 1. Partir del último cuadro (la base)

Cada video nuevo parte del último cuadro del anterior:

```
node <skill>/scripts/cuadros.mjs ultimo fuentes/01-giro.mp4 fuentes/01-giro-fin.png
node <skill>/scripts/higgsfield.mjs cotizar video --prompt "..." --inicio fuentes/01-giro-fin.png
```

El script sube la imagen solo. El empalme queda exacto.

### 2. Llegar a un cuadro exacto (`--final`)

El modelo de video acepta también un cuadro final (`--final imagen.png`). Sirve cuando el
video tiene que **terminar** en una imagen que ya existe, por ejemplo para empalmar con un
video que ya tienes. Pásale las dos imágenes y describe el movimiento entre ellas.

Ojo: si las dos imágenes están muy lejos (distinto lugar, distinta posición y distinta luz),
el modelo inventa un camino raro. Funciona bien con diferencias de una sola cosa a la vez.

### 3. Reproducir al revés (gratis)

El motor de la página puede reproducir cualquier video hacia atrás (`alReves: true` en
`guion.js`). Eso ahorra generaciones:

- Una puerta que **se abre** al revés es una puerta que **se cierra**.
- Una cámara que **entra** al auto al revés es una cámara que **sale**.
- Una cámara que **se acerca** al revés es una que **se aleja**.

En el Halcón, los videos "se abre la puerta" y "la cámara entra hasta el tablero" se usaron
al revés para contar "partimos en el tablero, salimos y la puerta se cierra". Cero gasto
extra.

**Cuidado:** al revés también se invierte todo lo que se mueve solo. Humo que sube pasa a
bajar, agua que cae pasa a subir, autos que avanzan pasan a retroceder. Úsalo con escenas
donde lo único que se mueve es la cámara o un objeto mecánico.

### 4. Recortar (gratis)

Si un video tiene una buena primera mitad y una segunda mitad mala, usa solo lo bueno:

```
node <skill>/scripts/cuadros.mjs secuencia fuentes/video.mp4 escena-2 --hasta 2.5
```

En el Halcón, el primer video de la puerta abría la puerta del conductor bien, pero a los 3
segundos la puerta del otro lado se abría hacia arriba (tipo ala de gaviota). Recortando en
2,5 segundos quedó perfecto sin regenerar.

## Lo que NO funciona

- **Ida y vuelta.** Usar un giro hacia adelante y después el mismo giro al revés para volver
  a la posición inicial. Técnicamente empalma, pero el visitante ve el auto girar a un lado
  y después al otro, y se siente raro. Pasó en el Halcón y hubo que cambiarlo.
- **Fundir dos videos con el protagonista en distinta posición.** Durante el fundido se ven
  dos autos superpuestos. Solo funde si la posición es casi idéntica.
- **Saltar de lugar entre dos videos.** Del estudio a la playa no se pasa con un corte.
  Se pasa **dentro** de un video, con un movimiento que lo justifique: la pared del estudio
  se corre, la cámara atraviesa una ventana, una ola cubre la pantalla, el auto arranca y el
  fondo cambia mientras la cámara lo acompaña.
- **Volver a la imagen maestra en medio del plano.** Si un video termina de perfil y el
  siguiente necesita el producto de frente, no se "resetea": se genera un video que haga
  el camino, o se rediseña el orden para no necesitarlo.

## Revisar el guion antes de gastar

Para cada empalme de la tabla de la etapa 2, contesta:

1. ¿El video B parte del último cuadro del video A? Si no, ¿por qué no?
2. ¿Hay algún tramo que vuelva sobre un movimiento anterior? Si lo hay, cámbialo.
3. ¿Algún video se puede reemplazar por uno existente al revés?
4. ¿Algún cambio de lugar ocurre entre dos videos en vez de dentro de uno?

Si una respuesta da problema, arréglalo en la tabla antes de mostrársela al usuario.
