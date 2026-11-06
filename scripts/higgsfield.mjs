#!/usr/bin/env node
// Genera imágenes y videos con la API de Higgsfield (saldo prepagado, sin plan mensual).
// Las claves viven en ~/.web-cinematica/higgsfield.env, FUERA de la carpeta de la página,
// para que nunca terminen publicadas. Cotizar no cobra; solo "generar" cobra.
//
// Uso:
//   node higgsfield.mjs configurar              crea el archivo de claves y lo abre para pegarlas
//   node higgsfield.mjs probar                  revisa que las claves funcionen (no cobra)
//   node higgsfield.mjs tope <dólares>          tope de gasto por mes (por defecto US$10)
//   node higgsfield.mjs gasto                   cuánto se lleva gastado este mes
//   node higgsfield.mjs cotizar imagen --prompt "..." [--referencias a.png,b.jpg] [--formato 16:9]
//   node higgsfield.mjs cotizar video --prompt "..." --inicio cuadro.png [--final cuadro.png] [--duracion 5]
//   node higgsfield.mjs generar <cotización> [--carpeta fuentes] [--nombre 01-tablero]

import { parseArgs } from 'node:util';
import { randomBytes, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync, rmSync, chmodSync } from 'node:fs';
import { homedir } from 'node:os';
import { extname, join, resolve } from 'node:path';

const API = 'https://api.higgsfield.ai';
const HOSTS_API = ['api.higgsfield.ai', 'platform.higgsfield.ai'];
const CASA = join(homedir(), '.web-cinematica');
const CLAVES = join(CASA, 'higgsfield.env');
const TOPE = join(CASA, 'tope.json');
const GASTOS = join(CASA, 'gastos.jsonl');
const COTIZACIONES = join(CASA, 'cotizaciones');

// Modelos probados para esta técnica. Si Higgsfield los retira, se cambian acá.
const MODELOS = {
  imagen: { id: 'higgsfield-ai/soul/v2/standard', nombre: 'Soul 2 (1080p)', base: { resolution: '1080p' } },
  imagenConReferencias: { id: 'xai/grok-imagine-image-2.0', nombre: 'Grok Imagine 2.0 con referencias', base: { resolution: '2k' } },
  video: { id: 'kling-video/v3.0/pro/image-to-video', nombre: 'Kling 3.0 Pro, imagen a video', base: { sound: 'off' } },
};

const TIPOS_ARCHIVO = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };

function salir(mensaje) {
  console.error(`\n${mensaje}\n`);
  process.exit(1);
}

const usd = (n) => `US$${new Intl.NumberFormat('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 3 }).format(n)}`;
const redondear = (n) => Math.round(n * 1000) / 1000;

// ---------- Claves ----------
function claves() {
  // Si las claves ya vienen en el entorno (usuarios avanzados), se usan esas
  if (!process.env.HF_API_KEY_ID || !process.env.HF_API_KEY_SECRET) {
    if (!existsSync(CLAVES)) salir('Todavía no hay claves. Corre primero: node higgsfield.mjs configurar');
    try {
      process.loadEnvFile(CLAVES);
    } catch {
      salir(`No pude leer ${CLAVES}.`);
    }
  }
  let id = process.env.HF_API_KEY_ID?.trim();
  let secreto = process.env.HF_API_KEY_SECRET?.trim();
  // Si pegó la clave completa en una sola línea (ID:secreto), se separa sola
  if (id?.includes(':') && !secreto) [id, secreto] = id.split(':', 2);
  if (!id || !secreto) salir(`Faltan las claves en ${CLAVES}. Pega el ID y el secreto, guarda el archivo y vuelve a intentar.`);
  return { Authorization: `Key ${id}:${secreto}`, 'Content-Type': 'application/json' };
}

function abrirEnEditor(ruta) {
  const [cmd, args] = process.platform === 'darwin' ? ['open', ['-e', ruta]]
    : process.platform === 'win32' ? ['notepad', [ruta]]
    : ['xdg-open', [ruta]];
  spawnSync(cmd, args, { stdio: 'ignore', detached: true });
}

// ---------- Gasto ----------
function tope() {
  try {
    return JSON.parse(readFileSync(TOPE, 'utf8')).mensualUsd;
  } catch {
    return 10;
  }
}

