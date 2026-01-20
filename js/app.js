// ============================================
// SICOF - APLICACIÓN CONSOLIDADA
// Todas las funcionalidades en un solo archivo
// ============================================

// ========== VARIABLES GLOBALES ==========
let currentUser = null;
let currentView = 'loginView';
let servicioTemp = {
    paso1: null,
    paso2: null,
    paso3: null
};

// ========== NAVEGACIÓN DE VISTAS ==========
function showView(viewName) {
    // Ocultar todas las vistas
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    
    // Mostrar vista solicitada
    const view = document.getElementById(viewName + 'View');
    if (view) {
        view.classList.add('active');
        currentView = viewName;
        
        // Mostrar/ocultar header según la vista
        const header = document.getElementById('mainHeader');
        if (viewName === 'login') {
            header.style.display = 'none';
        } else {
            header.style.display = 'block';
        }
        
        // Cargar datos específicos de la vista
        loadViewData(viewName);
    }
}

function loadViewData(viewName) {
    switch(viewName) {
        case 'dashboard':
            cargarDashboard();
            break;
        case 'digitadorPaso1':
            inicializarPaso1();
            break;
        case 'digitadorPaso4':
            mostrarResumen();
            break;
        case 'reporteEjecutivo':
            cargarReporteEjecutivo();
            break;
        case 'reporteDetallado':
            cargarReporteDetallado();
            break;
        case 'ranking':
            cargarRanking();
            break;
    }
}

// ========== AUTENTICACIÓN ==========
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = e.target.querySelector('button[type="submit"]');
    const loginText = document.getElementById('loginText');
    const loginLoading = document.getElementById('loginLoading');
    const messageEl = document.getElementById('loginMessage');
    
    // Mostrar loading
    loginText.style.display = 'none';
    loginLoading.style.display = 'flex';
    loginBtn.disabled = true;
    messageEl.style.display = 'none';
    
    try {
        // Intentar login
        const { data, error } = await window.supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        // Obtener perfil del usuario
        const { data: profile } = await window.supabase
            .from('usuarios')
            .select('rol, cuartel_codigo, nombre')
            .eq('email', email)
            .single();
        
        if (!profile) {
            throw new Error('Usuario no encontrado en el sistema');
        }
        
        // Guardar usuario actual
        currentUser = {
            email: data.user.email,
            rol: profile.rol,
            cuartel_codigo: profile.cuartel_codigo,
            nombre: profile.nombre
        };
        
        // Guardar en localStorage
        localStorage.setItem('sicof_user', JSON.stringify(currentUser));
        
        // Actualizar header
        updateHeader();
        
        // Redirigir según rol
        switch(profile.rol) {
            case 'digitador':
                showView('digitadorPaso1');
                break;
            case 'jefatura':
                showView('dashboard');
                break;
            default:
                showView('dashboard');
        }
        
    } catch (error) {
        messageEl.innerHTML = `<strong>Error de autenticación</strong><p>${error.message}</p>`;
        messageEl.className = 'alert alert-danger';
        messageEl.style.display = 'block';
        
        loginText.style.display = 'flex';
        loginLoading.style.display = 'none';
        loginBtn.disabled = false;
        
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }
}

async function logout() {
    try {
        await window.supabase.auth.signOut();
        localStorage.clear();
        currentUser = null;
        servicioTemp = { paso1: null, paso2: null, paso3: null };
        showView('login');
    } catch (error) {
        console.error('Error cerrando sesión:', error);
    }
}

function updateHeader() {
    if (currentUser) {
        document.getElementById('headerUser').textContent = `${currentUser.rol.toUpperCase()} - ${currentUser.email}`;
        
        if (currentUser.cuartel_codigo) {
            const cuartel = window.SICOF_CONFIG.cuarteles.find(c => c.codigo === currentUser.cuartel_codigo);
            if (cuartel) {
                document.getElementById('headerCuartel').textContent = cuartel.nombre;
            }
        } else {
            document.getElementById('headerCuartel').textContent = 'JEFATURA GENERAL';
        }
    }
}

