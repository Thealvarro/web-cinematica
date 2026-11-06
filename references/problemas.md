# Problemas y cómo se resuelven

## En los videos

| Qué pasa | Por qué | Solución |
|---|---|---|
| Algo se abre de una forma que no corresponde (puerta hacia arriba en un auto clásico) | El prompt no describió la mecánica | Describe bisagra, dirección y forma, y prohíbe las alternativas. Antes, prueba recortar el video antes de que pase |
| El protagonista se deforma o se estira | Pediste demasiado movimiento o dos acciones a la vez | Una acción por video, `rigid, keeps its exact shape, no morphing` |
| Cambia el color o un detalle entre videos | La descripción del protagonista no es idéntica en todos los prompts | Copia la misma frase de diseño en todos |
| Aparecen letras, logos o personas | No los prohibiste | `no text, no logos, no people` al final del prompt |
| El video termina en un cuadro negro o con un fundido | Algunos modelos cierran así | Recorta los últimos 0,2 s con `--hasta` y saca el último cuadro desde ese punto |
| El salto entre dos videos se nota | El segundo no partió del último cuadro del primero | Regenera con `--inicio` = último cuadro del primero, o usa `--final` en el primero |
| Leve cambio de color en el empalme | Cada generación ajusta un poco la luz | Si es leve, se tolera: al pasar rápido no se nota. Si no, recorta unos cuadros del inicio del segundo video |

## En la página

| Qué pasa | Por qué | Solución |
|---|---|---|
| "Sigo viendo la versión anterior" | El navegador guardó la página vieja | Recarga forzada: Cmd+Shift+R en Mac, Ctrl+Shift+R en Windows |
| La escena queda negra | Faltan cuadros o el nombre de la carpeta no calza con `guion.js` | Revisa que `assets/cuadros/<nombre>/001.jpg` exista |
| Error en la consola "guion.js no tiene la escena" | El `data-escena` del HTML no está en `guion.js` | Usa el mismo nombre en los dos |
| Los textos no aparecen | Los rangos `data-desde`/`data-hasta` no calzan, o falta la clase `beat` | Revisa los números (0 a 1.01) |
| El video va muy rápido o muy lento | El `alto` de la escena no calza con la duración | ~100 de alto por cada 2 a 3 segundos de video |
| La música no suena | Los navegadores bloquean audio sin clic | Es normal: suena al apretar Entrar con sonido o el botón de barritas |
| Una fuente o imagen no carga en producción | El CSP la bloquea porque viene de otro dominio | Súbela a `assets/` o agrega el dominio al CSP del `<meta>` y de `vercel.json` |
| En el celular el protagonista se ve cortado | `zoomVertical` muy alto | Bájalo a 1,2 en `guion.js` |
| La página pesa mucho | Muchos cuadros por segundo | `--fps 10` y recortar lo que sobra |

## En la instalación

| Qué pasa | Solución |
|---|---|
| `node: command not found` | Instalar Node.js LTS desde https://nodejs.org y reiniciar Claude |
| El script no logra bajar ffmpeg | Revisar internet. Como alternativa: en Mac `brew install ffmpeg`, en Windows `winget install ffmpeg` |
| "Todavía no hay claves" | Correr `higgsfield.mjs configurar` y que pegue sus claves (ver `higgsfield.md`, paso 3) |
| "Higgsfield rechazó las claves" | Copiarlas de nuevo sin espacios; si siguen fallando, crear unas nuevas en open.higgsfield.ai |
| "No hay saldo suficiente" | Cargar saldo en open.higgsfield.ai, sección Billing. El saldo del plan de la web no sirve para la API |
| `loadEnvFile is not a function` | Node.js muy antiguo: instalar la versión LTS desde nodejs.org |
