const catálogoMallas = [
    { id: "M01", abertura: "2.00 mm", hilo: "0.80 mm", material: "Acero Carbono AISI 1045", area: "51%", uso: "Corte superior" },
    { id: "M02", abertura: "1.18 mm", hilo: "0.50 mm", material: "Acero Inoxidable AISI 304", area: "49%", uso: "Fraccionamiento intermedio" },
    { id: "M03", abertura: "0.60 mm", hilo: "0.32 mm", material: "Acero Inoxidable AISI 316", area: "42%", uso: "Zonificación fina" },
    { id: "M04", abertura: "0.30 mm", hilo: "0.20 mm", material: "Poliuretano Inyectado", area: "36%", uso: "Tramos terminales" },
    { id: "M05", abertura: "0.15 mm", hilo: "0.10 mm", material: "Nylon Alta Tenacidad", area: "36%", uso: "Micro-granulometrías finas" }
];

const problemasLimpieza = [
    { material: "Acero Carbono", problema: "Acuñamiento de granos de sílice.", frecuencia: "Cada 4 horas.", solucion: "Esferas de caucho duro." },
    { material: "Acero Inoxidable", problema: "Cegado por humedad y estática.", frecuencia: "Cada 8 horas.", solucion: "Lavado presurizado." },
    { material: "Poliuretano", problema: "Taponamiento por arcillas.", frecuencia: "Semanal.", solucion: "Elasticidad elástica natural." }
];

function initSimulador() {
    const selectors = ['p1-m1', 'p1-m2', 'p2-m1', 'p2-m2', 'p3-m1', 'p3-m2'];
    selectors.forEach((selId, index) => {
        const select = document.getElementById(selId);
        if (select) {
            select.innerHTML = '';
            catálogoMallas.forEach(m => {
                select.innerHTML += `<option value="${m.id}">${m.id} (${m.abertura})</option>`;
            });
            select.selectedIndex = index % catálogoMallas.length;
        }
    });

    const tbody = document.getElementById('tabla-mallas-body');
    tbody.innerHTML = '';
    catálogoMallas.forEach(m => {
        tbody.innerHTML += `<tr><td class="p-3 font-bold text-amber-500">${m.id}</td><td class="p-3 font-semibold">${m.abertura}</td><td class="p-3">${m.hilo}</td><td class="p-3">${m.material}</td><td class="p-3 text-emerald-400 font-bold">${m.area}</td><td class="p-3 text-slate-400">${m.uso}</td></tr>`;
    });

    const contenedor = document.getElementById('mapeo-problemas');
    contenedor.innerHTML = '';
    problemasLimpieza.forEach(p => {
        contenedor.innerHTML += `<div class="p-3 bg-slate-900 rounded-xl text-xs"><div class="flex justify-between font-bold text-amber-500"><span>${p.material}</span><span class="text-red-400">${p.frecuencia}</span></div><p class="text-slate-300"><strong>Falla:</strong> ${p.problema}</p><p class="text-slate-400"><strong>Solución:</strong> ${p.solucion}</p></div>`;
    });

    calcularModelo();
}

function alternarPisosVisibles() {
    const pisos = document.getElementById('pisos-select').value;
    document.getElementById('piso3-card').classList.toggle('hidden', pisos !== "3");
    calcularModelo();
}

function calcularModelo() {
    const caudal = parseFloat(document.getElementById('caudal-input').value) || 40;
    document.getElementById('caudal-val').textContent = caudal + ' t/h';
    
    const pisos = document.getElementById('pisos-select').value;
    let eficiencia = pisos === "3" ? 96.5 : 91.2;
    
    let conforme = (caudal * (eficiencia / 100)).toFixed(1);
    let reject = (caudal - conforme).toFixed(1);

    document.getElementById('kpi-eficiencia').textContent = eficiencia + '%';
    document.getElementById('kpi-conforme').textContent = conforme + ' t/h';
    document.getElementById('kpi-rechazo').textContent = reject + ' t/h';
}

function tomarFotografiaMuestra() {
    const h = document.getElementById('historial-muestras');
    if (h.innerHTML.includes('Sin muestras')) h.innerHTML = '';
    h.innerHTML = `<div class="p-2 bg-slate-950 rounded border border-slate-800 flex justify-between"><span>[${new Date().toLocaleTimeString()}] Muestra</span><span class="text-emerald-400 font-bold">${document.getElementById('kpi-eficiencia').textContent}</span></div>` + h.innerHTML;
}

window.onload = initSimulador;