// ========== UTILIDADES ==========
function formatFecha(fecha) {
    if (!fecha) return '-';
    const date = new Date(fecha + 'T00:00:00');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-CL', options);
}

function formatHora(hora) {
    if (!hora) return '-';
    return hora.substring(0, 5);
}

function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatPorcentaje(valor) {
    if (valor === null || valor === undefined) return '0%';
    return `${Math.round(valor)}%`;
}

function getBadgeByPercentage(percentage) {
    if (percentage >= 80) return 'badge-success';
    if (percentage >= 60) return 'badge-warning';
    return 'badge-danger';
}

function getDateRange(period) {
    const today = new Date();
    const startDate = new Date();
    
    switch(period) {
        case 'mes':
            startDate.setMonth(today.getMonth() - 1);
            break;
        case 'trimestre':
            startDate.setMonth(today.getMonth() - 3);
            break;
        case 'semestre':
            startDate.setMonth(today.getMonth() - 6);
            break;
        case 'ano':
            startDate.setFullYear(today.getFullYear() - 1);
            break;
        default:
            startDate.setMonth(today.getMonth() - 1);
    }
    
    return {
        start: startDate.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
    };
}

function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ========== DASHBOARD ==========
async function cargarDashboard() {
    try {
        const fechas = getDateRange('mes');
        
        const { data, error } = await window.supabase
            .from('servicios')
            .select('*')
            .gte('fecha', fechas.start)
            .lte('fecha', fechas.end);
        
        if (error) throw error;
        
        // Calcular estadísticas
        const stats = {
            totalServicios: data.length,
            totalControles: 0,
            totalInfracciones: 0,
            totalDetenidos: 0
        };
        
        data.forEach(s => {
            stats.totalControles += (s.controles_investigativos || 0) + (s.controles_preventivos || 0) + 
                                    (s.controles_migratorios || 0) + (s.controles_vehiculares || 0);
            stats.totalInfracciones += (s.infracciones_transito || 0) + (s.otras_infracciones || 0);
            stats.totalDetenidos += (s.detenidos_cantidad || 0);
        });
        
        // Actualizar UI
        document.getElementById('totalServicios').textContent = formatNumber(stats.totalServicios);
        document.getElementById('totalControles').textContent = formatNumber(stats.totalControles);
        document.getElementById('totalInfracciones').textContent = formatNumber(stats.totalInfracciones);
        document.getElementById('totalDetenidos').textContent = formatNumber(stats.totalDetenidos);
        
    } catch (error) {
        console.error('Error cargando dashboard:', error);
        showToast('Error al cargar datos del dashboard', 'danger');
    }
}

// ========== DIGITADOR - PASO 1 ==========
function inicializarPaso1() {
    // Cargar cuarteles
    const select = document.getElementById('p1_cuartel');
    if (currentUser.rol === 'digitador' && currentUser.cuartel_codigo) {
        const cuartel = window.SICOF_CONFIG.cuarteles.find(c => c.codigo === currentUser.cuartel_codigo);
        if (cuartel) {
            select.innerHTML = `<option value="${cuartel.codigo}">${cuartel.nombre}</option>`;
            select.disabled = true;
        }
    } else {
        select.innerHTML = '<option value="">Seleccionar cuartel...</option>' +
            window.SICOF_CONFIG.cuarteles.map(c => 
                `<option value="${c.codigo}">${c.nombre}</option>`
            ).join('');
    }
    
    // Establecer fecha actual
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('p1_fecha').value = hoy;
    
    // Cargar datos guardados si existen
    if (servicioTemp.paso1) {
        document.getElementById('p1_fecha').value = servicioTemp.paso1.fecha;
        document.getElementById('p1_cuartel').value = servicioTemp.paso1.cuartel_codigo;
        document.getElementById('p1_nombre').value = servicioTemp.paso1.nombre_servicio;
        document.getElementById('p1_jefe').value = servicioTemp.paso1.jefe_servicio;
        document.getElementById('p1_inicio').value = servicioTemp.paso1.horario_inicio;
        document.getElementById('p1_termino').value = servicioTemp.paso1.horario_termino;
    }
}

