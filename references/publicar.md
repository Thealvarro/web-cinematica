# Revisar y publicar

## Antes de publicar

Revisa tú lo técnico y pásale al usuario lo visual, en este orden:

**Lo revisas tú:**
- [ ] Cada carpeta de `assets/cuadros/` tiene la misma cantidad de cuadros que dice
      `guion.js`, y su versión `-movil` también.
- [ ] Cada `data-escena` del HTML existe en `guion.js` y al revés.
- [ ] No hay `style="..."` en el HTML.
- [ ] Todos los links externos llevan `target="_blank" rel="noopener noreferrer"`.
- [ ] El botón final lleva a un destino real (WhatsApp con el número correcto, la agenda,
      la tienda).
- [ ] `<title>` y `<meta name="description">` dicen algo concreto, no lo de la plantilla.
- [ ] Peso total de `assets/` (sin `fuentes/`) dentro de la meta de `pagina.md`.
- [ ] Ningún texto dice "MARCA", "Título corto" ni otros restos de la plantilla.

**Se lo pides al usuario, en el computador y en el celular:**
- [ ] Al bajar, ¿el movimiento se siente continuo? ¿Hay algún salto?
- [ ] ¿Los textos aparecen en el momento justo y se leen bien?
- [ ] ¿La música entra bien con el botón y se puede silenciar?
- [ ] ¿El botón final funciona?

Para que lo vea en el celular antes de publicar, lo más simple es publicar primero una
versión de prueba en Vercel (ver abajo) y mandarle ese link.

## Publicar en Vercel

Vercel es gratis para este tipo de páginas. Hay dos caminos; elige según lo que tenga el
usuario.

### Camino A: desde Claude, sin GitHub (el más simple)

1. Desde la carpeta del proyecto corre `npx vercel@latest`. La primera vez abre el navegador
   para que el usuario inicie sesión o cree su cuenta (con su correo o con GitHub). Eso lo
   hace él.
2. Responde las preguntas: proyecto nuevo, nombre en minúsculas, sin framework
   ("Other"), sin comando de build, carpeta de salida `.` (la raíz).
3. Antes, crea un archivo `.vercelignore` con `fuentes/` adentro para no subir los videos
   originales.
4. El primer resultado es una versión de prueba. Cuando el usuario la apruebe:
   `npx vercel@latest --prod`.

### Camino B: con GitHub (si va a seguir haciendo cambios)

1. Crea el repositorio con `fuentes/` y `scripts/node_modules/` en el `.gitignore`.
2. Pídele que entre a https://vercel.com/new, elija el repositorio y aprete Deploy.
3. Desde ahí, cada cambio que se suba a GitHub se publica solo.

## Dominio propio

En Vercel: el proyecto → Settings → Domains → agregar el dominio. Vercel le muestra qué
registros poner donde compró el dominio (NIC Chile, GoDaddy, etc.). Puede tardar unas horas.

## Después de publicar

- Abre el link tú y confirma que carga la portada y la primera escena.
- Revisa que las cabeceras lleguen: `curl -sI <link> | grep -i content-security-policy`.
- **Ojo con el caché:** `vercel.json` le dice al navegador que guarde `assets/` por un año.
  Si después cambias los cuadros de un video, **usa un nombre de carpeta nuevo** (por
  ejemplo `costa-v2`) y actualiza `guion.js`; si no, los visitantes que ya entraron seguirán
  viendo los cuadros viejos.
