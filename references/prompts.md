# Prompts

Los prompts van **en inglés**: los modelos los entienden mejor. Al usuario se los explicas en
español, en una línea, antes de cotizar.

## Reglas para todos

1. **Describe el protagonista igual en todos los prompts.** Copia la misma frase de diseño
   (color, piezas distintivas, materiales) en cada video. Si un prompt dice "red car" y otro
   "deep red fastback with black hood stripe", el modelo los trata distinto.
2. **Una sola acción por video.** "Se abre la puerta" o "la cámara gira", no las dos.
3. **Di qué se mueve y qué no.** Si solo se mueve la cámara: `the car stays perfectly still`.
   Si solo se mueve el objeto: `locked-off static camera, no camera movement`.
4. **Nombra lo que no quieres, en concreto.** No sirve `no errors`. Sirve `no gull-wing
   doors, no door deformation, no morphing`.
5. **Siempre al final:** `photorealistic, no text, no logos` (más `no people` si no hay
   personas).
6. **Sin marcas reales.** Ni en el prompt ni pidiendo "estilo Ferrari". Describe las formas.

## Imagen maestra

```
Cinematic studio photo of [PROTAGONISTA CON DISEÑO DETALLADO], [ÁNGULO: three-quarter front
view], [FONDO: soft gray seamless studio backdrop], [LUZ: dramatic softbox lighting],
photorealistic, 8k, [RUBRO] advertising, no real brand logos, no text
```

- El ángulo tres cuartos de frente es el más versátil: desde ahí se puede girar, acercar o
  entrar.
- Fondo de estudio liso: los videos se empalman mejor y el texto se lee mejor encima.
- Si el producto existe, usa su foto como referencia y pide `the exact same [producto] from
  the reference image, identical design`.

## Plantillas por tipo de toma (videos)

### Encendido o revelación (apertura)
```
Locked-off static camera. The studio lights slowly dim to near darkness, thick low fog rolls
across the floor around the [PROTAGONISTA], then [LUCES DEL PROTAGONISTA] ignite and cut
bright beams through the fog. [PROTAGONISTA] shape, color and position unchanged. Moody
cinematic commercial, photorealistic, no text
```

### Giro alrededor (mostrar la forma)
```
Smooth slow cinematic orbit: the camera arcs around the [PROTAGONISTA] from the [ÁNGULO
INICIAL] to a [ÁNGULO FINAL: full side profile], revealing [DETALLES DE FORMA]. The
[PROTAGONISTA] stays perfectly still, [FONDO], [LUZ], photorealistic commercial, no text
```

### Algo que se abre (puerta, tapa, ventana, caja)
```
Locked-off static camera, no camera movement. Only the [PIEZA] opens: [CÓMO SE ABRE CON
DETALLE MECÁNICO, por ejemplo: a conventional front-hinged door that swings horizontally
outward on its front hinges], rigid panel that keeps its exact shape. [LO QUE NO SE ABRE]
stays closed. No [FORMAS DE ABRIR EQUIVOCADAS], no deformation, no morphing. As it opens it
reveals [INTERIOR]. Everything else unchanged, photorealistic commercial, no text
```

**Clave:** describe la mecánica. "The doors open" hizo que el modelo abriera una puerta hacia
arriba en un auto clásico. Hubo que decir bisagra delantera, apertura horizontal y prohibir
las alternativas.

### Entrar (la cámara se mete)
```
Smooth cinematic dolly: the camera glides forward and enters the [PROTAGONISTA] through the
[ABERTURA] into the [INTERIOR], ending on [DETALLE FINAL]. [DESCRIPCIÓN DEL INTERIOR]. The
[PROTAGONISTA] does not change, the [ABERTURA] stays open and keeps its shape,
photorealistic commercial, no text, no logos
```
Al revés, esta misma toma es "la cámara sale".

### Cambio de lugar dentro del mismo plano
```
The [PROTAGONISTA] starts [MOVIMIENTO: driving forward to the right]. The camera tracks
alongside at the same speed, keeping it in [ENCUADRE] in the center of the frame. The
[FONDO ACTUAL] smoothly transforms into [NUEVO LUGAR CON LUZ Y HORA], with [ELEMENTOS DEL
NUEVO LUGAR]. [LO QUE NO CAMBIA], and the [PROTAGONISTA] keeps its exact design: [DISEÑO
DETALLADO]. Photorealistic, cinematic, smooth continuous motion, no text, no people
```
En el Halcón, este prompt hizo que la pared del estudio se corriera y apareciera la costa. Es
la forma de pasar de un lugar a otro sin cortar.

### Acercamiento a un detalle
```
Slow cinematic push-in: the camera moves closer to the [DETALLE] of the [PROTAGONISTA]
until it fills the frame, shallow depth of field, [LUZ]. The [PROTAGONISTA] stays perfectly
still, photorealistic macro commercial, no text
```

### Destino (el protagonista en su mundo)
```
The [PROTAGONISTA] [ACCIÓN EN EL LUGAR] at [HORA Y LUZ], the camera [MOVIMIENTO: tracks
smoothly alongside], [ELEMENTOS DEL LUGAR], [LO QUE NO CAMBIA], cinematic commercial,
photorealistic, no text
```

## Si el resultado no sirve

Antes de reescribir el prompt, mira si **recortar** el video resuelve el problema. Si hay
que regenerar, cambia **una sola cosa** del prompt (la que falló) y explícale al usuario qué
cambiaste y por qué. Ver `problemas.md`.