function gastoDelMes() {
  if (!existsSync(GASTOS)) return { total: 0, cantidad: 0 };
  const ahora = new Date();
  let total = 0;
  let cantidad = 0;
  for (const linea of readFileSync(GASTOS, 'utf8').split('\n')) {
    if (!linea.trim()) continue;
    const g = JSON.parse(linea);
    const f = new Date(g.fecha);
    if (f.getFullYear() !== ahora.getFullYear() || f.getMonth() !== ahora.getMonth()) continue;
    total += g.usd;
    cantidad++;
  }
  return { total: redondear(total), cantidad };
}

// ---------- Subir archivos locales ----------
// La API pide URLs públicas. Las imágenes locales se suben al almacenamiento de Higgsfield.
async function aUrl(ruta, cabeceras) {
  if (ruta.startsWith('https://')) return ruta;
  const archivo = resolve(ruta);
  if (!existsSync(archivo)) salir(`No encuentro la imagen ${ruta}.`);
  const tipo = TIPOS_ARCHIVO[extname(archivo).toLowerCase()];
  if (!tipo) salir(`${ruta} tiene que ser png, jpg o webp.`);

  const pedido = await fetch(`${API}/files/generate-upload-url`, {
    method: 'POST',
    headers: cabeceras,
    body: JSON.stringify({ content_type: tipo }),
  });
  const texto = await pedido.text();
  if (!pedido.ok) salir(`Higgsfield no entregó dónde subir la imagen (HTTP ${pedido.status}): ${texto}`);
  const { upload_url: destino, public_url: publica, upload_headers: cabecerasSubida } = JSON.parse(texto);

  // Las claves NO viajan al almacenamiento: solo las cabeceras que entrega Higgsfield.
  const subida = await fetch(destino, { method: 'PUT', headers: cabecerasSubida, body: readFileSync(archivo) });
  if (!subida.ok) salir(`No se pudo subir ${ruta} (HTTP ${subida.status}).`);
  console.log(`Imagen subida: ${ruta}`);
  return publica;
}

// ---------- Comandos ----------
let opciones;
try {
  opciones = parseArgs({
    allowPositionals: true,
    options: {
      prompt: { type: 'string' },
      referencias: { type: 'string' },
      formato: { type: 'string', default: '16:9' },
      inicio: { type: 'string' },
      final: { type: 'string' },
      duracion: { type: 'string', default: '5' },
      carpeta: { type: 'string', default: 'fuentes' },
      nombre: { type: 'string' },
    },
  });
} catch (e) {
  salir(e.message);
}
const { values: v, positionals: [comando, ...resto] } = opciones;

if (comando === 'configurar') {
  mkdirSync(CASA, { recursive: true });
  if (!existsSync(CLAVES)) {
    writeFileSync(CLAVES, [
      '# Claves de la API de Higgsfield. Las sacas en https://open.higgsfield.ai, sección API Keys.',
      '# Pega cada valor después del signo =, sin espacios ni comillas, y guarda el archivo.',
      '# Este archivo es privado: no lo compartas ni lo copies a la carpeta de la página.',
      'HF_API_KEY_ID=',
      'HF_API_KEY_SECRET=',
      '',
    ].join('\n'));
  }
  try { chmodSync(CLAVES, 0o600); } catch {}
  if (!existsSync(TOPE)) writeFileSync(TOPE, JSON.stringify({ mensualUsd: 10 }));
  abrirEnEditor(CLAVES);
  console.log(`Abrí el archivo de claves: ${CLAVES}`);
  console.log('Pega ahí el ID y el secreto, guarda y cierra. Después: node higgsfield.mjs probar');
  process.exit(0);
}

if (comando === 'tope') {
  const monto = Number(resto[0]);
  if (!(monto > 0)) salir('Uso: node higgsfield.mjs tope 15');
  mkdirSync(CASA, { recursive: true });
  writeFileSync(TOPE, JSON.stringify({ mensualUsd: monto }));
  console.log(`Tope mensual: ${usd(monto)}`);
  process.exit(0);
}

if (comando === 'gasto') {
  const g = gastoDelMes();
  console.log(`Gastado este mes: ${usd(g.total)} de ${usd(tope())} (${g.cantidad} generaciones)`);
  console.log(`Disponible dentro del tope: ${usd(redondear(tope() - g.total))}`);
  console.log('El saldo real de la cuenta se ve en https://open.higgsfield.ai, sección Billing.');
  process.exit(0);
}

