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
                opt.value = malla.id; opt.textContent = `${malla.id} (${malla.abertura}mm)`;
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
    document.getElementById('piso3-card').classList.toggle('hidden', pisos !== "3");
    calcularModelo();
}

function actualizarGranulometriaBase() { calcularModelo(); }
function calcularModelo() {
    const caudal = parseFloat(document.getElementById('caudal-input').value);
    document.getElementById('caudal-val').textContent = caudal + ' t/h';
    const tipoMateria = document.getElementById('materia-prima').value;
    const numPisos = document.getElementById('pisos-select').value;
    
    let baseDist =; 
    if (tipoMateria === 'resina') baseDist =;
    if (tipoMateria === 'construccion') baseDist =;

    let eficienciaFactor = numPisos === "3" ? 1.05 : 1.0;
    const m1 = catálogoMallas.find(m => m.id === document.getElementById('p1-m1').value).abertura;
    const m2 = catálogoMallas.find(m => m.id === document.getElementById('p1-m2').value).abertura;
    const efBase = Math.max(55, 96 - (Math.abs(m1 - m2) * 15));
    const eficienciaCalculada = Math.min(100, efBase * eficienciaFactor).toFixed(1);

    const conforme = (caudal * (baseDist[2] + baseDist[3]) / 100 * (eficienciaCalculada / 100)).toFixed(1);
    const reject = (caudal - conforme).toFixed(1);

    document.getElementById('kpi-eficiencia').textContent = eficienciaCalculada + '%';
    document.getElementById('kpi-conforme').textContent = conforme + ' t/h';
    document.getElementById('kpi-rechazo').textContent = reject + ' t/h';

    renderizarGrafico(baseDist, baseDist.map(v => Math.round(v * (eficienciaCalculada / 100))));
}

function renderizarGrafico(teorico, real) {
    const ctx = document.getElementById('chart-granulometria').getContext('2d');
    if (granulometriaChart) granulometriaChart.destroy();
    granulometriaChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['> 2.0mm', '1.18-2.0mm', '0.60-1.18mm', '0.30-0.60mm', '< 0.30mm'],
            datasets: [
                { label: 'Teórico (%)', data: teorico, backgroundColor: 'rgba(71, 85, 105, 0.4)', borderColor: 'rgba(148, 163, 184, 0.8)', borderWidth: 1.5 },
                { label: 'Real (%)', data: real, backgroundColor: '#f59e0b', borderColor: '#f59e0b', borderWidth: 1.5 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#94a3b8' } } },
            scales: {
                y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8', callback: v => v + '%' } },
                x: { ticks: { color: '#94a3b8' } }
            }
        }
    });
}

function iniciarMotorCinético() {
    const canvas = document.createElement('canvas');
    canvas.id = "canvas-zaranda";
    canvas.className = "w-full h-full absolute inset-0 rounded-xl pointer-events-none";
    const container = document.getElementById('simulador-camara');
    if(container) {
        container.innerHTML = '';
        container.appendChild(canvas);
        container.classList.add('relative', 'bg-slate-950', 'border', 'border-slate-800');
    } else { return; }

    const ctx = canvas.getContext('2d');
    function resize() { canvas.width = container.clientWidth; canvas.height = container.clientHeight; }
    resize(); window.addEventListener('resize', resize);

    function animar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const frecuencia = parseFloat(document.getElementById('caudal-input').value) / 15; 
        const amplitud = 3; 
        const numPisos = parseInt(document.getElementById('pisos-select').value);

        ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)'; ctx.lineWidth = 4;
        for(let p = 0; p < numPisos; p++) {
            let yH = 40 + (p * 45);
            ctx.beginPath(); ctx.moveTo(10, yH); ctx.lineTo(canvas.width - 10, yH + 15); ctx.stroke();
        }

        if (Math.random() < (frecuencia * 0.2) && particulas.length < 180) {
            particulas.push({ x: 20 + Math.random() * 30, y: 10, vx: 1.5 + Math.random() * 1.5, vy: 0, size: Math.random() * 4 + 1.5, color: Math.random() > 0.4 ? '#f59e0b' : '#64748b' });
        }

        for (let i = particulas.length - 1; i >= 0; i--) {
            let p = particulas[i];
            let vibracionY = Math.sin(Date.now() * 0.02 * frecuencia) * amplitud;
            p.vy += 0.18; p.x += p.vx; p.y += p.vy + vibracionY * 0.1;

            for(let level = 0; level < numPisos; level++) {
                let pisoY = 40 + (level * 45) + ((p.x / canvas.width) * 15);
                if (p.y >= pisoY - 3 && p.y <= pisoY + 5 && p.size > (4 - level)) {
                    p.y = pisoY - 2; p.vy = -Math.abs(p.vy) * 0.3;
                }
            }
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.fill();
            if (p.x > canvas.width || p.y > canvas.height) particulas.splice(i, 1);
        }
        animationFrameId = requestAnimationFrame(animar);
    }
    if(animationFrameId) cancelAnimationFrame(animationFrameId);
    animar();
}

function tomarFotografiaMuestra() {
    const h = document.getElementById('historial-muestras');
    if (h) {
        if (h.innerHTML.includes('Sin muestras')) h.innerHTML = '';
        h.innerHTML = `<div class="p-2 bg-slate-950 rounded border border-slate-800 flex justify-between tracking-tight"><span>[${new Date().toLocaleTimeString()}] Muestra Sílice</span><span class="text-emerald-400 font-bold">${document.getElementById('kpi-eficiencia').textContent}</span></div>` + h.innerHTML;
    }
}

async function exportarReportePDF() {
    const { jsPDF } = window.jspdf; const doc = new jsPDF('p', 'mm', 'a4');
    const btn = document.querySelector('button[onclick="exportarReportePDF()"]');
    btn.textContent = "Procesando...";
    await html2canvas(document.getElementById('reporte-contenido'), { scale: 1.5, backgroundColor: '#020617' }).then(canvas => {
        doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width); doc.save('Reporte_Alta_Direccion.pdf');
    });
    btn.textContent = "Exportar PDF";
}

window.onload = initSimulador;
