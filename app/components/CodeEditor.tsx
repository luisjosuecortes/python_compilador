'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  defaultValue?: string;
  onChange?: (value: string | undefined) => void;
}

export function CodeEditor({ defaultValue = '', onChange }: CodeEditorProps) {
  const [value, setValue] = useState(defaultValue);

  const handleEditorChange = (value: string | undefined) => {
    setValue(value || '');
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden h-[400px]">
      <Editor
        height="100%"
        defaultLanguage="python"
        theme="vs-dark"
        value={value}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          tabSize: 4,
          autoIndent: 'advanced',
        }}
      />
    </div>
  );
} 