if (comando === 'probar') {
  const r = await fetch(`${API}/estimate/${MODELOS.imagen.id}`, {
    method: 'POST',
    headers: claves(),
    body: JSON.stringify({ prompt: 'prueba', aspect_ratio: '16:9', ...MODELOS.imagen.base }),
  });
  if (r.status === 401 || r.status === 403) salir('Higgsfield rechazó las claves. Revisa que el ID y el secreto estén bien copiados, sin espacios.');
  if (!r.ok) salir(`Higgsfield respondió HTTP ${r.status}: ${await r.text()}`);
  console.log('Las claves funcionan. Puedes cotizar y generar.');
  process.exit(0);
}

if (comando === 'cotizar') {
  const tipo = resto[0];
  if (!['imagen', 'video'].includes(tipo)) salir('Uso: cotizar imagen ... o cotizar video ...');
  if (!v.prompt) salir('Falta --prompt.');
  const cabeceras = claves();
  let modelo;
  let cuerpo;

  if (tipo === 'imagen') {
    const refs = v.referencias ? v.referencias.split(',').map((x) => x.trim()).filter(Boolean) : [];
    modelo = refs.length ? MODELOS.imagenConReferencias : MODELOS.imagen;
    cuerpo = { prompt: v.prompt, aspect_ratio: v.formato, ...modelo.base };
    if (refs.length) cuerpo.image_urls = await Promise.all(refs.map((r) => aUrl(r, cabeceras)));
  } else {
    if (!v.inicio) salir('Un video necesita --inicio con la imagen de partida (la maestra o el último cuadro del video anterior).');
    const duracion = Number(v.duracion);
    if (!Number.isInteger(duracion) || duracion < 3 || duracion > 15) salir('--duracion va de 3 a 15 segundos, en números enteros.');
    modelo = MODELOS.video;
    cuerpo = { prompt: v.prompt, duration: duracion, ...modelo.base, image_url: await aUrl(v.inicio, cabeceras) };
    if (v.final) cuerpo.last_image_url = await aUrl(v.final, cabeceras);
  }

  const r = await fetch(`${API}/estimate/${modelo.id}`, { method: 'POST', headers: cabeceras, body: JSON.stringify(cuerpo) });
  const texto = await r.text();
  if (!r.ok) salir(`Higgsfield no pudo cotizar (HTTP ${r.status}): ${texto}`);
  const costo = Number(JSON.parse(texto).usd);
  if (!(costo >= 0)) salir(`Higgsfield no devolvió un precio: ${texto}`);

  const g = gastoDelMes();
  const limite = tope();
  console.log(`Modelo: ${modelo.nombre}`);
  if (cuerpo.duration) console.log(`Duración: ${cuerpo.duration} s`);
  console.log(`Costo: ${usd(costo)}`);
  console.log(`Gastado este mes: ${usd(g.total)} de ${usd(limite)}`);
  if (redondear(g.total + costo) > limite) {
    salir(`Esta generación pasaría el tope mensual de ${usd(limite)}. Si quieres subirlo: node higgsfield.mjs tope <monto>`);
  }

  const id = randomBytes(4).toString('hex');
  mkdirSync(COTIZACIONES, { recursive: true });
  writeFileSync(join(COTIZACIONES, `${id}.json`), JSON.stringify({ id, fecha: new Date().toISOString(), tipo, modelo, cuerpo, costo }, null, 2));
  console.log(`Cotización: ${id}`);
  process.exit(0);
}

