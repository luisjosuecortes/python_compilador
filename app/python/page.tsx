'use client';

import { useState, useEffect, useCallback } from 'react';
import { CodeEditor } from '../components/CodeEditor';
import ExecutionResult from '../components/ExecutionResult';

// Tipo para Pyodide
declare global {
  interface Window {
    pyodide: PyodideInterface;
    loadPyodide: () => Promise<PyodideInterface>;
  }
}

// Definición de la interfaz de Pyodide
interface PyodideInterface {
  runPython: (code: string) => unknown;
  // Agregar otros métodos y propiedades según sea necesario
}

export default function PythonEditor() {
  const [code, setCode] = useState("# Escribe tu código Python aquí\nprint('¡Hola, mundo!')");
  const [result, setResult] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPyodideReady, setIsPyodideReady] = useState(false);
  
  // Cargar Pyodide cuando el componente se monta
  useEffect(() => {
    async function loadPyodide() {
      try {
        setIsLoading(true);
        
        // Solo cargamos el script si aún no está cargado
        if (!window.pyodide) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.4/full/pyodide.js';
          script.async = true;
          script.onload = initializePyodide;
          document.body.appendChild(script);
        } else {
          setIsPyodideReady(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error al cargar Pyodide:', error);
        setIsLoading(false);
      }
    }
    
    async function initializePyodide() {
      try {
        window.pyodide = await window.loadPyodide();
        setIsPyodideReady(true);
      } catch (error: unknown) {
        console.error('Error al inicializar Pyodide:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadPyodide();
    
    // Limpieza al desmontar
    return () => {
      // No podemos "descargar" Pyodide, pero podemos eliminar el estado
    };
  }, []);
  
  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
  };
  
  const handleExecute = useCallback(async () => {
    if (!isPyodideReady) {
      setResult('Pyodide aún se está cargando. Por favor, espera un momento...');
      setIsError(true);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Redireccionar stdout a una variable
      window.pyodide.runPython(`
        import sys
        from io import StringIO
        sys.stdout = StringIO()
      `);
      
      // Ejecutar el código del usuario
      window.pyodide.runPython(code);
      
      // Obtener el contenido de stdout
      const output = window.pyodide.runPython(`sys.stdout.getvalue()`);
      
      // Convertir output (unknown) a string para asignarlo a setResult
      setResult(String(output));
      setIsError(false);
    } catch (error: unknown) {
      console.error('Error al ejecutar código Python:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setResult(`Error: ${errorMessage}`);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [code, isPyodideReady]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Editor de Python</h1>
      
      <div className="mb-4">
        <CodeEditor 
          defaultValue={code} 
          onChange={handleCodeChange} 
        />
      </div>
      
      <div className="mb-6">
        <button
          onClick={handleExecute}
          disabled={isLoading || !isPyodideReady}
          className={`px-4 py-2 text-white font-medium rounded-md transition-colors ${
            isLoading || !isPyodideReady
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Ejecutando...' : !isPyodideReady ? 'Cargando Pyodide...' : 'Ejecutar código'}
        </button>
      </div>
      
      <ExecutionResult result={result} error={isError} />
    </div>
  );
} 