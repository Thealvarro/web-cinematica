// Motor de web-cinematica. No hace falta tocar este archivo:
// todo lo que cambia de una página a otra vive en guion.js.

const G = window.GUION;
const limitar = (n) => Math.min(1, Math.max(0, n));
const dpr = Math.min(window.devicePixelRatio || 1, 2);
const esMovil = () => window.innerWidth < 800;

// ---------- Secuencias de cuadros (se comparten entre tramos) ----------
const secuencias = {};

function secuencia(nombre) {
  if (!secuencias[nombre]) {
    const total = G.secuencias[nombre];
    if (!total) throw new Error(`guion.js no declara la secuencia "${nombre}"`);
    secuencias[nombre] = { nombre, total, cuadros: [], cargando: false };
  }
  return secuencias[nombre];
}

function cargar(nombre, alCargar) {
  const s = secuencia(nombre);
  if (s.cargando) return;
  s.cargando = true;
  // En celular se usan los cuadros chicos, que pesan cerca de un tercio
  const carpeta = esMovil() ? `${nombre}-movil` : nombre;
  for (let i = 0; i < s.total; i++) {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      escenas.forEach((e) => { e.dibujado = null; });
      if (alCargar) alCargar();
    };
    img.src = `${G.rutaCuadros || 'assets/cuadros'}/${carpeta}/${String(i + 1).padStart(3, '0')}.jpg`;
    s.cuadros[i] = img;
  }
}

const listo = (img) => img && img.complete && img.naturalWidth > 0;

// El cuadro pedido o el más cercano que ya esté cargado
function cuadro(nombre, i) {
  const s = secuencia(nombre);
  for (let d = 0; d < s.total; d++) {
    if (listo(s.cuadros[i - d])) return s.cuadros[i - d];
    if (listo(s.cuadros[i + d])) return s.cuadros[i + d];
  }
  return null;
}

// ---------- Escenas ----------
const escenas = [...document.querySelectorAll('[data-escena]')].map((sec) => {
  const config = G.escenas[sec.dataset.escena];
  if (!config) throw new Error(`guion.js no tiene la escena "${sec.dataset.escena}"`);
  const tramos = config.tramos.map((t) => ({ ...t }));
  const suma = tramos.reduce((n, t) => n + t.peso, 0);
  let acum = 0;
  for (const t of tramos) {
    t.ini = acum / suma;
    acum += t.peso;
    t.fin = acum / suma;
  }
  sec.style.setProperty('--alto', `${config.alto}vh`);
  const canvas = sec.querySelector('canvas');
  return {
    sec,
    canvas,
    ctx: canvas.getContext('2d'),
    tramos,
    nombres: [...new Set(tramos.map((t) => t.seq))],
    dibujado: null,
    p: 0,
    beats: [...sec.querySelectorAll('[data-desde]')],
  };
});

function ajustarCanvas(e) {
  const { clientWidth: w, clientHeight: h } = e.canvas;
  e.canvas.width = Math.round(w * dpr);
  e.canvas.height = Math.round(h * dpr);
  e.dibujado = null;
}

function pintar(e, img) {
  const cw = e.canvas.width;
  const ch = e.canvas.height;
  // Horizontal: la imagen cubre la pantalla. Vertical: se ve el sujeto completo, algo ampliado.
  const escala = cw / ch < 1
    ? (cw / img.naturalWidth) * (G.zoomVertical || 1.45)
    : Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
  const w = img.naturalWidth * escala;
  const h = img.naturalHeight * escala;
  e.ctx.fillStyle = G.fondo || '#000';
  e.ctx.fillRect(0, 0, cw, ch);
  e.ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
}

function dibujar(e) {
  const t = e.tramos.find((x) => e.p <= x.fin) || e.tramos[e.tramos.length - 1];
  const local = limitar((e.p - t.ini) / (t.fin - t.ini));
  const total = secuencia(t.seq).total;
  let i = Math.round(local * (total - 1));
  if (t.alReves) i = total - 1 - i;
  const clave = `${t.seq}:${i}`;
  if (clave === e.dibujado) return;
  const img = cuadro(t.seq, i);
  if (!img) return;
  pintar(e, img);
  // Si se dibujó un cuadro vecino porque el pedido no ha llegado, se reintenta
  e.dibujado = img === secuencia(t.seq).cuadros[i] ? clave : null;
}

// Marcas invisibles para saltar a un capítulo que está dentro de una escena larga
function ubicarAnclas() {
  document.querySelectorAll('.ancla[data-en]').forEach((a) => {
    const sec = a.closest('[data-escena]');
    const recorrido = sec.offsetHeight - window.innerHeight;
    a.style.setProperty('top', `${Number(a.dataset.en) * recorrido}px`);
  });
}

function alRedimensionar() {
  escenas.forEach(ajustarCanvas);
  ubicarAnclas();
}
alRedimensionar();
window.addEventListener('resize', alRedimensionar);

// ---------- Carga ----------
// La primera escena se carga al tiro; el resto, cuando se acerca a la pantalla.
const primera = escenas[0];
const vigia = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((ent) => {
      if (!ent.isIntersecting) return;
      escenas.find((x) => x.sec === ent.target).nombres.forEach((n) => cargar(n));
      vigia.unobserve(ent.target);
    });
  },
  { rootMargin: '150% 0px' }
);
escenas.slice(1).forEach((e) => vigia.observe(e.sec));

