/* =========================================================
   BACKEND SIMULADO — Caso 13.1 Concesionario
   Hace de "API": valida reglas de negocio y persiste datos.
   La primera carga trae el seed desde db.json (simula un
   GET inicial a la base de datos); de ahí en más lee/escribe
   en localStorage (simula la base de datos persistente).
   ========================================================= */

const STORAGE_KEY = 'bloque13_concesionario_db';
const DB_SEED_URL = '13_1_concesionario_db.json';

async function cargarDB(){
  const cache = localStorage.getItem(STORAGE_KEY);
  if(cache) return JSON.parse(cache);
  const resp = await fetch(DB_SEED_URL);
  const seed = await resp.json();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

function guardarDB(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DB));
}

function hhmmAMin(hhmm){
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
function minAHHMM(min){
  const h = String(Math.floor(min / 60)).padStart(2, '0');
  const m = String(min % 60).padStart(2, '0');
  return `${h}:${m}`;
}

function seSuperponen(iniA, finA, iniB, finB){
  return iniA < finB && iniB < finA;
}

// ---- endpoints simulados ----
function verificarDisponibilidad(vehiculoId, asesorId, fecha, ini, fin){
  const delDia = DB.reservas.filter(r => r.fecha === fecha);
  const conflictoVehiculo = delDia.find(r => r.vehiculoId === vehiculoId && seSuperponen(ini, fin, r.ini, r.fin));
  const conflictoAsesor = delDia.find(r => r.asesorId === asesorId && seSuperponen(ini, fin, r.ini, r.fin));
  return { disponible: !conflictoVehiculo && !conflictoAsesor, conflictoVehiculo, conflictoAsesor };
}

function crearReserva({ vehiculoId, asesorId, cliente, fecha, ini, fin }){
  const check = verificarDisponibilidad(vehiculoId, asesorId, fecha, ini, fin);
  if(!check.disponible){
    return { ok: false, check };
  }
  const nueva = { id: Date.now(), vehiculoId, asesorId, cliente, fecha, ini, fin };
  DB.reservas.push(nueva);
  guardarDB();
  return { ok: true, reserva: nueva };
}
