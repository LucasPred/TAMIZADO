const catálogoMallas = [
    { id: "M01", abertura: 2.00, hilo: 0.80, material: "Acero Carbono AISI 1045", area: 51.0, uso: "Corte superior" },
    { id: "M02", abertura: 1.18, hilo: 0.50, material: "Acero Inoxidable AISI 304", area: 49.3, uso: "Fraccionamiento intermedio" },
    { id: "M03", abertura: 0.60, hilo: 0.32, material: "Acero Inoxidable AISI 316", area: 42.5, uso: "Zonificación fina" },
    { id: "M04", abertura: 0.30, hilo: 0.20, material: "Poliuretano Inyectado", area: 36.0, uso: "Tramos terminales" },
    { id: "M05", abertura: 0.15, hilo: 0.10, material: "Nylon Alta Tenacidad", area: 36.0, uso: "Micro-granulometrías" }
];

const problemasLimpieza = [
    { material: "Acero Carbono", problema: "Acuñamiento de granos de sílice.", frecuencia: "Cada 4 horas.", solucion: "Esferas de caucho duro." },
    { material: "Acero Inoxidable", problema: "Cegado por humedad y estática.", frecuencia: "Cada 8 horas.", solucion: "Lavado presurizado." },
    { material: "Poliuretano", problema: "Taponamiento por arcillas.", frecuencia: "Semanal.", solucion: "Elasticidad elástica natural." }
];

let granulometriaChart = null;

function initSimulador() {
    const selectors = ['p1-m1', 'p1-m2', 'p2-m1', 'p2-m2', 'p3-m1', 'p3-m2'];
    selectors.forEach((selId, index) => {
        const select = document.getElementById(selId);
        if (select) {
            catálogoMallas.forEach(malla => {
                const opt = document.createElement('option');
                opt.value = malla.id; opt.textContent = `${malla.id} (${malla.abertura}mm)`;
                select.appendChild(opt);
            });
            select.selectedIndex = Math.min(index % catálogoMallas.length, catálogoMallas.length - 1);
        }
    });
    const tbody = document.getElementById('tabla-mallas-body');
    catálogoMallas.forEach(m => {
        tbody.innerHTML += `<tr><td class="p-3 font-bold text-amber-500">${m.id}</td><td class="p-3 font-semibold">${m.abertura} mm</td><td class="p-3">${m.hilo} mm</td><td class="p-3">${m.material}</td><td class="p-3 text-emerald-400 font-bold">${m.area}%</td><td class="p-3 text-slate-400">${m.uso}</td></tr>`;
    });
    const contenedor = document.getElementById('mapeo-problemas');
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
    const caudal = parseFloat(document.getElementById('caudal-input').value);
    document.getElementById('caudal-val').textContent = caudal + ' t/h';
    const tipo = document.getElementById('materia-prima').value;
    const numPisos = document.getElementById('pisos-select').value;
    
    let baseDist = [5, 15, 40, 30, 10];
    if (tipo === 'resina') baseDist = [2, 8, 25, 45, 20];
    if (tipo === 'construccion') baseDist = [20, 35, 30, 10, 5];

    let factor = numPisos === "3" ? 1.05 : 1.0;
    const m1 = catálogoMallas.find(m => m.id === document.getElementById('p1-m1').value).abertura;
    const m2 = catálogoMallas.find(m => m.id === document.getElementById('p1-m2').value).abertura;
    const efBase = Math.max(55, 96 - (Math.abs(m1 - m2) * 15));
    const eficiencia = Math.min(100, efBase * factor).toFixed(1);

    const conforme = (caudal * (baseDist[2] + baseDist[3]) / 100 * (eficiencia / 100)).toFixed(1);
    const reject = (caudal - conforme).toFixed(1);

    document.getElementById('kpi-eficiencia').textContent = eficiencia + '%';
    document.getElementById('kpi-conforme').textContent = conforme + ' t/h';
    document.getElementById('kpi-rechazo').textContent = reject + ' t/h';

    renderizarGrafico(baseDist, baseDist.map(v => Math.round(v * (eficiencia / 100))));
}

function renderizarGrafico(teorico, real) {
    const ctx = document.getElementById('chart-granulometria').getContext('2d');
    if (granulometriaChart) granulometriaChart.destroy();
    granulometriaChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['>2.0mm', '1.18-2.0mm', '0.60-1.18mm', '0.30-0.60mm', '<0.30mm'],
            datasets: [{ label: 'Teórico', data: teorico, backgroundColor: 'rgba(71,85,105,0.4)' }, { label: 'Real', data: real, backgroundColor: '#f59e0b' }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function tomarFotografiaMuestra() {
    const h = document.getElementById('historial-muestras');
    h.innerHTML = `<div class="p-2 bg-slate-950 rounded border border-slate-800 flex justify-between"><span>[${new Date().toLocaleTimeString()}] Muestra</span><span class="text-emerald-400 font-bold">${document.getElementById('kpi-eficiencia').textContent}</span></div>` + h.innerHTML;
}

async function exportarReportePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    await html2canvas(document.getElementById('reporte-contenido'), { scale: 1.5, backgroundColor: '#020617' }).then(canvas => {
        doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
        doc.save('Reporte_Directorio.pdf');
    });
}

window.onload = initSimulador;
