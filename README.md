# SICOF - VERSIÓN SIMPLIFICADA 🚀

## Sistema Integrado de Control Operativo Fronterizo
**Carabineros de Chile - Especialidad Montaña y Fronteras**

---

## 📦 ESTRUCTURA SIMPLIFICADA

```
sicof-simplificado/
├── index.html              # ¡TODO EN UNO! Login + Dashboard + Digitador + Reportes
├── css/
│   └── styles.css          # CSS consolidado con responsive integrado
├── js/
│   ├── config.js           # Configuración de Supabase y constantes
│   └── app.js              # Toda la lógica de la aplicación
└── assets/
    └── logos/              # Logos institucionales
        ├── escudo-carabineros.png
        └── favicon.ico
```

**REDUCCIÓN:** De ~20+ archivos a solo **4 archivos principales** + assets

---

## ✨ FUNCIONALIDADES COMPLETAS

### ✅ Todo lo que tenía el proyecto original:

1. **🔐 Autenticación**
   - Login con Supabase
   - Gestión de sesiones
   - Roles: Digitador, Jefe, Admin, Jefatura

2. **📝 Digitador (4 Pasos)**
   - Paso 1: Datos del servicio
   - Paso 2: Demanda ciudadana (controles, infracciones, detenidos)
   - Paso 3: Demanda preventiva (hitos, PNH, sitios)
   - Paso 4: Confirmación y guardado

3. **📊 Dashboard Jefatura**
   - KPIs principales
   - Acceso rápido a reportes

4. **📈 Reportes**
   - Reporte Ejecutivo (por cuartel)
   - Reporte Detallado (listado completo)
   - Ranking de Cuarteles

5. **🎨 Diseño Institucional**
   - Colores oficiales de Carabineros
   - Responsive: Móvil, Tablet, Desktop
   - Animaciones y transiciones suaves

---

## 🚀 INSTALACIÓN RÁPIDA

### 1. Configurar Supabase

Editar `/js/config.js` con tus credenciales:

```javascript
const SUPABASE_URL = "TU_URL_AQUI";
const SUPABASE_ANON_KEY = "TU_KEY_AQUI";
```

### 2. Crear Tablas en Supabase