if (comando === 'generar') {
  const id = resto[0] ?? '';
  if (!/^[0-9a-f]{8}$/.test(id)) salir('Uso: node higgsfield.mjs generar <cotización>');
  const ruta = join(COTIZACIONES, `${id}.json`);
  if (!existsSync(ruta)) salir(`No encuentro la cotización ${id}. Cotiza de nuevo.`);
  const c = JSON.parse(readFileSync(ruta, 'utf8'));
  if (Date.now() - new Date(c.fecha).getTime() > 24 * 3600 * 1000) {
    rmSync(ruta, { force: true });
    salir('La cotización tiene más de 24 horas y los precios pueden haber cambiado. Cotiza de nuevo.');
  }
  if (redondear(gastoDelMes().total + c.costo) > tope()) salir('Esta generación pasaría el tope mensual.');

  const cabeceras = claves();
  const envio = await fetch(`${API}/${c.modelo.id}`, {
    method: 'POST',
    // Si la conexión se corta y se reintenta, la misma clave evita cobrar dos veces
    headers: { ...cabeceras, 'Idempotency-Key': randomUUID() },
    body: JSON.stringify(c.cuerpo),
  });
  const textoEnvio = await envio.text();
  if (envio.status === 402) salir('No hay saldo suficiente en Higgsfield. Carga saldo en https://open.higgsfield.ai, sección Billing.');
  if (!envio.ok) salir(`Higgsfield rechazó la generación (HTTP ${envio.status}): ${textoEnvio}`);
  const pedido = JSON.parse(textoEnvio);
  rmSync(ruta, { force: true }); // una cotización se usa una sola vez
  console.log(`Generando (pedido ${pedido.request_id}). Un video tarda entre 1 y 5 minutos.`);

  let hostEstado = null;
  try {
    const u = new URL(pedido.status_url);
    if (u.protocol === 'https:') hostEstado = u.hostname;
  } catch {}
  if (!HOSTS_API.includes(hostEstado)) salir(`Respuesta inesperada de Higgsfield. Revisa el pedido ${pedido.request_id} en la consola.`);

  const fin = Date.now() + 15 * 60 * 1000;
  let datos = {};
  let estado = '';
  while (Date.now() < fin) {
    const r = await fetch(pedido.status_url, { headers: { Authorization: cabeceras.Authorization } });
    if (!r.ok) salir(`No pude consultar el estado (HTTP ${r.status}). Revisa el pedido ${pedido.request_id} en la consola.`);
    datos = await r.json();
    if (datos.status !== estado) {
      estado = datos.status;
      console.log(`Estado: ${estado}`);
    }
    if (['completed', 'failed', 'nsfw', 'canceled'].includes(estado)) break;
    await new Promise((ok) => setTimeout(ok, 4000));
  }

  const anotar = (cobrado, archivos = []) => {
    mkdirSync(CASA, { recursive: true });
    appendFileSync(GASTOS, `${JSON.stringify({ fecha: new Date().toISOString(), pedido: pedido.request_id, modelo: c.modelo.id, usd: cobrado, estado, archivos })}\n`);
  };

  if (estado !== 'completed') {
    anotar(0);
    if (!['failed', 'nsfw', 'canceled'].includes(estado)) {
      salir(`Pasaron 15 minutos y sigue en "${estado}". Puede terminar igual: revisa el pedido ${pedido.request_id} en la consola.`);
    }
    salir(`La generación terminó en "${estado}" y no se cobró.${estado === 'nsfw' ? ' El filtro de contenido la bloqueó: cambia el prompt.' : ''}`);
  }

  const urls = (Array.isArray(datos.images) ? datos.images.map((i) => i.url) : [datos.video?.url]).filter(Boolean);
  const destino = resolve(v.carpeta);
  mkdirSync(destino, { recursive: true });
  const base = v.nombre || `${c.tipo}-${new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '')}`;
  const archivos = [];
  for (const [i, url] of urls.entries()) {
    if (!url.startsWith('https://')) continue;
    const r = await fetch(url);
    if (!r.ok) continue;
    const tipo = (r.headers.get('content-type') || '').split(';')[0];
    const ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'video/mp4': 'mp4' }[tipo] || (c.tipo === 'video' ? 'mp4' : 'png');
    const nombre = `${base}${urls.length > 1 ? `-${i + 1}` : ''}.${ext}`;
    writeFileSync(join(destino, nombre), Buffer.from(await r.arrayBuffer()));
    archivos.push(join(v.carpeta, nombre));
  }
  anotar(c.costo, archivos);
  if (!archivos.length) salir(`Se generó y se cobró, pero no pude bajar el archivo. Búscalo en la consola con el pedido ${pedido.request_id} (se guarda 7 días).`);
  for (const a of archivos) console.log(`Listo: ${a}`);
  const g = gastoDelMes();
  console.log(`Costo: ${usd(c.costo)} · Gastado este mes: ${usd(g.total)} de ${usd(tope())}`);
  process.exit(0);
}

salir('Comando desconocido. Mira el uso al inicio de este archivo.');
