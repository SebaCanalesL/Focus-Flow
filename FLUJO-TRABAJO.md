# 🚀 Tu Flujo de Trabajo Optimizado - Focus Flow

## ⚡ Comandos Esenciales (Usa estos diariamente)

### 🏃‍♂️ Inicio Rápido
```bash
# Opción 1: Todo automático (recomendado)
npm run dev:all

# Opción 2: Con helper inteligente
npm run dev:helper --quick

# Opción 3: Manual paso a paso
npm run emu:pre
firebase emulators:start --only hosting,firestore,auth,storage
npm run dev          # En otra terminal
npm run dev:setup    # En otra terminal
```

### 🧹 Limpieza y Reset
```bash
# Limpiar todo y empezar de nuevo
npm run emu:reset

# Solo limpiar emuladores
npm run emu:clean
```

### 🧪 Testing
```bash
# Tests completos
npm run test

# Tests con UI
npm run test:ui

# Solo verificar tipos y linting
npm run precommit
```

### 🚀 Deploy
```bash
# Deploy a staging
npm run deploy:staging

# Deploy a producción
npm run deploy:prod
```

## 📋 Flujo Diario Recomendado

### 🌅 Inicio del Día
1. **Abrir terminal y ejecutar:**
   ```bash
   npm run dev:all
   ```

2. **En otra terminal, cargar datos:**
   ```bash
   npm run dev:setup
   ```

3. **Abrir navegador:**
   - App: http://localhost:3000
   - Emuladores: http://localhost:4000

### 💻 Durante el Desarrollo
1. **Crear rama para nueva feature:**
   ```bash
   git checkout -b feature/nombre-feature
   ```

2. **Desarrollar normalmente:**
   - Editar código
   - Ver cambios en tiempo real
   - Usar datos de desarrollo

3. **Antes de commit:**
   ```bash
   npm run precommit
   ```

4. **Commit y push:**
   ```bash
   git add .
   git commit -m "feat: descripción"
   git push origin feature/nombre-feature
   ```

### 🌆 Final del Día
1. **Parar emuladores:**
   ```bash
   npm run emu:stop
   ```

2. **Commit cambios pendientes**

## 🎯 Flujo por Feature

### 1. Nueva Funcionalidad
```bash
# Crear rama
git checkout -b feature/nueva-funcionalidad

# Desarrollo
npm run dev:all
# ... desarrollar ...

# Testing
npm run precommit
npm run test

# Deploy a staging
git push origin staging
```

### 2. Bug Fix
```bash
# Crear rama
git checkout -b fix/descripcion-bug

# Desarrollo
npm run dev:all
# ... arreglar bug ...

# Testing
npm run precommit
npm run test

# Deploy
git push origin staging
```

### 3. Hotfix (Urgente)
```bash
# Desde staging
git checkout staging
git pull origin staging

# Crear hotfix
git checkout -b hotfix/descripcion

# Desarrollo rápido
npm run dev:all
# ... arreglar ...

# Deploy directo
git push origin staging
```

## 🔧 Herramientas Útiles

### Dev Helper (Nuevo)
```bash
# Ver todas las opciones
npm run dev:helper --help

# Verificar ambiente
npm run dev:helper

# Inicio rápido
npm run dev:helper --quick

# Limpiar ambiente
npm run dev:helper --clean

# Ejecutar tests
npm run dev:helper --test

# Deploy
npm run dev:helper --deploy staging
npm run dev:helper --deploy prod
```

### URLs Importantes
- **App Local**: http://localhost:3000
- **Emuladores UI**: http://localhost:4000
- **Firestore**: http://localhost:4000/firestore
- **Auth**: http://localhost:4000/auth
- **Storage**: http://localhost:4000/storage

### Usuario de Desarrollo
- **Email**: dev@focusflow.com
- **Password**: devpassword123

## 🚨 Troubleshooting Rápido

### Emuladores no inician
```bash
npm run emu:pre
npm run dev:all
```

### Datos no cargan
```bash
npm run emu:reset
```

### Build falla
```bash
npm run typecheck
npm run lint
```

### Deploy falla
```bash
firebase login
firebase projects:list
```

## 📊 Monitoreo

### Logs
- **Emuladores**: http://localhost:4000
- **Firebase Console**: https://console.firebase.google.com
- **App Hosting**: Firebase Console > App Hosting

### Performance
- **Lighthouse**: DevTools > Lighthouse
- **Bundle Analyzer**: `npm run build && npx @next/bundle-analyzer`

## 🎉 ¡Listo!

**Tu comando de inicio diario:**
```bash
npm run dev:all
```

**Tu comando de limpieza:**
```bash
npm run emu:reset
```

**Tu comando de deploy:**
```bash
npm run deploy:staging
```

---

## 📚 Documentación Adicional

- **Guía Completa**: `docs/workflow-guide.md`
- **Blueprint**: `docs/blueprint.md`
- **Scripts**: `scripts/dev-helper.ts`

¡Happy coding! 🚀
