#!/usr/bin/env node
// Convierte los videos de la página en secuencias de cuadros y saca cuadros sueltos.
// Funciona en Mac, Windows y Linux. Si el equipo no tiene ffmpeg, lo baja solo la primera vez.
//
// Uso (siempre desde la carpeta de la página):
//   node cuadros.mjs secuencia <video.mp4> <nombre> [--fps 12] [--desde 0] [--hasta 2.5]
//   node cuadros.mjs ultimo <video.mp4> <salida.png>
//   node cuadros.mjs cuadro <video.mp4> <segundo> <salida.png>
//   node cuadros.mjs duracion <video.mp4>
//   node cuadros.mjs musica <entrada.mp3|wav> <salida.mp3>   la deja liviana para la web

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const AQUI = dirname(fileURLToPath(import.meta.url));
const ANCHO_ESCRITORIO = 1280;
const ANCHO_MOVIL = 720;

function salir(mensaje) {
  console.error(`\nError: ${mensaje}\n`);
  process.exit(1);
}

// ---------- Encontrar ffmpeg ----------
function buscarFfmpeg() {
  const delSistema = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  if (delSistema.status === 0) return 'ffmpeg';

  const requerir = createRequire(join(AQUI, 'package.json'));
  const instalar = () => {
    console.log('Bajando ffmpeg por única vez (unos 40 a 80 MB)...');
    const r = spawnSync(
      process.platform === 'win32' ? 'npm.cmd' : 'npm',
      ['install', '--no-save', '--no-audit', '--no-fund', '--prefix', AQUI, 'ffmpeg-static@5.2.0'],
      { stdio: 'inherit', shell: process.platform === 'win32' }
    );
    if (r.status !== 0) salir('no se pudo instalar ffmpeg. Revisa la conexión a internet y que Node.js esté instalado.');
  };
  try {
    requerir.resolve('ffmpeg-static');
  } catch {
    instalar();
  }
  // Algunas versiones de npm no corren el script que baja el binario: se corre a mano
  const ruta = requerir('ffmpeg-static');
  if (!existsSync(ruta)) {
    spawnSync(process.execPath, [join(dirname(requerir.resolve('ffmpeg-static')), 'install.js')], { stdio: 'inherit' });
    if (!existsSync(ruta)) salir('no se pudo bajar ffmpeg. Instálalo a mano desde ffmpeg.org y vuelve a intentar.');
  }
  return ruta;
}

function correr(bin, args) {
  const r = spawnSync(bin, args, { encoding: 'utf8' });
  if (r.status !== 0) salir(`ffmpeg falló:\n${(r.stderr || '').split('\n').slice(-6).join('\n')}`);
  return r.stdout;
}