function handlePaso1Submit(e) {
    e.preventDefault();
    
    const formData = {
        fecha: document.getElementById('p1_fecha').value,
        cuartel_codigo: document.getElementById('p1_cuartel').value,
        nombre_servicio: document.getElementById('p1_nombre').value,
        jefe_servicio: document.getElementById('p1_jefe').value,
        horario_inicio: document.getElementById('p1_inicio').value,
        horario_termino: document.getElementById('p1_termino').value
    };
    
    // Validar horarios
    if (formData.horario_inicio >= formData.horario_termino) {
        showToast('El horario de término debe ser posterior al de inicio', 'danger');
        return;
    }
    
    // Guardar datos
    servicioTemp.paso1 = formData;
    
    // Ir al paso 2
    showView('digitadorPaso2');
}

// ========== DIGITADOR - PASO 2 ==========
function handlePaso2Submit(e) {
    e.preventDefault();
    
    const formData = {
        controles_investigativos: parseInt(document.getElementById('p2_inv').value) || 0,
        controles_preventivos: parseInt(document.getElementById('p2_prev').value) || 0,
        controles_migratorios: parseInt(document.getElementById('p2_mig').value) || 0,
        controles_vehiculares: parseInt(document.getElementById('p2_veh').value) || 0,
        infracciones_transito: parseInt(document.getElementById('p2_trans').value) || 0,
        otras_infracciones: parseInt(document.getElementById('p2_otras').value) || 0,
        detenidos_cantidad: parseInt(document.getElementById('p2_det').value) || 0,
        motivo_detencion: document.getElementById('p2_motivo').value,
        denuncias_vulneracion: parseInt(document.getElementById('p2_vuln').value) || 0
    };
    
    // Validar motivo si hay detenidos
    if (formData.detenidos_cantidad > 0 && !formData.motivo_detencion) {
        showToast('Si hay detenidos, debe especificar el motivo', 'danger');
        return;
    }
    
    // Guardar datos
    servicioTemp.paso2 = formData;
    
    // Ir al paso 3
    showView('digitadorPaso3');
}

// ========== DIGITADOR - PASO 3 ==========
function handlePaso3Submit(e) {
    e.preventDefault();
    
    const formData = {
        hitos_planificados: parseInt(document.getElementById('p3_hitos_plan').value) || 0,
        hitos_realizados: parseInt(document.getElementById('p3_hitos_real').value) || 0,
        pnh_planificados: parseInt(document.getElementById('p3_pnh_plan').value) || 0,
        pnh_realizados: parseInt(document.getElementById('p3_pnh_real').value) || 0,
        sitios_planificados: parseInt(document.getElementById('p3_sitios_plan').value) || 0,
        sitios_realizados: parseInt(document.getElementById('p3_sitios_real').value) || 0,
        observaciones: document.getElementById('p3_obs').value
    };
    
    // Validar que no se realice más de lo planificado
    if (formData.hitos_realizados > formData.hitos_planificados) {
        const msg = document.getElementById('paso3Message');
        msg.innerHTML = 'No puede realizar más hitos de los planificados';
        msg.className = 'alert alert-danger';
        msg.style.display = 'block';
        return;
    }
    
    if (formData.pnh_realizados > formData.pnh_planificados) {
        const msg = document.getElementById('paso3Message');
        msg.innerHTML = 'No puede realizar más PNH de los planificados';
        msg.className = 'alert alert-danger';
        msg.style.display = 'block';
        return;
    }
    
    if (formData.sitios_realizados > formData.sitios_planificados) {
        const msg = document.getElementById('paso3Message');
        msg.innerHTML = 'No puede realizar más sitios de los planificados';
        msg.className = 'alert alert-danger';
        msg.style.display = 'block';
        return;
    }
    
    // Guardar datos
    servicioTemp.paso3 = formData;
    
    // Ir al paso 4 (resumen)
    showView('digitadorPaso4');
}

