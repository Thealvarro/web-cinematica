# Ejemplo completo: ORVEN Halcón

Página de demostración de un auto ficticio: un fastback de 1967 que vuelve en 2026 como
eléctrico. Marca, auto, cifras y precios son inventados.

## La historia final

1. **Encendido** (escena aparte): estudio a oscuras, entra la neblina, se encienden los focos.
   *Algunas formas no pasan de moda.*
2. **1967** (sección quieta): foto en sepia, el taller de Valparaíso.
3. **Plano continuo:**
   - En el tablero iluminado. *Luz de ambiente al ritmo del motor.*
   - La cámara sale de la cabina. *Un tablero que despierta contigo. Cuero negro, costura roja.*
   - La puerta se cierra. *Ahora, ciérralo.*
   - Giro hasta el perfil. *Capó largo. Techo que cae. El detalle.*
   - El auto arranca, la pared del estudio se corre y aparece la costa. *Clásico por fuera.
     Hecho para la costa.*
4. **Cifras y modelos** (secciones quietas, al final).
5. **Cierre:** *Reserva el tuyo.*

## La imagen maestra

```
Cinematic studio photo of a fictional 1967-style fastback muscle car called "Halcón", deep
red paint, long hood, sloped fastback roof, chrome front bumper, round headlights, original
custom grille with a minimalist falcon-wing emblem, no real brand logos, polished
five-spoke modern wheels, three-quarter front view, soft gray seamless studio backdrop,
dramatic softbox lighting, photorealistic, 8k, automotive advertising
```

## Los videos (todos de 5 s, calidad pro, sin sonido)

| # | Parte de | Prompt (resumen) | Uso en la página |
|---|---|---|---|
| 1 | Imagen maestra | Luces que bajan, neblina, se encienden los focos | Escena de apertura |
| 2 | Imagen maestra | Se abre la puerta del conductor (bisagra delantera) | Recortado a 2,5 s, **al revés** |
| 3 | Último cuadro del 2 | La cámara entra por la puerta hasta el tablero | **Al revés** |
| 4 | Imagen maestra | Órbita del frente tres cuartos al perfil | Hacia adelante |
| 5 | Último cuadro del 4 | El auto arranca, el estudio se transforma en la costa | Hacia adelante, cierre del plano |

Los videos 2 y 3 se unieron en una sola secuencia (`interior`, 116 cuadros) y se
reproducen al revés: así la historia parte en el tablero y termina con la puerta cerrada en
la misma posición de la imagen maestra, que es justo donde parte el video 4. **Empalme
perfecto sin generar nada extra.**

### Prompt del video 2 (la puerta)

```
Locked-off static camera, no camera movement. Only the driver door facing the camera opens:
a conventional front-hinged car door that swings horizontally outward to the side on its
front hinges, like a classic 1967 coupe door, rigid metal panel that keeps its exact shape.
The far side door stays closed. No gull-wing, no scissor doors, no upward-opening doors, no
door deformation, no morphing. As the door opens it reveals a modern black leather interior
with red stitching and a softly glowing digital dashboard, soft red ambient interior light
fades on. Car body, wheels, paint and studio lighting unchanged, photorealistic automotive
commercial, no text
```

### Prompt del video 3 (entrar a la cabina)

```
Smooth cinematic dolly: the camera glides forward and enters the car through the open
driver door into the cabin, ending on the dashboard. Modern black leather seats with red
stitching, a minimalist glowing digital instrument cluster and center screen, soft red
ambient lighting. The car body does not change, the door stays open and keeps its shape,
photorealistic automotive commercial, no text, no logos
```

### Prompt del video 5 (del estudio a la costa)

```
The red fastback car starts driving forward to the right. The camera tracks alongside the
car at the same speed, keeping it in a clean side profile in the center of the frame. The
grey studio background smoothly transforms into a coastal highway at golden sunset, with
the ocean and the low sun behind the car and the road rushing under the wheels. The wheels
spin, the doors stay closed, and the car keeps its exact design: deep red paint, black
stripe on the hood, chrome bumpers, five-spoke silver wheels. Photorealistic, cinematic,
smooth continuous motion, no text, no people, no other cars.
```

## El guion

```js
relato: {
  alto: 1200,
  tramos: [
    { seq: 'interior', peso: 520, alReves: true },
    { seq: 'giro', peso: 340 },
    { seq: 'costa', peso: 440 },
  ],
},
```

## Lo que salió mal y cómo se arregló

1. **La puerta se abrió hacia arriba.** El primer prompt decía "both doors open". El modelo
   abrió la puerta lejana tipo ala de gaviota, que no corresponde a un auto de 1967. Un
   prompt más estricto estiró la puerta. **Solución:** recortar el primer video en 2,5 s,
   antes de que apareciera la puerta lejana. Gratis.
2. **Dos secciones para una sola acción.** En la primera versión, "se abre la puerta" y
   "entra a la cabina" eran secciones separadas, y al bajar se veía cómo una reemplazaba a
   la otra. **Solución:** unir las dos secuencias en una sola escena. Partían del mismo
   cuadro, así que empalmaron perfecto.
3. **Giro de ida y vuelta.** Para llegar a la carretera (que partía con el auto de frente)
   se probó girar hasta el perfil y volver. Se veía raro. **Solución:** generar el video 5,
   que parte del perfil y lleva el auto a la costa dentro del mismo plano.

## Costo total

Imagen maestra con sus variantes y 7 videos (5 en la versión final, 1 descartado y 1 que quedó solo en la primera versión): unos US$4,30 en total.
