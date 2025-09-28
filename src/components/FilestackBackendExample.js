import React, { useState } from "react";
import SimpleFilestackUploader from "./SimpleFilestackUploader";
import "./SimpleFilestackUploader.css";

const FilestackBackendExample = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [backendData, setBackendData] = useState(null);

  const handleUploadComplete = (files) => {
    console.log("✅ Fichiers uploadés avec succès:", files);
    setUploadedFiles((prev) => [...prev, ...files]);

    // Simuler les données envoyées au backend
    const backendPayload = {
      document: files.map((file) => file.url), // Seulement les URLs
    };
    setBackendData(backendPayload);
  };

  const handleUploadError = (error) => {
    console.error("❌ Erreur upload:", error);
    alert("Erreur lors de l'upload: " + error.message);
  };

  const clearFiles = () => {
    setUploadedFiles([]);
    setBackendData(null);
  };

  const simulateBackendCall = () => {
    if (uploadedFiles.length === 0) {
      alert("Veuillez d'abord uploader des fichiers");
      return;
    }

    const payload = {
      document: uploadedFiles.map((file) => file.url),
    };

    console.log("📤 Données envoyées au backend:", payload);
    alert("Données envoyées au backend ! Vérifiez la console.");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>🧪 Test Format Backend - URLs Seulement</h2>

      <div style={{ marginBottom: "20px" }}>
        <h3>Upload de fichiers</h3>
        <SimpleFilestackUploader
          multiple={true}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
          maxFiles={5}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />
      </div>

      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>📁 Fichiers uploadés ({uploadedFiles.length})</h3>
          <button
            onClick={clearFiles}
            style={{
              background: "#dc3545",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
              marginBottom: "10px",
            }}
          >
            Effacer tous les fichiers
          </button>

          <div
            style={{
              background: "#f8f9fa",
              padding: "15px",
              borderRadius: "8px",
              border: "1px solid #dee2e6",
              marginBottom: "20px",
            }}
          >
            {uploadedFiles.map((file, index) => (
              <div
                key={file.id || index}
                style={{
                  marginBottom: "10px",
                  padding: "10px",
                  background: "white",
                  borderRadius: "4px",
                  border: "1px solid #e9ecef",
                }}
              >
                <strong>📄 {file.filename}</strong>
                <br />
                <small style={{ color: "#6c757d" }}>
                  Taille: {Math.round(file.size / 1024)} KB
                </small>
                <br />
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#007bff", textDecoration: "none" }}
                >
                  🔗 Voir le fichier
                </a>
                <br />
                <small style={{ color: "#6c757d" }}>URL: {file.url}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      {backendData && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#e7f3ff",
            borderRadius: "8px",
          }}
        >
          <h4>📋 Format Backend - URLs Seulement</h4>
          <p style={{ marginBottom: "10px", color: "#495057" }}>
            Les données envoyées au backend contiennent seulement les URLs :
          </p>
          <pre
            style={{
              background: "#f8f9fa",
              padding: "15px",
              borderRadius: "4px",
              fontSize: "13px",
              overflow: "auto",
              border: "1px solid #dee2e6",
            }}
          >
            {JSON.stringify(backendData, null, 2)}
          </pre>

          <button
            onClick={simulateBackendCall}
            style={{
              background: "#28a745",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            📤 Simuler l'envoi au backend
          </button>
        </div>
      )}

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          background: "#fff3cd",
          borderRadius: "8px",
          border: "1px solid #ffeaa7",
        }}
      >
        <h4>📝 Exemples de Format Backend</h4>
        <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
          <p>
            <strong>Un document :</strong>
          </p>
          <pre
            style={{
              background: "#f8f9fa",
              padding: "10px",
              borderRadius: "4px",
            }}
          >
            {`{
  "document": ["https://cdn.filestackapi.com/xyz123.pdf"]
}`}
          </pre>

          <p>
            <strong>Plusieurs documents :</strong>
          </p>
          <pre
            style={{
              background: "#f8f9fa",
              padding: "10px",
              borderRadius: "4px",
            }}
          >
            {`{
  "document": [
    "https://cdn.filestackapi.com/xyz123.pdf",
    "https://cdn.filestackapi.com/abc456.jpg"
  ]
}`}
          </pre>

          <p>
            <strong>Aucun document (optionnel) :</strong>
          </p>
          <pre
            style={{
              background: "#f8f9fa",
              padding: "10px",
              borderRadius: "4px",
            }}
          >
            {`{
  "document": []
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default FilestackBackendExample;


