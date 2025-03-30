'use client';

import React, { useEffect, useRef } from 'react';

interface TerminalProps {
  output: string;
  isRunning: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ output, isRunning }) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll al fondo cuando cambia la salida
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  // Aplicar formato especial a líneas que contienen patrones específicos
  const formatOutput = () => {
    if (!output) return [];
    
    // Separar la salida en líneas
    const lines = output.split('\n');
    
    return lines.map((line, index) => {
      // Detectar líneas de generación
      if (line.startsWith('Generacion:')) {
        return (
          <div key={index} className="font-bold text-yellow-300 my-1 border-t border-gray-700 pt-1">
            {line}
          </div>
        );
      } 
      // Preservar espacios en líneas del tablero
      else if (line.includes('■') || line.includes('□')) {
        return (
          <div key={index} className="leading-4 font-bold" style={{ letterSpacing: '0.1em' }}>
            {line}
          </div>
        );
      }
      // Error de TERM
      else if (line.includes('TERM environment variable not set')) {
        return null; // Ocultar estos mensajes
      }
      // Líneas normales
      else {
        return <div key={index} className="leading-5">{line || ' '}</div>;
      }
    }).filter(Boolean); // Filtrar elementos nulos
  };

  return (
    <div className="relative bg-gray-900 text-green-400 rounded-lg overflow-hidden border border-gray-700 font-mono text-sm shadow-lg">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-xs text-gray-400 font-sans">
          {isRunning ? 'Ejecutando...' : 'Terminado'}
        </div>
      </div>
      <div 
        ref={terminalRef}
        className="p-4 max-h-[500px] overflow-auto whitespace-pre-wrap scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900" 
        style={{ fontFamily: '"Courier New", monospace' }}
      >
        {formatOutput()}
        {isRunning && (
          <span className="inline-block h-4 w-2 bg-green-400 ml-1 animate-pulse"></span>
        )}
      </div>
    </div>
  );
};

export default Terminal; 