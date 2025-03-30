import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);
const writeFileAsync = promisify(fs.writeFile);

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json(
        { error: 'No se proporcionó código para compilar' },
        { status: 400 }
      );
    }
    
    // Generar un ID único para este trabajo
    const jobId = Date.now().toString();
    const sourceFile = `/tmp/c-compiler/${jobId}.c`;
    const outputFile = `${jobId}.out`;
    
    // Guardar el código en un archivo temporal
    await writeFileAsync(sourceFile, code);
    
    // Intentar compilar directamente con GCC en lugar de usar el script
    try {
      // Usar GCC directamente en lugar de un script
      const { stdout } = await execAsync(`env -i PATH=/usr/bin:/bin /usr/bin/gcc -Wall -o /tmp/c-compiler/${outputFile} ${sourceFile} 2>&1`);
      
      // Si llegamos aquí, la compilación fue exitosa
      try {
        // Dar permisos de ejecución al archivo
        await execAsync(`chmod +x /tmp/c-compiler/${outputFile}`);
      } catch (error) {
        console.error('Error al asignar permisos:', error);
      }
      
      // Devolver éxito
      return NextResponse.json({
        success: true,
        message: 'Compilación exitosa',
        output: stdout || 'Compilación exitosa.',
        jobId: jobId
      });
    } catch (error: unknown) {
      // Si hay un error, es un error de compilación
      const compileError = error as Error & { stderr?: string };
      return NextResponse.json({
        success: false,
        message: 'Error de compilación',
        output: compileError.stderr || compileError.message,
        jobId: null
      }, { status: 200 });
    }
    
  } catch (error: unknown) {
    console.error('Error en la compilación:', error);
    const serverError = error as Error;
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor', 
        output: serverError.message,
        jobId: null
      },
      { status: 500 }
    );
  }
} 