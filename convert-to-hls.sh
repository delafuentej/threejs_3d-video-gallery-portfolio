#!/bin/bash

# === CONFIGURACIÓN ===
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INPUT_DIR="$SCRIPT_DIR/public/videos"
OUTPUT_DIR="$SCRIPT_DIR/public/hls"

mkdir -p "$OUTPUT_DIR"

# Verificar existencia del directorio
if [ ! -d "$INPUT_DIR" ]; then
  echo "❌ Carpeta $INPUT_DIR no encontrada"
  exit 1
fi

# Buscar todos los archivos .mov
shopt -s nullglob
files=("$INPUT_DIR"/*.mov)

if [ ${#files[@]} -eq 0 ]; then
  echo "⚠️ No se encontraron archivos .mov en $INPUT_DIR"
  exit 0
fi

# Procesar cada archivo .mov
for file in "${files[@]}"; do
  filename=$(basename "$file" .mov)
  echo "🎞️ Convirtiendo: $filename.mov → $filename.m3u8 ..."

  ffmpeg -i "$file" \
    -c:v h264 -c:a aac -strict -2 \
    -profile:v baseline -level 3.0 -start_number 0 \
    -hls_time 10 -hls_list_size 0 -f hls "$OUTPUT_DIR/${filename}.m3u8"

  echo "✅ Convertido: $filename.m3u8"
done

echo "🎬 Conversión completa. Archivos en $OUTPUT_DIR"