// ========== DIGITADOR - PASO 4 (RESUMEN) ==========
function mostrarResumen() {
    const p1 = servicioTemp.paso1;
    const p2 = servicioTemp.paso2;
    const p3 = servicioTemp.paso3;
    
    if (!p1 || !p2 || !p3) {
        showToast('Datos incompletos', 'danger');
        showView('digitadorPaso1');
        return;
    }
    
    // Calcular estadísticas
    const totalControles = p2.controles_investigativos + p2.controles_preventivos + 
                          p2.controles_migratorios + p2.controles_vehiculares;
    const totalInfracciones = p2.infracciones_transito + p2.otras_infracciones;
    
    const cumplimientoHitos = p3.hitos_planificados > 0 
        ? Math.round((p3.hitos_realizados / p3.hitos_planificados) * 100) 
        : 0;
    const cumplimientoPNH = p3.pnh_planificados > 0 
        ? Math.round((p3.pnh_realizados / p3.pnh_planificados) * 100) 
        : 0;
    const cumplimientoSitios = p3.sitios_planificados > 0 
        ? Math.round((p3.sitios_realizados / p3.sitios_planificados) * 100) 
        : 0;
    
    const cuartel = window.SICOF_CONFIG.cuarteles.find(c => c.codigo === p1.cuartel_codigo);
    
    const html = `
        <div class="form-section">
            <h3 class="section-title"><span class="section-icon">📋</span>RESUMEN DEL SERVICIO</h3>
            
            <div class="grid grid-2">
                <div>
                    <p><strong>Fecha:</strong> ${formatFecha(p1.fecha)}</p>
                    <p><strong>Cuartel:</strong> ${cuartel ? cuartel.nombre : p1.cuartel_codigo}</p>
                    <p><strong>Servicio:</strong> ${p1.nombre_servicio}</p>
                    <p><strong>Jefe:</strong> ${p1.jefe_servicio}</p>
                    <p><strong>Horario:</strong> ${formatHora(p1.horario_inicio)} - ${formatHora(p1.horario_termino)}</p>
                </div>
                <div>
                    <p><strong>Total Controles:</strong> ${formatNumber(totalControles)}</p>
                    <p><strong>Total Infracciones:</strong> ${formatNumber(totalInfracciones)}</p>
                    <p><strong>Total Detenidos:</strong> ${formatNumber(p2.detenidos_cantidad)}</p>
                    <p><strong>Denuncias:</strong> ${formatNumber(p2.denuncias_vulneracion)}</p>
                </div>
            </div>
        </div>
        
        <div class="form-section">
            <h3 class="section-title"><span class="section-icon">📊</span>CUMPLIMIENTO</h3>
            <div class="grid grid-3">
                <div style="text-align: center;">
                    <p><strong>Hitos</strong></p>
                    <div style="font-size: 2rem; color: var(--verde-oficial);">${cumplimientoHitos}%</div>
                    <span class="badge ${getBadgeByPercentage(cumplimientoHitos)}">
                        ${p3.hitos_realizados}/${p3.hitos_planificados}
                    </span>
                </div>
                <div style="text-align: center;">
                    <p><strong>PNH</strong></p>
                    <div style="font-size: 2rem; color: var(--verde-oficial);">${cumplimientoPNH}%</div>
                    <span class="badge ${getBadgeByPercentage(cumplimientoPNH)}">
                        ${p3.pnh_realizados}/${p3.pnh_planificados}
                    </span>
                </div>
                <div style="text-align: center;">
                    <p><strong>Sitios</strong></p>
                    <div style="font-size: 2rem; color: var(--verde-oficial);">${cumplimientoSitios}%</div>
                    <span class="badge ${getBadgeByPercentage(cumplimientoSitios)}">
                        ${p3.sitios_realizados}/${p3.sitios_planificados}
                    </span>
                </div>
            </div>
        </div>
        
        ${p3.observaciones ? `
        <div class="form-section">
            <h3 class="section-title"><span class="section-icon">📝</span>OBSERVACIONES</h3>
            <p>${p3.observaciones}</p>
        </div>
        ` : ''}
    `;
    
    document.getElementById('resumenContainer').innerHTML = html;
}

