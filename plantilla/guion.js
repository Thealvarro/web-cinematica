// guion.js: lo único que se edita para armar una página nueva.
// Cada escena del HTML (data-escena="nombre") tiene acá su lista de tramos.

window.GUION = {
  // Cuántos cuadros tiene cada secuencia. Los anota solo el script cuadros.mjs.
  secuencias: {
    'escena-1': 60,
    'escena-2': 60,
    'escena-3': 60,
  },

  escenas: {
    // Escena corta de apertura: un solo video que avanza con el scroll.
    apertura: {
      alto: 320, // cuánto hay que bajar, en altos de pantalla (vh). Más alto = más lento.
      tramos: [{ seq: 'escena-1', peso: 1 }],
    },

    // Escena larga: varios videos encadenados en un solo plano, sin cortes.
    // peso: qué parte del recorrido le toca a cada tramo.
    // alReves: true reproduce ese video hacia atrás (sirve para "deshacer" un movimiento).
    relato: {
      alto: 900,
      tramos: [
        { seq: 'escena-2', peso: 1 },
        { seq: 'escena-3', peso: 1 },
      ],
    },
  },

  // Música opcional. Para una página sin música: musica: null
  musica: {
    archivo: 'assets/musica.mp3',
    volumen: 0.6,
  },

  // Dónde están los cuadros. Solo se cambia si la página vive en una subcarpeta del sitio,
  // por ejemplo '/mi-demo/assets/cuadros'.
  rutaCuadros: 'assets/cuadros',

  fondo: '#09090a',    // color detrás de los cuadros mientras cargan
  zoomVertical: 1.45,  // en celular, cuánto se amplía el video para que el sujeto se vea grande
  suavizado: 0.16,     // 0.08 = más cinematográfico, 0.3 = más pegado al dedo
};
