'use client';

import { useState } from 'react';
import { CodeEditor } from '../components/CodeEditor';
import ExecutionResult from '../components/ExecutionResult';

export default function PythonEditor() {
  const [code, setCode] = useState("# Escribe tu código Python aquí\nprint('¡Hola, mundo!')");
  const [result, setResult] = useState('');
  const [isError, setIsError] = useState(false);
  
  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
  };
  
  const handleExecute = () => {
    // Esta función será implementada más adelante para ejecutar el código
    // Por ahora, solo mostraremos un mensaje
    setResult('La ejecución de código será implementada próximamente.');
    setIsError(false);
  };
  
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
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
        >
          Ejecutar código
        </button>
      </div>
      
      <ExecutionResult result={result} error={isError} />
    </div>
  );
} 