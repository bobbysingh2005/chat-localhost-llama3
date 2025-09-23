// MonacoEditorWrapper.jsx
import React from "react";
import MonacoEditor from "@monaco-editor/react";

export default function MonacoEditorWrapper({
  value,
  language,
  onChange,
  onCancel,
  onSave,
}) {
  return (
    <div
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: 8,
        margin: "8px 0",
        background: "#f7f7fb",
      }}
    >
      <MonacoEditor
        height="200px"
        defaultLanguage={language || "javascript"}
        value={value}
        theme="vs-light"
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
        onChange={onChange}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          padding: "8px 12px",
        }}
      >
        <button
          onClick={onCancel}
          style={{
            background: "#fff",
            color: "#4f8cff",
            border: "1px solid #4f8cff",
            borderRadius: 6,
            padding: "4px 16px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          style={{
            background: "#4f8cff",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "4px 16px",
            cursor: "pointer",
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
