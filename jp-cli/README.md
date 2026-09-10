# jp cli

Cliente CLI privado y sin telemetría para usar múltiples proveedores LLM con fallback automático.

## Instalación local rápida

```bash
cd /home/runner/work/qwen-code-jp/qwen-code-jp/jp-cli
npm ci
npm run build
npm link
jp --help
```

## Configuración

1. Copia el ejemplo a `~/.config/jp-cli/config.json` (o `%APPDATA%\\jp-cli\\config.json`).
2. Define variables de entorno `JP_CLI_*` o `~/.config/jp-cli/.env`.
3. Ejecuta:

```bash
jp --provider groq --model llama3 "hola"
cat archivo.txt | jp "analiza esto"
jp -f script.py "optimiza este código"
jp history
jp clean
```

## Privacidad

- No envía telemetría.
- Solo permite salida de red a endpoints configurados por usuario y localhost.
- Configuración e historial locales con permisos restringidos en POSIX (`0600`).
