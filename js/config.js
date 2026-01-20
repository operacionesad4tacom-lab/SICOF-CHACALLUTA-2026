// ============================================
// CONFIGURACIÓN SUPABASE SICOF
// ============================================

// Configuración de Supabase (ACTUALIZAR CON TUS DATOS)
const SUPABASE_URL = "https://njgmzbqhskqzrxanffbi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZ216YnFoc2txenJ4YW5mZmJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4OTE3NTcsImV4cCI6MjA4NDQ2Nzc1N30.60t1sGkOElD99clAmCBZceFtulgrzkJZoFhg9TePBZQ";

// Inicializar Supabase en window
window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Configuración de la aplicación
window.SICOF_CONFIG = {
    version: '2.0.0 Simplificado',
    environment: 'production',
    
    // Roles del sistema
    roles: {
        digitador: 'digitador',
        jefe: 'jefe',
        admin: 'admin',
        jefatura: 'jefatura'
    },
    
    // Cuarteles disponibles
    cuarteles: [
        { codigo: 'CHA', nombre: '4ta. Com. Chacalluta (F)' },
        { codigo: 'VIS', nombre: 'Tcia Visviri (F)' },
        { codigo: 'CHU', nombre: 'Tcia Chungara (F)' },
        { codigo: 'ALC', nombre: 'R. Alcerreca (F)' },
        { codigo: 'TAC', nombre: 'R. Tacora (F)' },
        { codigo: 'CAQ', nombre: 'R. Caquena (F)' },
        { codigo: 'CHUY', nombre: 'R. Chucuyo (F)' },
        { codigo: 'GUA', nombre: 'R. Guallatire (F)' },
        { codigo: 'CHIL', nombre: 'R. Chilcaya (F)' }
    ],
    
    // Motivos de detención
    motivosDetencion: [
        { value: 'robo_hurto', label: 'Robo/Hurto' },
        { value: 'drogas', label: 'Drogas' },
        { value: 'contrabando', label: 'Contrabando' },
        { value: 'ley_control_armas', label: 'Ley Control de Armas' },
        { value: 'trafico_migrantes', label: 'Tráfico de Migrantes' },
        { value: 'receptacion_vehiculos', label: 'Receptación de Vehículos' },
        { value: 'otros', label: 'Otros' }
    ]
};

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', () => {
    console.log('SICOF v' + window.SICOF_CONFIG.version + ' inicializado');
    checkSupabaseConnection();
});

// Función para verificar conexión
async function checkSupabaseConnection() {
    try {
        const { data, error } = await window.supabase.from('cuarteles').select('count');
        if (error) throw error;
        console.log('✅ Conexión a Supabase establecida');
    } catch (error) {
        console.error('❌ Error de conexión a Supabase:', error.message);
    }
}
