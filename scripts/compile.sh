#!/bin/bash

# Script para compilar código C
# Uso: ./compile.sh <código_fuente> <nombre_salida>

# Verificar argumentos
if [ $# -ne 2 ]; then
    echo "Error: Se requieren dos argumentos"
    echo "Uso: ./compile.sh <código_fuente> <nombre_salida>"
    exit 1
fi

SOURCE_FILE=$1
OUTPUT_FILE=$2

# Asegurarse de que el directorio temporal existe
mkdir -p /tmp/c-compiler

# Usar la ruta absoluta al compilador GCC del sistema
# y asegurarse de no usar bibliotecas de Conda
/usr/bin/gcc -Wall -o "/tmp/c-compiler/$OUTPUT_FILE" "$SOURCE_FILE" 2>&1

# Capturar código de salida
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "Compilación exitosa."
    chmod +x "/tmp/c-compiler/$OUTPUT_FILE"
    exit 0
else
    echo "Error de compilación."
    exit $EXIT_CODE
fi 