async function guardarServicioCompleto() {
    try {
        const p1 = servicioTemp.paso1;
        const p2 = servicioTemp.paso2;
        const p3 = servicioTemp.paso3;
        
        if (!p1 || !p2 || !p3) {
            throw new Error('Datos incompletos');
        }
        
        const servicioData = {
            fecha: p1.fecha,
            cuartel_codigo: p1.cuartel_codigo,
            nombre_servicio: p1.nombre_servicio,
            jefe_servicio: p1.jefe_servicio,
            horario_inicio: p1.horario_inicio,
            horario_termino: p1.horario_termino,
            controles_investigativos: p2.controles_investigativos,
            controles_preventivos: p2.controles_preventivos,
            controles_migratorios: p2.controles_migratorios,
            controles_vehiculares: p2.controles_vehiculares,
            infracciones_transito: p2.infracciones_transito,
            otras_infracciones: p2.otras_infracciones,
            detenidos_cantidad: p2.detenidos_cantidad,
            motivo_detencion: p2.motivo_detencion,
            denuncias_vulneracion: p2.denuncias_vulneracion,
            hitos_planificados: p3.hitos_planificados,
            hitos_realizados: p3.hitos_realizados,
            pnh_planificados: p3.pnh_planificados,
            pnh_realizados: p3.pnh_realizados,
            sitios_planificados: p3.sitios_planificados,
            sitios_realizados: p3.sitios_realizados,
            observaciones: p3.observaciones,
            digitador_email: currentUser.email,
            created_at: new Date().toISOString()
        };
        
        const { data, error } = await window.supabase
            .from('servicios')
            .insert([servicioData])
            .select()
            .single();
        
        if (error) throw error;
        
        // Limpiar datos temporales
        servicioTemp = { paso1: null, paso2: null, paso3: null };
        
        // Mostrar éxito
        showToast('✅ Servicio guardado exitosamente', 'success');
        
        // Redirigir al paso 1
        setTimeout(() => {
            showView('digitadorPaso1');
        }, 2000);
        
    } catch (error) {
        console.error('Error guardando servicio:', error);
        showToast('Error al guardar el servicio: ' + error.message, 'danger');
    }
}

