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

function calcularModelo() {
    const caudalElem = document.getElementById('caudal-input');
    const caudal = caudalElem ? parseFloat(caudalElem.value) : 50;
    const caudalVal = document.getElementById('caudal-val');
    if(caudalVal) caudalVal.textContent = caudal + ' t/h';

    const tipoMateriaElem = document.getElementById('materia-prima');
    const tipoMateria = tipoMateriaElem ? tipoMateriaElem.value : 'construccion';
    const numPisosElem = document.getElementById('pisos-select');
    const numPisos = numPisosElem ? numPisosElem.value : '2';
    
    let baseDist = [15, 25, 30, 20, 10]; 
    if (tipoMateria === 'resina') baseDist = [10, 20, 35, 25, 10];
    if (tipoMateria === 'construccion') baseDist = [20, 25, 25, 20, 10];

    let eficienciaFactor = numPisos === "3" ? 1.05 : 1.0;
    
    const m1Select = document.getElementById('p1-m1');
    const m2Select = document.getElementById('p1-m2');
    
    const m1Obj = m1Select ? catálogoMallas.find(m => m.id === m1Select.value) : catálogoMallas[0];
    const m2Obj = m2Select ? catálogoMallas.find(m => m.id === m2Select.value) : catálogoMallas[1];
    
    const m1 = m1Obj ? m1Obj.abertura : 2.0;
    const m2 = m2Obj ? m2Obj.abertura : 1.18;

    const efBase = Math.max(55, 96 - (Math.abs(m1 - m2) * 15));
    const eficienciaCalculada = Math.min(100, efBase * eficienciaFactor).toFixed(1);

    const conformeVal = (caudal * (baseDist[2] + baseDist[3]) / 100 * (eficienciaCalculada / 100)).toFixed(1);
    const rejectVal = (caudal - parseFloat(conformeVal)).toFixed(1);

    const kpiEficiencia = document.getElementById('kpi-eficiencia');
    const kpiConforme = document.getElementById('kpi-conforme');
    const kpiRechazo = document.getElementById('kpi-rechazo');

    if(kpiEficiencia) kpiEficiencia.textContent = eficienciaCalculada + '%';
    if(kpiConforme) kpiConforme.textContent = conformeVal + ' t/h';
    if(kpiRechazo) kpiRechazo.textContent = rejectVal + ' t/h';

    renderizarGrafico(baseDist, baseDist.map(v => Math.round(v * (eficienciaCalculada / 100))));
}

function renderizarGrafico(teorico, real) {
    const canvasCtx = document.getElementById('chart-granulometria');
    if (!canvasCtx) return;
    const ctx = canvasCtx.getContext('2d');
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
    const container = document.getElementById('simulador-camara');
    if(!container) return;

    let canvas = document.getElementById('canvas-zaranda');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = "canvas-zaranda";
        canvas.className = "w-full h-full absolute inset-0 rounded-xl pointer-events-none";
        container.innerHTML = '';
        container.appendChild(canvas);
        container.classList.add('relative', 'bg-slate-950', 'border', 'border-slate-800');
    }

    const ctx = canvas.getContext('2d');
    function resize() { 
        canvas.width = container.clientWidth; 
        canvas.height = container.clientHeight; 
    }
    resize(); 
    window.addEventListener('resize', resize);

    function animar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const caudalElem = document.getElementById('caudal-input');
        const frecuencia = caudalElem ? parseFloat(caudalElem.value) / 15 : 3; 
        const amplitud = 3; 
        const numPisosElem = document.getElementById('pisos-select');
        const numPisos = numPisosElem ? parseInt(numPisosElem.value) : 2;

        ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)'; 
        ctx.lineWidth = 4;
        for(let p = 0; p < numPisos; p++) {
            let yH = 40 + (p * 45);
            ctx.beginPath(); 
            ctx.moveTo(10, yH); 
            ctx.lineTo(canvas.width - 10, yH + 15); 
            ctx.stroke();
        }

        if (Math.random() < (frecuencia * 0.2) && particulas.length < 180) {
            particulas.push({ 
                x: 20 + Math.random() * 30, 
                y: 10, 
                vx: 1.5 + Math.random() * 1.5, 
                vy: 0, 
                size: Math.random() * 4 + 1.5, 
                color: Math.random() > 0.4 ? '#f59e0b' : '#64748b' 
            });
        }

        for (let i = particulas.length - 1; i >= 0; i--) {
            let p = particulas[i];
            let vibracionY = Math.sin(Date.now() * 0.02 * frecuencia) * amplitud;
            p.vy += 0.18; 
            p.x += p.vx; 
            p.y += p.vy + vibracionY * 0.1;

            for(let level = 0; level < numPisos; level++) {
                let pisoY = 40 + (level * 45) + ((p.x / canvas.width) * 15);
                if (p.y >= pisoY - 3 && p.y <= pisoY + 5 && p.size > (4 - level)) {
                    p.y = pisoY - 2; 
                    p.vy = -Math.abs(p.vy) * 0.3;
                }
            }
            ctx.beginPath(); 
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); 
            ctx.fillStyle = p.color; 
            ctx.fill();
            if (p.x > canvas.width || p.y > canvas.height) particulas.splice(i, 1);
        }
        animationFrameId = requestAnimationFrame(animar);
    }
    
    if(animationFrameId) cancelAnimationFrame(animationFrameId);
    animar();
}

function tomarFotografiaMuestra() {
    const h = document.getElementById('historial-muestras');
    const kpiEficiencia = document.getElementById('kpi-eficiencia');
    if (h && kpiEficiencia) {
        if (h.innerHTML.includes('Sin muestras')) h.innerHTML = '';
        h.innerHTML = `<div class="p-2 bg-slate-950 rounded border border-slate-800 flex justify-between tracking-tight"><span>[${new Date().toLocaleTimeString()}] Muestra Sílice</span><span class="text-emerald-400 font-bold">${kpiEficiencia.textContent}</span></div>` + h.innerHTML;
    }
}

async function exportarReportePDF() {
    const { jsPDF } = window.jspdf; 
    const doc = new jsPDF('p', 'mm', 'a4');
    const btn = document.querySelector('button[onclick="exportarReportePDF()"]');
    if(btn) btn.textContent = "Procesando...";
    
    const contenido = document.getElementById('reporte-contenido');
    if(contenido) {
        await html2canvas(contenido, { scale: 1.5, backgroundColor: '#020617' }).then(canvas => {
            doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width); 
            doc.save('Reporte_Alta_Direccion.pdf');
        });
    }
    if(btn) btn.textContent = "Exportar PDF";
}

window.onload = initSimulador;
