#!/bin/bash

# Script para ejecutar programas C compilados
# Uso: ./run.sh <nombre_ejecutable>

# Verificar argumentos
if [ $# -ne 1 ]; then
    echo "Error: Se requiere un argumento"
    echo "Uso: ./run.sh <nombre_ejecutable>"
    exit 1
fi

EXECUTABLE=$1

# Verificar que el ejecutable existe
if [ ! -f "/tmp/c-compiler/$EXECUTABLE" ]; then
    echo "Error: El ejecutable no existe."
    exit 1
fi

# Verificar que el ejecutable tiene permisos de ejecución
if [ ! -x "/tmp/c-compiler/$EXECUTABLE" ]; then
    chmod +x "/tmp/c-compiler/$EXECUTABLE"
fi

# Ejecutar el programa con límite de tiempo (5 segundos)
# Usar la ruta absoluta a timeout para evitar problemas con Conda
/usr/bin/timeout 5s "/tmp/c-compiler/$EXECUTABLE" 2>&1

# Capturar código de salida
EXIT_CODE=$?

if [ $EXIT_CODE -eq 124 ]; then
    echo "Error: El programa excedió el tiempo límite de ejecución."
    exit 124
elif [ $EXIT_CODE -ne 0 ]; then
    echo "El programa finalizó con código de error: $EXIT_CODE"
    exit $EXIT_CODE
fi

exit 0 