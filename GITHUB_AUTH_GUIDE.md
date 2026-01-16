# 🔑 GitHub Authentication for SCORTA Deployment

## El repositorio fue creado: ✅
**URL**: https://github.com/Scortaadmin/scorta-app

## Problema Actual
El comando `git push` requiere autenticación con GitHub.

---

## Solución Rápida: Usar GitHub CLI

### Paso 1: Instalar GitHub CLI
```bash
brew install gh
```

### Paso 2: Autenticarse
```bash
gh auth login
```

Selecciona:
- GitHub.com
- HTTPS
- Login with a web browser
- Sigue las instrucciones en el navegador

### Paso 3: Hacer Push
```bash
cd /Users/dircreativobda/.gemini/antigravity/scratch/scorta-app
git push -u origin main
```

---

## Alternativa: Token de Acceso Personal

Si prefieres usar un token:

1. Ve a: https://github.com/settings/tokens
2. "Generate new token" → "Generate new token (classic)"
3. Nombre: "SCORTA Deployment"
4. Scope: marca `repo` (full control)
5. "Generate token"
6. **COPIA EL TOKEN** (solo se muestra una vez)

Luego en la terminal:
```bash
git push -u origin main
# Username: Scortaadmin
# Password: <pega tu token aquí>
```

---

## ¿Qué Prefieres?

Opción 1 (GitHub CLI) es más rápida y segura.
Opción 2 (Token) funciona pero el token debe guardarse de forma segura.

**Siguiente paso**: Una vez que el push funcione, continuaremos con Railway y Vercel.