const cargador = document.getElementById('cargador');
const avance = document.getElementById('cargador-avance');
const entradaConSonido = document.getElementById('entrar-con-sonido');
const totalPrimera = primera.nombres.reduce((n, s) => n + secuencia(s).total, 0);
let cargados = 0;

function cargaLista() {
  // Con música, el visitante entra con un clic (los navegadores no dejan sonar audio sin uno)
  if (G.musica && entradaConSonido) cargador.classList.add('elegir');
  else cargador.classList.add('listo');
}
primera.nombres.forEach((n) => cargar(n, () => {
  cargados++;
  avance.style.width = `${(cargados / totalPrimera) * 100}%`;
  if (cargados === totalPrimera) cargaLista();
}));
setTimeout(cargaLista, 7000); // nadie se queda mirando un cargador eterno

// ---------- Música ----------
const botonSonido = document.getElementById('sonido');
let audio = null;
let fundidoActual = 0;
let sonando = false;

function fundirVolumen(destino, ms = 1200) {
  // Cada fundido nuevo anula al anterior, para que dos clics rápidos no corten la música
  const id = ++fundidoActual;
  const inicio = audio.volume;
  const t0 = performance.now();
  const paso = (t) => {
    if (id !== fundidoActual) return;
    const k = limitar((t - t0) / ms);
    audio.volume = inicio + (destino - inicio) * k;
    if (k < 1) requestAnimationFrame(paso);
    else if (destino === 0) audio.pause();
  };
  requestAnimationFrame(paso);
}

function sonar(si) {
  if (!audio) return;
  sonando = si;
  botonSonido.setAttribute('aria-pressed', String(si));
  botonSonido.classList.toggle('activo', si);
  if (si) {
    audio.play().then(() => fundirVolumen(G.musica.volumen ?? 0.6)).catch(() => {});
  } else {
    fundirVolumen(0, 500);
  }
}

if (G.musica && botonSonido) {
  audio = new Audio(G.musica.archivo);
  audio.loop = true;
  audio.volume = 0;
  audio.preload = 'none';
  botonSonido.hidden = false;
  botonSonido.addEventListener('click', () => sonar(!sonando));
  entradaConSonido.addEventListener('click', () => {
    cargador.classList.add('listo');
    sonar(true);
  });
  document.getElementById('entrar-sin-sonido').addEventListener('click', () => {
    cargador.classList.add('listo');
  });
  // Si el visitante cambia de pestaña, la música se pausa y vuelve al regresar
  let sonabaAntes = false;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      sonabaAntes = sonando;
      audio.pause();
    } else if (sonabaAntes && sonando) {
      audio.play().catch(() => {});
    }
  });
}

// ---------- Bucle de animación ----------
const conParallax = [...document.querySelectorAll('[data-p]')];
const progreso = document.getElementById('progreso');
const marcas = [...document.querySelectorAll('[data-capitulo]')];
const enlaces = [...document.querySelectorAll('.capitulos a')];
let capituloActivo = null;

function cuadroAnimacion() {
  const vh = window.innerHeight;

  for (const e of escenas) {
    const r = e.sec.getBoundingClientRect();
    if (r.bottom < -vh || r.top > vh * 2) continue;
    const objetivo = limitar(-r.top / (r.height - vh));
    // Suavizado: el cuadro persigue al scroll en vez de saltar
    e.p += (objetivo - e.p) * (G.suavizado || 0.16);
    if (Math.abs(objetivo - e.p) < 0.0005) e.p = objetivo;
    e.sec.style.setProperty('--p', e.p.toFixed(4));
    dibujar(e);
    for (const b of e.beats) {
      b.classList.toggle('activo', e.p >= Number(b.dataset.desde) && e.p < Number(b.dataset.hasta));
    }
  }

  for (const s of conParallax) {
    const r = s.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) continue;
    s.style.setProperty('--p', limitar((vh - r.top) / (vh + r.height)).toFixed(4));
  }

  if (marcas.length) {
    let actual = marcas[0].dataset.capitulo;
    for (const m of marcas) {
      if (m.getBoundingClientRect().top <= vh * 0.5) actual = m.dataset.capitulo;
    }
    if (actual !== capituloActivo) {
      capituloActivo = actual;
      enlaces.forEach((a) => a.classList.toggle('activo', a.dataset.ir === actual));
    }
  }

  if (progreso) {
    const total = document.documentElement.scrollHeight - vh;
    progreso.style.transform = `scaleX(${limitar(window.scrollY / total)})`;
  }

  requestAnimationFrame(cuadroAnimacion);
}
requestAnimationFrame(cuadroAnimacion);

// ---------- Cifras que cuentan solas ----------
const formato = (n, dec) => n.toFixed(dec).replace('.', ',');
const contador = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((ent) => {
      if (!ent.isIntersecting) return;
      const el = ent.target;
      const meta = Number(el.dataset.cuenta);
      const dec = Number(el.dataset.decimales || 0);
      const t0 = performance.now();
      const paso = (t) => {
        const k = limitar((t - t0) / 1600);
        el.textContent = formato(meta * (1 - Math.pow(1 - k, 3)), dec);
        if (k < 1) requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
      contador.unobserve(el);
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll('[data-cuenta]').forEach((el) => contador.observe(el));
