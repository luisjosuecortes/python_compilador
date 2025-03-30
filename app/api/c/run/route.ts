import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';

const existsAsync = promisify(fs.exists);

// Almacén de procesos activos y su salida
interface RunningProcess {
  output: string;
  running: boolean;
  exitCode: number | null;
  startTime: number;
}

const runningProcesses: Record<string, RunningProcess> = {};

// Handler para iniciar la ejecución
export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json();
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'No se proporcionó un ID de trabajo' },
        { status: 400 }
      );
    }
    
    const outputFile = `${jobId}.out`;
    const executablePath = `/tmp/c-compiler/${outputFile}`;
    
    // Verificar si el ejecutable existe
    if (!await existsAsync(executablePath)) {
      return NextResponse.json(
        { 
          error: 'El ejecutable no existe. Por favor, compile primero.' 
        },
        { status: 404 }
      );
    }
    
    // Si ya hay un proceso en ejecución con este ID, devolver su estado
    if (runningProcesses[jobId]) {
      return NextResponse.json({
        jobId,
        status: runningProcesses[jobId].running ? 'running' : 'completed',
        output: runningProcesses[jobId].output,
        exitCode: runningProcesses[jobId].exitCode,
      });
    }
    
    // Inicializar el registro del proceso
    runningProcesses[jobId] = {
      output: '',
      running: true,
      exitCode: null,
      startTime: Date.now()
    };

    // Iniciar el proceso en modo asíncrono
    const childProcess = spawn('env', [
      '-i', 
      'PATH=/usr/bin:/bin', 
      '/usr/bin/timeout', 
      '30s', 
      executablePath
    ]);
    
    // Capturar la salida estándar
    childProcess.stdout.on('data', (data) => {
      runningProcesses[jobId].output += data.toString();
    });
    
    // Capturar la salida de error
    childProcess.stderr.on('data', (data) => {
      runningProcesses[jobId].output += data.toString();
    });
    
    // Manejar el final del proceso
    childProcess.on('close', (code) => {
      runningProcesses[jobId].running = false;
      runningProcesses[jobId].exitCode = code;
      
      // Limpiar el proceso después de 5 minutos
      setTimeout(() => {
        delete runningProcesses[jobId];
      }, 5 * 60 * 1000);
    });
    
    // Devolver inmediatamente con el ID del trabajo
    return NextResponse.json({
      jobId,
      status: 'running',
      output: '',
      message: 'Ejecución iniciada'
    });
    
  } catch (error: unknown) {
    console.error('Error en la ejecución:', error);
    const serverError = error as Error;
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor', 
        output: serverError.message 
      },
      { status: 500 }
    );
  }
}

// Endpoint para verificar el estado actual
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const jobId = searchParams.get('jobId');
  
  if (!jobId) {
    return NextResponse.json(
      { error: 'No se proporcionó un ID de trabajo' },
      { status: 400 }
    );
  }
  
  // Si no existe el proceso, devuelve error
  if (!runningProcesses[jobId]) {
    return NextResponse.json(
      { error: 'Proceso no encontrado' },
      { status: 404 }
    );
  }
  
  // Devolver el estado actual del proceso
  return NextResponse.json({
    jobId,
    status: runningProcesses[jobId].running ? 'running' : 'completed',
    output: runningProcesses[jobId].output,
    exitCode: runningProcesses[jobId].exitCode,
    elapsed: Date.now() - runningProcesses[jobId].startTime
  });
} 