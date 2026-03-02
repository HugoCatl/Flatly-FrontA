# Flatly — Frontend Angular / Capacitor


> Aplicación móvil para búsqueda y gestión de pisos compartidos para estudiantes.  
> Desarrollada con **Angular 21** y empaquetada para Android mediante **Capacitor 8**.

---

## Índice

1. [Descripción del proyecto](#descripción-del-proyecto)
2. [Tecnologías utilizadas](#tecnologías-utilizadas)
3. [Roles de usuario](#roles-de-usuario)
4. [Funcionalidades principales](#funcionalidades-principales)
5. [Requisitos previos](#requisitos-previos)
6. [Instalación y ejecución](#instalación-y-ejecución)
7. [Compilación Android (APK)](#compilación-android-apk)
8. [Variables de entorno](#variables-de-entorno)
9. [CI/CD — GitHub Actions](#cicd--github-actions)
10. [Equipo](#equipo)

---

## Descripción del proyecto

**Flatly** es una aplicación web progresiva orientada a dispositivos móviles que permite a estudiantes encontrar pisos disponibles, unirse a hogares compartidos y gestionar los gastos del hogar de forma colaborativa.

Los propietarios pueden publicar y administrar sus propiedades directamente desde la app, mientras que los administradores disponen de un panel de control para la gestión global de la plataforma.

La aplicación consume una API REST desarrollada en **Kotlin / Ktor** y se comunica con el backend a través de un proxy configurado en Angular.

---

## Tecnologías utilizadas

| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| Framework frontend | Angular | 21.1.0 |
| Lenguaje | TypeScript | 5.9.2 |
| Empaquetado móvil | Capacitor | 8.0.2 |
| Mapas | Leaflet | 1.9.4 |
| Gráficas | Chart.js + ng2-charts | 4.5.1 / 8.0.0 |
| Programación reactiva | RxJS | 7.8.0 |
| Tests | Vitest | 4.0.8 |
| Estilos | SCSS | — |
| Gestor de paquetes | npm | 10.6.0 |

> Angular 21 se usa en modo **zoneless** (`provideZonelessChangeDetection`) con **componentes standalone** y **signals** para la gestión de estado.


---

## Roles de usuario

| Rol | Descripción |
|-----|-------------|
| `STUDENT` | Puede buscar pisos en el mapa, unirse a un hogar y gestionar gastos compartidos |
| `OWNER` | Puede publicar propiedades, crear hogares y ver sus inquilinos |
| `ADMIN` | Accede al panel de administración: gestión de usuarios, roles y estadísticas globales |

Los roles están definidos en `src/app/models/flatly.ts` mediante el enum `Role`.

---

## Funcionalidades principales

### 🔐 Autenticación
- Registro e inicio de sesión con email y contraseña
- Sesión persistente mediante cookies HTTP-only
- Interceptor HTTP que adjunta credenciales automáticamente a todas las peticiones

### 🗺️ Mapa de propiedades
- Visualización de pisos disponibles sobre un mapa interactivo (Leaflet)
- Filtros en tiempo real: búsqueda por texto, precio máximo y etiquetas
- Ficha de detalle de cada propiedad con la opción de unirse al hogar
- Protección contra unirse a un hogar si el usuario ya pertenece a uno

### 🏠 Dashboard del estudiante
- Resumen mensual de gastos del hogar (total, parte proporcional, porcentaje)
- Lista de facturas pendientes del mes en curso
- Acceso rápido a las secciones de mapa, gastos y chat

### 👤 Perfil
- Consulta y edición de datos personales (nombre, teléfono, avatar)
- Eliminación de cuenta

### 💸 Gastos del hogar
- Listado de facturas del hogar filtrado por mes y año
- Creación de nuevas facturas con tipo, importe total y fecha de vencimiento
- División automática del importe entre los miembros del hogar (`BillSplit`)
- Vista de saldos: quién debe a quién y cuánto
- Estadísticas visuales con gráficas (Chart.js): evolución mensual y distribución por tipo
- Tipos de gasto: `RENT`, `ELECTRICITY`, `WATER`, `INTERNET`, `OTHER`
- Estados: `PENDING`, `PAID`, `OVERDUE`

### 🏢 Dashboard del propietario
- Listado de propiedades propias
- Creación de nuevas propiedades con imágenes, ubicación, precio, habitaciones y etiquetas
- Creación y gestión de hogares vinculados a propiedades
- Consulta de inquilinos actuales

### 🛠️ Panel de administración
- Listado de todos los usuarios de la plataforma
- Cambio de rol de usuarios
- Eliminación de usuarios
- Estadísticas globales de la plataforma
- Gestión de etiquetas (`tags`) de propiedades

### 💬 Chat
- Mensajería entre miembros del hogar

---

## Requisitos previos

- **Node.js** ≥ 20
- **npm** ≥ 10
- **Angular CLI** ≥ 21
- **Java 21** (solo para compilar el APK)
- **Android Studio** con SDK configurado (solo para compilar el APK)

---

## Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd Flatly-FrontA

# 2. Instalar dependencias
npm install

# 3. Arrancar el servidor de desarrollo
ng serve --proxy-config proxy.conf.json
# La aplicación estará disponible en http://localhost:4200
```

> El proxy de desarrollo redirige automáticamente las peticiones a la API backend.  
> Configuración en `proxy.conf.json`.

---

## Compilación Android (APK)

```bash
# 1. Compilar la app web en modo producción
npm run build

# 2. Sincronizar el proyecto Android con Capacitor
npx cap sync android

# 3. Abrir en Android Studio para compilar y firmar
npx cap open android
```

> ⚠️ Antes de `cap sync` en producción, asegúrate de eliminar el bloque `server.url`
> del archivo `capacitor.config.ts` para que la app use el backend real y no el servidor de desarrollo.

---

## Variables de entorno

Los ficheros de entorno se encuentran en `src/environments/`:

| Fichero | Uso |
|---------|-----|
| `environment.ts` | Producción — `apiUrl` apunta al backend desplegado |
| `environment.development.ts` | Desarrollo — `apiUrl` usa el proxy local |

```typescript
// environment.development.ts (ejemplo)
export const environment = {
  production: false,
  apiUrl: ''   // vacío: usa el proxy de Angular (proxy.conf.json)
};
```

---

## CI/CD — GitHub Actions

El repositorio incluye un workflow en `.github/workflows/build-apk.yml` que construye automáticamente un **APK de debug** de Android.

**Se ejecuta en:**
- Push a las ramas `main`, `Saul` o `saul2`
- Manualmente desde la pestaña *Actions* de GitHub (`workflow_dispatch`)

**Pasos del pipeline:**
1. Checkout del código
2. Configuración de Node.js 22 y JDK 21
3. Instalación de dependencias (`npm ci`)
4. Compilación Angular (`ng build`)
5. Parcheo de `capacitor.config.ts` (elimina `server.url` del entorno de desarrollo)
6. Sincronización con Capacitor (`cap sync android`)
7. Compilación del APK con Gradle (`assembleDebug`)
8. Subida del APK como artefacto de GitHub Actions

---

## Equipo

| Área | Integrantes |
|------|-------------|
| **Frontend** — Angular / Capacitor | Hugo, Paula, Pablo, Saul |
| **Backend** — Kotlin / Ktor | Hugo, Pablo, Alejandro |
