# 🚀 Guía de Flujo de Trabajo - Focus Flow

## 📋 Resumen de la Arquitectura

- **Frontend**: Next.js 15 con App Router
- **Backend**: Firebase Functions + App Hosting
- **Base de Datos**: Firestore (focusflowv2)
- **Autenticación**: Firebase Auth
- **Storage**: Firebase Storage
- **IA**: Google Genkit
- **Testing**: Playwright E2E
- **Deployment**: Firebase App Hosting

## 🛠️ Comandos de Desarrollo

### Inicio Rápido
```bash
# Ambiente completo (recomendado)
npm run dev:all

# Solo frontend
npm run dev

# Solo emuladores
firebase emulators:start
```

### Configuración de Datos
```bash
# Cargar datos de desarrollo
npm run dev:setup

# Solo datos (si emuladores ya están corriendo)
npm run dev:seed
```

### Limpieza
```bash
# Limpiar emuladores
npm run emu:clean

# Parar emuladores
npm run emu:stop
```

## 🔄 Flujo de Desarrollo Diario

### 1. Inicio del Día
```bash
# Opción A: Todo en uno
npm run dev:all

# Opción B: Paso a paso
npm run emu:pre  # Limpiar puertos
firebase emulators:start --only hosting,firestore,auth,storage
npm run dev      # En otra terminal
npm run dev:setup # En otra terminal
```

### 2. Desarrollo de Features
```bash
# Crear rama
git checkout -b feature/nombre-feature

# Desarrollo normal
# - Editar código
# - Ver cambios en http://localhost:3000
# - Ver emuladores en http://localhost:4000

# Testing
npm run typecheck
npm run lint
npx playwright test

# Commit
git add .
git commit -m "feat: descripción"
git push origin feature/nombre-feature
```

### 3. Testing y QA
```bash
# Tests E2E completos
npx playwright test

# Test específico
npx playwright test e2e/habit-creation.spec.ts

# Test con UI
npx playwright test --ui
```

## 🚀 Deployment

### Staging (Automático)
```bash
# Push a staging = deploy automático
git push origin staging

# URLs:
# - App: https://focusflow-staging-[hash].uc.r.appspot.com
# - Emuladores UI: http://localhost:4000 (local)
```

### Producción
```bash
# Merge a main
git checkout main
git merge staging
git push origin main

# Deploy manual si es necesario
firebase deploy --only hosting,functions
```

## 🔧 Configuración de Ambiente

### Variables de Entorno
```bash
# .env.local (crear si no existe)
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

### Usuario de Desarrollo
- **Email**: dev@focusflow.com
- **Password**: devpassword123
- **UID**: dev-user-123

## 📊 Monitoreo y Debugging

### Logs
```bash
# Logs de Firebase Functions
firebase functions:log

# Logs de App Hosting
firebase apphosting:logs

# Logs de emuladores
# Ver en http://localhost:4000
```

### Debugging
```bash
# Debug de Firestore
# Ver en http://localhost:4000/firestore

# Debug de Auth
# Ver en http://localhost:4000/auth

# Debug de Storage
# Ver en http://localhost:4000/storage
```

## 🎯 Mejores Prácticas

### Git Flow
1. **feature/**: Nuevas funcionalidades
2. **staging**: Ambiente de testing
3. **main**: Producción

### Commits
```bash
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formato
refactor: refactoring
test: tests
chore: tareas de mantenimiento
```

### Testing
- Siempre correr `npm run typecheck` antes de commit
- Tests E2E para flujos críticos
- Usar datos de desarrollo consistentes

## 🚨 Troubleshooting

### Problemas Comunes

#### Emuladores no inician
```bash
npm run emu:pre  # Limpiar puertos
npm run dev:all  # Reiniciar
```

#### Datos no cargan
```bash
npm run emu:clean  # Limpiar datos
npm run dev:setup  # Recargar
```

#### Build falla
```bash
npm run typecheck  # Verificar tipos
npm run lint       # Verificar linting
```

#### Deploy falla
```bash
firebase login     # Verificar auth
firebase projects:list  # Verificar proyecto
```

## 📱 URLs Importantes

### Desarrollo Local
- **App**: http://localhost:3000
- **Emuladores UI**: http://localhost:4000
- **Firestore**: http://localhost:4000/firestore
- **Auth**: http://localhost:4000/auth
- **Storage**: http://localhost:4000/storage

### Staging
- **App**: https://focusflow-staging-[hash].uc.r.appspot.com
- **Firebase Console**: https://console.firebase.google.com

### Producción
- **App**: [URL de producción]
- **Firebase Console**: https://console.firebase.google.com

## 🔄 Flujo de IA (Genkit)

```bash
# Desarrollo de IA
npm run genkit:dev

# Watch mode
npm run genkit:watch
```

## 📈 Métricas y Performance

### Monitoreo
- Firebase Performance Monitoring
- Firebase Analytics
- App Hosting metrics

### Optimización
- Bundle analyzer: `npm run build && npx @next/bundle-analyzer`
- Lighthouse: Usar DevTools
- Core Web Vitals: Firebase Performance

---

## 🎉 ¡Listo para Desarrollar!

Con este flujo de trabajo tienes todo lo necesario para desarrollar, testear y deployar Focus Flow de manera eficiente. 

**Comando de inicio rápido:**
```bash
npm run dev:all
```

¡Happy coding! 🚀
