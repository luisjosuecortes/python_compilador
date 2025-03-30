'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { CodeEditor } from '../components/CodeEditor';
import ExecutionResult from '../components/ExecutionResult';
import Terminal from '../components/Terminal';

export default function CEditor() {
  const [code, setCode] = useState(`// Programa Hola Mundo en C
#include <stdio.h>

int main() {
    printf("¡Hola, mundo!\\n");
    
    // Mostrar información del programa
    printf("Este es un programa simple escrito en C\\n");
    printf("Puedes editarlo y experimentar con tus propios programas\\n");
    
    // Devolver 0 para indicar que el programa terminó correctamente
    return 0;
}`);
  const [result, setResult] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompiled, setIsCompiled] = useState(false);
  const [compilationResult, setCompilationResult] = useState('');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [terminalOutput, setTerminalOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
    // Cuando el código cambia, necesitamos recompilar
    setIsCompiled(false);
    setCompilationResult('');
    setCurrentJobId(null);
  };
  
  const handleCompile = useCallback(async () => {
    setIsLoading(true);
    setIsCompiled(false);
    setCompilationResult('');
    
    try {
      const response = await fetch('/api/c/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCompilationResult(data.output || 'Compilación exitosa');
        setIsCompiled(true);
        setCurrentJobId(data.jobId);
      } else {
        setCompilationResult(data.output || 'Error de compilación');
        setIsCompiled(false);
        setCurrentJobId(null);
      }
    } catch (error) {
      console.error('Error al compilar:', error);
      setCompilationResult('Error al conectar con el servidor');
      setIsCompiled(false);
      setCurrentJobId(null);
    } finally {
      setIsLoading(false);
    }
  }, [code]);

  // Detener el polling de actualizaciones
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Efecto para limpiar al desmontar
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Poll para actualizaciones del estado del proceso
  const pollProcessStatus = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/c/run?jobId=${jobId}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener el estado del proceso');
      }
      
      const data = await response.json();
      
      setTerminalOutput(data.output || '');
      
      if (data.status === 'completed') {
        setIsRunning(false);
        setResult(data.output || 'No hay salida');
        setIsError(data.exitCode !== 0);
        stopPolling();
      }
      
    } catch (error) {
      console.error('Error al obtener estado:', error);
      setIsRunning(false);
      stopPolling();
    }
  }, [stopPolling]);

  const handleExecute = useCallback(async () => {
    if (!isCompiled || !currentJobId) {
      setResult('Por favor, compila el código primero.');
      setIsError(true);
      return;
    }

    // Detener cualquier polling anterior si existe
    stopPolling();
    
    setIsLoading(true);
    setIsRunning(true);
    setTerminalOutput('');
    setResult('');
    
    try {
      const response = await fetch('/api/c/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId: currentJobId }),
      });
      
      if (!response.ok) {
        throw new Error('Error al iniciar la ejecución');
      }
      
      // Iniciar polling para actualizaciones
      pollIntervalRef.current = setInterval(() => {
        pollProcessStatus(currentJobId);
      }, 100); // Poll cada 100ms para una experiencia cerca de tiempo real
      
    } catch (error) {
      console.error('Error al ejecutar:', error);
      setResult('Error al conectar con el servidor');
      setIsError(true);
      setIsRunning(false);
    } finally {
      setIsLoading(false);
    }
  }, [isCompiled, currentJobId, stopPolling, pollProcessStatus]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Editor de C</h1>
      
      <div className="mb-4">
        <CodeEditor 
          defaultValue={code} 
          onChange={handleCodeChange} 
        />
      </div>
      
      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={handleCompile}
          disabled={isLoading}
          className={`px-4 py-2 text-white font-medium rounded-md transition-colors ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-orange-600 hover:bg-orange-700'
          }`}
        >
          {isLoading && !isCompiled ? 'Compilando...' : 'Compilar'}
        </button>

        <button
          onClick={handleExecute}
          disabled={isLoading || !isCompiled || isRunning}
          className={`px-4 py-2 text-white font-medium rounded-md transition-colors ${
            isLoading || !isCompiled || isRunning
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isLoading && isCompiled ? 'Iniciando...' : isRunning ? 'Ejecutando...' : 'Ejecutar'}
        </button>
      </div>
      
      {compilationResult && (
        <div className={`mb-4 p-4 rounded-md ${
          isCompiled ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
        }`}>
          <h3 className="font-bold mb-1">{isCompiled ? 'Compilación exitosa' : 'Error de compilación'}</h3>
          <pre className="whitespace-pre-wrap font-mono text-sm">{compilationResult}</pre>
        </div>
      )}
      
      {/* Mostrar terminal solo cuando está ejecutando o hay salida */}
      {(isRunning || terminalOutput) && (
        <div className="mb-6">
          <h3 className="font-bold mb-2">Terminal:</h3>
          <Terminal output={terminalOutput} isRunning={isRunning} />
        </div>
      )}
      
      {/* Mostrar resultado final solo cuando no está ejecutando y hay un resultado */}
      {!isRunning && result && !terminalOutput && (
        <ExecutionResult result={result} error={isError} />
      )}
    </div>
  );
}