#### Tabla: `usuarios`
```sql
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL CHECK (rol IN ('digitador', 'jefe', 'admin', 'jefatura')),
    cuartel_codigo TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla: `cuarteles`
```sql
CREATE TABLE cuarteles (
    codigo TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla: `servicios`
```sql
CREATE TABLE servicios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha DATE NOT NULL,
    cuartel_codigo TEXT NOT NULL,
    nombre_servicio TEXT NOT NULL,
    jefe_servicio TEXT NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_termino TIME NOT NULL,
    
    -- Demanda Ciudadana
    controles_investigativos INTEGER DEFAULT 0,
    controles_preventivos INTEGER DEFAULT 0,
    controles_migratorios INTEGER DEFAULT 0,
    controles_vehiculares INTEGER DEFAULT 0,
    infracciones_transito INTEGER DEFAULT 0,
    otras_infracciones INTEGER DEFAULT 0,
    detenidos_cantidad INTEGER DEFAULT 0,
    motivo_detencion TEXT,
    denuncias_vulneracion INTEGER DEFAULT 0,
    
    -- Demanda Preventiva
    hitos_planificados INTEGER DEFAULT 0,
    pnh_planificados INTEGER DEFAULT 0,
    sitios_planificados INTEGER DEFAULT 0,
    hitos_realizados INTEGER DEFAULT 0,
    pnh_realizados INTEGER DEFAULT 0,
    sitios_realizados INTEGER DEFAULT 0,
    observaciones TEXT,
    
    -- Metadata
    digitador_email TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (cuartel_codigo) REFERENCES cuarteles(codigo)
);
```

### 3. Insertar Cuarteles

```sql
INSERT INTO cuarteles (codigo, nombre) VALUES
('CHA', '4ta. Com. Chacalluta (F)'),
('VIS', 'Tcia Visviri (F)'),
('CHU', 'Tcia Chungara (F)'),
('ALC', 'R. Alcerreca (F)'),
('TAC', 'R. Tacora (F)'),
('CAQ', 'R. Caquena (F)'),
('CHUY', 'R. Chucuyo (F)'),
('GUA', 'R. Guallatire (F)'),
('CHIL', 'R. Chilcaya (F)');
```

### 4. Crear Usuario de Prueba

En Supabase Authentication, crear un usuario y luego:

```sql
INSERT INTO usuarios (email, nombre, rol, cuartel_codigo) VALUES
('digitador@carabineros.cl', 'Juan Pérez', 'digitador', 'CHA'),
('jefatura@carabineros.cl', 'María González', 'jefatura', NULL);
```

### 5. Desplegar

**Opción A: Local**
```bash
# Con Python
python -m http.server 8000

# Con Node
npx serve
```

**Opción B: Vercel/Netlify**
- Subir carpeta a GitHub
- Conectar con Vercel/Netlify
- ¡Listo!

---

## 🎯 MEJORAS DE LA VERSIÓN SIMPLIFICADA

### ✅ Ventajas sobre la versión original:

1. **📉 Reducción drástica de archivos**
   - Antes: 20+ archivos HTML/CSS/JS
   - Ahora: 4 archivos principales

2. **⚡ Navegación más rápida**
   - SPA (Single Page Application)
   - Sin recargas de página
   - Transiciones suaves

3. **🔧 Mantenimiento más fácil**
   - Todo el código en lugares centralizados
   - CSS consolidado con media queries integradas
   - JS modular pero en un solo archivo

4. **📱 Mismo responsive**
   - Mantiene todo el diseño adaptativo
   - Mobile, Tablet, Desktop

5. **🎨 Mismo estilo institucional**
   - Colores oficiales
   - Identidad visual preservada

---

## 🔑 CREDENCIALES DE PRUEBA

Una vez configurado, puedes usar:

- **Email:** digitador@carabineros.cl
- **Password:** (el que configures en Supabase Auth)

---

## 📋 FLUJO DE TRABAJO

### Digitador:
1. Login → Paso 1 (Datos) → Paso 2 (Demanda) → Paso 3 (Preventiva) → Paso 4 (Confirmar)

### Jefatura:
1. Login → Dashboard → Acceso a todos los reportes

---

## 🎨 PALETA DE COLORES

```css
--verde-oficial: #0b6b3a       /* Color principal */
--verde-oscuro: #084c2a         /* Variante oscura */
--verde-claro: #e6f2ec          /* Fondos */
--verde-exito: #27ae60          /* Éxitos */
--rojo-alerta: #e74c3c          /* Alertas */
--naranja-advertencia: #e67e22  /* Advertencias */
```

---

## 🔒 SEGURIDAD

- ✅ Autenticación con Supabase
- ✅ Validación de roles
- ✅ Sesiones seguras
- ✅ Validación de datos en frontend
- ✅ RLS en Supabase (configurar en backend)

---

## 📱 RESPONSIVE

### Mobile (<768px)
- Navegación adaptada
- Formularios en columna única
- Botones de ancho completo

### Tablet (768-1024px)
- Grid de 2 columnas
- Elementos optimizados

### Desktop (>1024px)
- Grid de 4 columnas
- Experiencia completa

---

## 🐛 SOLUCIÓN DE PROBLEMAS

**Error de conexión a Supabase:**
- Verificar URL y API Key en `js/config.js`
- Revisar consola del navegador (F12)

**Usuario no puede ingresar:**
- Crear usuario en Supabase Auth
- Insertar registro en tabla `usuarios`

**Estilos no cargan:**
- Verificar ruta de `css/styles.css`
- Revisar consola del navegador

---

## 📞 INFORMACIÓN DEL PROYECTO

- **Versión:** 2.0 Simplificada
- **Fecha:** Enero 2026
- **Desarrollado para:** Carabineros de Chile - Especialidad Montaña y Fronteras
- **Stack:** HTML5, CSS3, JavaScript Vanilla, Supabase

---

## 🎉 ¡LISTO PARA USAR!

El sistema está 100% funcional y simplificado. Todas las características originales están presentes pero en una estructura mucho más mantenible y eficiente.

**¿Dudas o problemas?**
Revisa la consola del navegador (F12) para ver logs y errores.

---

© 2026 Carabineros de Chile. Todos los derechos reservados.
