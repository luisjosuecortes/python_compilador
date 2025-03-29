'use client';

interface ExecutionResultProps {
  result: string;
  error?: boolean;
}

export default function ExecutionResult({ result, error = false }: ExecutionResultProps) {
  return (
    <div className="mt-4 border border-gray-300 dark:border-gray-700 rounded-md overflow-auto">
      <div className={`px-4 py-2 border-b border-gray-300 dark:border-gray-700 ${
        error 
          ? 'bg-red-100 dark:bg-red-900/20' 
          : 'bg-gray-100 dark:bg-gray-800'
      }`}>
        <h3 className={`text-sm font-medium ${
          error ? 'text-red-700 dark:text-red-400' : ''
        }`}>
          {error ? 'Error' : 'Resultado'}
        </h3>
      </div>
      <pre 
        className={`p-4 text-sm font-mono whitespace-pre-wrap ${
          error ? 'text-red-500 dark:text-red-400' : ''
        }`}
      >
        {result || 'Ejecuta tu código para ver los resultados aquí.'}
      </pre>
    </div>
  );
} 