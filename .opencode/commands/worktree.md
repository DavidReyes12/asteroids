---
description: Crea un worktree git en .worktrees/<nombre> a partir del argumento
---

Crea un worktree git a partir de este argumento: $ARGUMENTS

Sigue exactamente estas reglas:

1. Normaliza el argumento en un nombre válido de worktree: recorta espacios, minúsculas,
   espacios y guiones bajos → guion simple, elimina todo lo que no sea alfanumérico o guion,
   colapsa guiones consecutivos. Ejemplos:
   - "arreglar el bug de login" → arreglar-el-bug-de-login
   - "feature/nueva UI" → feature-nueva-ui
2. Si el argumento queda vacío, pregúntame el nombre y no hagas nada más.
3. Ejecuta exactamente este comando con la herramienta shell (sustituye <nombre> por el
   nombre normalizado):

   git worktree add .worktrees/<nombre>

Reglas adicionales:
- Solo haz eso: crear el worktree. No hagas checkout, no cambies de directorio, no abras
  archivos, no instales, no ejecutes nada más.
- No uses la herramienta integrada worktree_create: usa el comando git indicado.
- Reporta únicamente la ruta creada o el error si falla (por ejemplo, nombre ya existente).
