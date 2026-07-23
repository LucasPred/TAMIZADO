const catálogoMallas = [
    { id: "M01", abertura: 2.00, hilo: 0.80, material: "Acero Carbono AISI 1045", area: 51.0, uso: "Corte superior y desbaste primario" },
    { id: "M02", abertura: 1.18, hilo: 0.50, material: "Acero Inoxidable AISI 304", area: 49.3, uso: "Fraccionamiento intermedio" },
    { id: "M03", abertura: 0.60, hilo: 0.32, material: "Acero Inoxidable AISI 316", area: 42.5, uso: "Zonificación fina y control de finos" },
    { id: "M04", abertura: 0.30, hilo: 0.20, material: "Poliuretano Inyectado", area: 36.0, uso: "Tramos terminales de alta abrasión" },
    { id: "M05", abertura: 0.15, hilo: 0.10, material: "Nylon / Poliamida Alta Tenacidad", area: 36.0, uso: "Micro-granulometrías y control estricto" }
];

const problemasLimpieza = [
    { material: "Acero al Carbono", problema: "Acuñamiento severo de granos angulares de sílice.", frecuencia: "Cada 4 horas de operación continua.", solucion: "Implementación de esferas de caucho duro anticolmatantes." },
    { material: "Acero Inoxidable", problema: "Cegamiento por humedad superficial combinada con estática.", frecuencia: "Cada 8 horas (dependiendo de la cantera).", solucion: "Lavado presurizado sectorizado y ajuste de ángulo de tiro." },
    { material: "Poliuretano", problema: "Taponamiento progresivo por arcillas expansivas o limos.", frecuencia: "Inspección y limpieza semanal.", solucion: "Aprovechamiento de la elasticidad natural del elastómero." }
];

let granulometriaChart = null;
let particulas = [];
let animationFrameId = null;

function initSimulador() {
    const selectors = ['p1-m1', 'p1-m2', 'p2-m1', 'p2-m2', 'p3-m1', 'p3-m2'];
    selectors.forEach((selId, index) => {
        const select = document.getElementById(selId);
        if (select) {
            select.innerHTML = '';
            catálogoMallas.forEach(malla => {
                const opt = document.createElement('option');
                opt.value = malla.id; 
                opt.textContent = `${malla.id} - ${malla.abertura}mm (${malla.material})`;
                select.appendChild(opt);
            });
            select.selectedIndex = Math.min(index % catálogoMallas.length, catálogoMallas.length - 1);
        }
    });

    const tbody = document.getElementById('tabla-mallas-body');
    if(tbody) {
        tbody.innerHTML = '';
        catálogoMallas.forEach(m => {
            tbody.innerHTML += `<tr class="hover:bg-slate-900/50 transition-colors border-b border-slate-800/60"><td class="p-3 font-mono font-bold text-amber-500">${m.id}</td><td class="p-3 font-semibold">${m.abertura.toFixed(2)} mm</td><td class="p-3 text-slate-400">${m.hilo.toFixed(2)} mm</td><td class="p-3"><span class="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] text-white">${m.material}</span></td><td class="p-3 text-emerald-400 font-bold">${m.area}%</td><td class="p-3 text-slate-400">${m.uso}</td></tr>`;
        });
    }

    const contenedor = document.getElementById('mapeo-problemas');
    if(contenedor) {
        contenedor.innerHTML = '';
        problemasLimpieza.forEach(p => {
            contenedor.innerHTML += `<div class="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2"><div class="flex justify-between items-center"><span class="text-xs font-bold text-amber-500 uppercase tracking-wider">${p.material}</span><span class="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 font-medium">${p.frecuencia}</span></div><p class="text-xs text-slate-200"><strong>Falla:</strong> ${p.problema}</p><p class="text-xs text-slate-400"><strong>Solución:</strong> ${p.solucion}</p></div>`;
        });
    }

    iniciarMotorCinético();
    calcularModelo();
}

function alternarPisosVisibles() {
    const pisos = document.getElementById('pisos-select').value;
    const piso3Card = document.getElementById('piso3-card');
    if(piso3Card) {
        piso3Card.classList.toggle('hidden', pisos !== "3");
    }
    calcularModelo();
}

function actualizarGranulometriaBase() { 
    calcularModelo(); 
}
