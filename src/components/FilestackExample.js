import React, { useState } from "react";
import SimpleFilestackUploader from "./SimpleFilestackUploader";
import "./SimpleFilestackUploader.css";

const FilestackExample = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleUploadComplete = (files) => {
    console.log("✅ Fichiers uploadés avec succès:", files);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const handleUploadError = (error) => {
    console.error("❌ Erreur upload:", error);
    alert("Erreur lors de l'upload: " + error.message);
  };

  const clearFiles = () => {
    setUploadedFiles([]);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>🧪 Test Filestack Uploader</h2>

      <div style={{ marginBottom: "20px" }}>
        <h3>Upload de fichiers multiples</h3>
        <SimpleFilestackUploader
          multiple={true}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
          maxFiles={5}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Upload d'un seul fichier</h3>
        <SimpleFilestackUploader
          multiple={false}
          accept=".pdf,.jpg,.png"
          maxFiles={1}
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
                <small style={{ color: "#6c757d" }}>
                  Handle: {file.handle}
                </small>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          background: "#e7f3ff",
          borderRadius: "8px",
        }}
      >
        <h4>📋 Données pour le backend:</h4>
        <pre
          style={{
            background: "#f8f9fa",
            padding: "10px",
            borderRadius: "4px",
            fontSize: "12px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(uploadedFiles, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default FilestackExample;