function duracion(ffmpeg, video) {
  // ffmpeg sin salida termina con error, pero igual informa la duración del video
  const r = spawnSync(ffmpeg, ['-i', video], { encoding: 'utf8' });
  const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(r.stderr || '');
  if (!m) salir('no pude leer la duración del video');
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

function opcion(args, nombre, porDefecto) {
  const i = args.indexOf(`--${nombre}`);
  return i === -1 ? porDefecto : args[i + 1];
}

function pesoCarpeta(carpeta) {
  return readdirSync(carpeta).reduce((n, f) => n + statSync(join(carpeta, f)).size, 0);
}

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

// ---------- Anotar la cantidad de cuadros en guion.js ----------
function anotarEnGuion(nombre, total) {
  const ruta = resolve('guion.js');
  if (!existsSync(ruta)) {
    console.log(`(No hay guion.js en esta carpeta: anota a mano '${nombre}': ${total} en secuencias.)`);
    return;
  }
  let texto = readFileSync(ruta, 'utf8');
  const existente = new RegExp(`(['"]${nombre}['"]\\s*:\\s*)\\d+`);
  if (existente.test(texto)) {
    texto = texto.replace(existente, `$1${total}`);
  } else {
    texto = texto.replace(/secuencias:\s*\{\n/, (m) => `${m}    '${nombre}': ${total},\n`);
  }
  writeFileSync(ruta, texto);
  console.log(`guion.js actualizado: '${nombre}': ${total}`);
}

// ---------- Comandos ----------
const [comando, ...args] = process.argv.slice(2);
if (!comando) salir('falta el comando. Mira el uso al inicio de este archivo.');
const ffmpeg = buscarFfmpeg();

if (comando === 'duracion') {
  const video = args[0];
  if (!video || !existsSync(video)) salir(`no encuentro el video "${video}"`);
  console.log(duracion(ffmpeg, video).toFixed(2));
} else if (comando === 'ultimo') {
  const [video, salida] = args;
  if (!video || !existsSync(video)) salir(`no encuentro el video "${video}"`);
  if (!salida) salir('falta el nombre de la imagen de salida');
  // Se toma un instante antes del final para no caer en un cuadro negro de cierre
  const t = Math.max(0, duracion(ffmpeg, video) - 0.05);
  correr(ffmpeg, ['-y', '-v', 'error', '-ss', t.toFixed(3), '-i', video, '-frames:v', '1', salida]);
  console.log(`Último cuadro guardado en ${salida}`);
} else if (comando === 'cuadro') {
  const [video, segundo, salida] = args;
  if (!video || !existsSync(video)) salir(`no encuentro el video "${video}"`);
  if (!salida) salir('uso: cuadro <video> <segundo> <salida.png>');
  correr(ffmpeg, ['-y', '-v', 'error', '-ss', String(segundo), '-i', video, '-frames:v', '1', salida]);
  console.log(`Cuadro del segundo ${segundo} guardado en ${salida}`);
} else if (comando === 'secuencia') {
  const [video, nombre] = args;
  if (!video || !existsSync(video)) salir(`no encuentro el video "${video}"`);
  if (!nombre || !/^[a-z0-9-]+$/.test(nombre)) salir('el nombre va en minúsculas, sin espacios ni tildes, por ejemplo: escena-1');
  const fps = Number(opcion(args, 'fps', 12));
  const desde = opcion(args, 'desde', null);
  const hasta = opcion(args, 'hasta', null);
  const recorte = [...(desde ? ['-ss', desde] : []), ...(hasta ? ['-to', hasta] : [])];

  const total = {};
  for (const [carpeta, ancho, calidad] of [[nombre, ANCHO_ESCRITORIO, 4], [`${nombre}-movil`, ANCHO_MOVIL, 5]]) {
    const destino = resolve('assets', 'cuadros', carpeta);
    if (existsSync(destino)) rmSync(destino, { recursive: true });
    mkdirSync(destino, { recursive: true });
    correr(ffmpeg, [
      '-v', 'error', '-i', video, ...recorte,
      '-vf', `fps=${fps},scale=${ancho}:-2`,
      '-q:v', String(calidad),
      join(destino, '%03d.jpg'),
    ]);
    total[carpeta] = readdirSync(destino).filter((f) => f.endsWith('.jpg')).length;
    console.log(`${carpeta}: ${total[carpeta]} cuadros, ${mb(pesoCarpeta(destino))}`);
  }
  if (total[nombre] !== total[`${nombre}-movil`]) salir('las dos versiones quedaron con distinta cantidad de cuadros');
  anotarEnGuion(nombre, total[nombre]);
  if (total[nombre] > 130) console.log('Ojo: más de 130 cuadros en una escena pesa mucho. Prueba con --fps 10.');
} else if (comando === 'musica') {
  const [entrada, salida] = args;
  if (!entrada || !existsSync(entrada)) salir(`no encuentro el audio "${entrada}"`);
  if (!salida) salir('uso: musica <entrada> <salida.mp3>');
  mkdirSync(dirname(resolve(salida)), { recursive: true });
  // Sin la imagen de portada que traen algunos MP3, y a 128 kbps: suficiente para una web
  correr(ffmpeg, ['-y', '-v', 'error', '-i', entrada, '-vn', '-map_metadata', '-1', '-c:a', 'libmp3lame', '-b:a', '128k', salida]);
  console.log(`Música lista en ${salida}: ${mb(statSync(salida).size)}, ${duracion(ffmpeg, salida).toFixed(0)} segundos`);
} else {
  salir(`no conozco el comando "${comando}"`);
}