// ========== REPORTES ==========
async function cargarReporteEjecutivo() {
    const periodo = document.getElementById('periodoEjecutivo').value;
    const fechas = getDateRange(periodo);
    
    try {
        const { data, error } = await window.supabase
            .from('servicios')
            .select('*')
            .gte('fecha', fechas.start)
            .lte('fecha', fechas.end);
        
        if (error) throw error;
        
        // Agrupar por cuartel
        const porCuartel = {};
        data.forEach(s => {
            if (!porCuartel[s.cuartel_codigo]) {
                porCuartel[s.cuartel_codigo] = {
                    servicios: 0,
                    controles: 0,
                    infracciones: 0,
                    detenidos: 0
                };
            }
            porCuartel[s.cuartel_codigo].servicios++;
            porCuartel[s.cuartel_codigo].controles += 
                (s.controles_investigativos || 0) + (s.controles_preventivos || 0) +
                (s.controles_migratorios || 0) + (s.controles_vehiculares || 0);
            porCuartel[s.cuartel_codigo].infracciones += 
                (s.infracciones_transito || 0) + (s.otras_infracciones || 0);
            porCuartel[s.cuartel_codigo].detenidos += (s.detenidos_cantidad || 0);
        });
        
        // Generar HTML
        let html = '<div class="grid grid-2">';
        Object.keys(porCuartel).forEach(codigo => {
            const cuartel = window.SICOF_CONFIG.cuarteles.find(c => c.codigo === codigo);
            const stats = porCuartel[codigo];
            html += `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">${cuartel ? cuartel.nombre : codigo}</h3>
                    </div>
                    <div class="card-body">
                        <p><strong>Servicios:</strong> ${formatNumber(stats.servicios)}</p>
                        <p><strong>Controles:</strong> ${formatNumber(stats.controles)}</p>
                        <p><strong>Infracciones:</strong> ${formatNumber(stats.infracciones)}</p>
                        <p><strong>Detenidos:</strong> ${formatNumber(stats.detenidos)}</p>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        document.getElementById('reporteEjecutivoContent').innerHTML = html;
        
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al cargar reporte ejecutivo', 'danger');
    }
}

async function cargarReporteDetallado() {
    const fechaInicio = document.getElementById('filtroFechaInicio').value;
    const fechaFin = document.getElementById('filtroFechaFin').value;
    const cuartel = document.getElementById('filtroCuartel').value;
    
    try {
        let query = window.supabase.from('servicios').select('*').order('fecha', { ascending: false });
        
        if (fechaInicio) query = query.gte('fecha', fechaInicio);
        if (fechaFin) query = query.lte('fecha', fechaFin);
        if (cuartel) query = query.eq('cuartel_codigo', cuartel);
        
        const { data, error } = await query;
        if (error) throw error;
        
        // Generar tabla
        let html = `
            <div class="ranking-table">
                <div class="ranking-row header">
                    <div>Fecha</div>
                    <div>Cuartel</div>
                    <div>Servicio</div>
                    <div>Controles</div>
                    <div>Infracciones</div>
                    <div>Detenidos</div>
                </div>
        `;
        
        data.forEach(s => {
            const cuartelInfo = window.SICOF_CONFIG.cuarteles.find(c => c.codigo === s.cuartel_codigo);
            const totalControles = (s.controles_investigativos || 0) + (s.controles_preventivos || 0) +
                                  (s.controles_migratorios || 0) + (s.controles_vehiculares || 0);
            const totalInfracciones = (s.infracciones_transito || 0) + (s.otras_infracciones || 0);
            
            html += `
                <div class="ranking-row">
                    <div>${formatFecha(s.fecha)}</div>
                    <div>${cuartelInfo ? cuartelInfo.nombre : s.cuartel_codigo}</div>
                    <div>${s.nombre_servicio}</div>
                    <div style="text-align: center;">${formatNumber(totalControles)}</div>
                    <div style="text-align: center;">${formatNumber(totalInfracciones)}</div>
                    <div style="text-align: center;">${formatNumber(s.detenidos_cantidad || 0)}</div>
                </div>
            `;
        });
        
        html += '</div>';
        document.getElementById('reporteDetalladoContent').innerHTML = html;
        
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al cargar reporte detallado', 'danger');
    }
}

async function cargarRanking() {
    const periodo = document.getElementById('periodoRanking').value;
    const fechas = getDateRange(periodo);
    
    try {
        const { data, error } = await window.supabase
            .from('servicios')
            .select('*')
            .gte('fecha', fechas.start)
            .lte('fecha', fechas.end);
        
        if (error) throw error;
        
        // Calcular ranking
        const porCuartel = {};
        data.forEach(s => {
            if (!porCuartel[s.cuartel_codigo]) {
                porCuartel[s.cuartel_codigo] = {
                    codigo: s.cuartel_codigo,
                    servicios: 0,
                    controles: 0,
                    cumplimiento: []
                };
            }
            
            porCuartel[s.cuartel_codigo].servicios++;
            porCuartel[s.cuartel_codigo].controles += 
                (s.controles_investigativos || 0) + (s.controles_preventivos || 0) + 
                (s.controles_migratorios || 0) + (s.controles_vehiculares || 0);
            
            if (s.hitos_planificados > 0 || s.pnh_planificados > 0 || s.sitios_planificados > 0) {
                const cum = (
                    (s.hitos_planificados > 0 ? (s.hitos_realizados / s.hitos_planificados) * 100 : 0) +
                    (s.pnh_planificados > 0 ? (s.pnh_realizados / s.pnh_planificados) * 100 : 0) +
                    (s.sitios_planificados > 0 ? (s.sitios_realizados / s.sitios_planificados) * 100 : 0)
                ) / 3;
                porCuartel[s.cuartel_codigo].cumplimiento.push(cum);
            }
        });
        
        const ranking = Object.values(porCuartel).map(c => {
            const cumProm = c.cumplimiento.length > 0 
                ? c.cumplimiento.reduce((a, b) => a + b, 0) / c.cumplimiento.length 
                : 0;
            const puntuacion = (c.servicios * 10) + (c.controles * 2) + cumProm;
            return { ...c, cumplimientoPromedio: cumProm, puntuacion };
        });
        
        ranking.sort((a, b) => b.puntuacion - a.puntuacion);
        
        // Generar HTML
        const maxPuntuacion = ranking.length > 0 ? ranking[0].puntuacion : 100;
        let html = `
            <div class="ranking-table">
                <div class="ranking-row header">
                    <div>Pos.</div>
                    <div>Cuartel</div>
                    <div style="text-align: center;">Servicios</div>
                    <div style="text-align: center;">Controles</div>
                    <div style="text-align: center;">Cumplimiento</div>
                    <div style="text-align: center;">Puntuación</div>
                </div>
        `;
        
        ranking.forEach((c, index) => {
            const cuartelInfo = window.SICOF_CONFIG.cuarteles.find(cu => cu.codigo === c.codigo);
            const nombre = cuartelInfo ? cuartelInfo.nombre : c.codigo;
            const positionClass = index < 3 ? `position-${index + 1}` : '';
            const scorePercent = (c.puntuacion / maxPuntuacion) * 100;
            
            html += `
                <div class="ranking-row">
                    <div class="ranking-position ${positionClass}">
                        ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </div>
                    <div>
                        <strong>${nombre}</strong>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${scorePercent}%"></div>
                        </div>
                    </div>
                    <div style="text-align: center;">${formatNumber(c.servicios)}</div>
                    <div style="text-align: center;">${formatNumber(c.controles)}</div>
                    <div style="text-align: center;">
                        <span class="badge ${getBadgeByPercentage(c.cumplimientoPromedio)}">
                            ${formatPorcentaje(c.cumplimientoPromedio)}
                        </span>
                    </div>
                    <div style="text-align: center; font-weight: bold; color: var(--verde-oficial);">
                        ${Math.round(c.puntuacion)}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        document.getElementById('rankingContent').innerHTML = html;
        
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al cargar ranking', 'danger');
    }
}

function exportarCSV() {
    showToast('Exportación CSV - Funcionalidad en desarrollo', 'info');
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    // Configurar event listeners
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const paso1Form = document.getElementById('paso1Form');
    if (paso1Form) {
        paso1Form.addEventListener('submit', handlePaso1Submit);
    }
    
    const paso2Form = document.getElementById('paso2Form');
    if (paso2Form) {
        paso2Form.addEventListener('submit', handlePaso2Submit);
    }
    
    const paso3Form = document.getElementById('paso3Form');
    if (paso3Form) {
        paso3Form.addEventListener('submit', handlePaso3Submit);
    }
    
    // Cargar cuarteles en filtros
    const filtroCuartel = document.getElementById('filtroCuartel');
    if (filtroCuartel) {
        filtroCuartel.innerHTML = '<option value="">Todos</option>' +
            window.SICOF_CONFIG.cuarteles.map(c => 
                `<option value="${c.codigo}">${c.nombre}</option>`
            ).join('');
    }
    
    // Auto-focus en email del login
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.focus();
    }
    
    // Verificar sesión existente
    checkExistingSession();
});

async function checkExistingSession() {
    const storedUser = localStorage.getItem('sicof_user');
    if (storedUser) {
        try {
            const { data: { session }, error } = await window.supabase.auth.getSession();
            if (session && !error) {
                currentUser = JSON.parse(storedUser);
                updateHeader();
                
                // Redirigir según rol
                if (currentUser.rol === 'digitador') {
                    showView('digitadorPaso1');
                } else {
                    showView('dashboard');
                }
            } else {
                localStorage.clear();
                showView('login');
            }
        } catch (error) {
            console.error('Error verificando sesión:', error);
            localStorage.clear();
            showView('login');
        }
    } else {
        showView('login');
    }
}

// Listener para cambios de autenticación
window.supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
        localStorage.clear();
        currentUser = null;
        showView('login');
    }
});
