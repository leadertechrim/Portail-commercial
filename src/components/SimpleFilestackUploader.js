import React, { useState } from "react";
import * as filestack from "filestack-js";

const SimpleFilestackUploader = ({
  onUploadComplete,
  onUploadError,
  multiple = false,
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt",
  maxFiles: _maxFiles = 10,
  className = "",
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Configuration Filestack avec API key depuis les variables d'environnement
  const FILESTACK_API_KEY =
    process.env.REACT_APP_FILESTACK_API_KEY || "AJOUNH2oSuidEE40RQHN3z";
  const client = filestack.init(FILESTACK_API_KEY);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadPromises = [];

    try {
      console.log("🚀 Début upload de", files.length, "fichiers");

      // Traiter chaque fichier
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📄 Upload fichier ${i + 1}:`, file.name);

        // Options d'upload Filestack simplifiées
        const uploadOptions = {
          onProgress: (evt) => {
            console.log(`📊 Progression ${file.name}: ${evt.totalPercent}%`);
          },
        };

        // Upload du fichier vers Filestack
        const uploadPromise = client.upload(file, uploadOptions);
        uploadPromises.push(uploadPromise);
      }

      // Attendre que tous les uploads soient terminés
      const results = await Promise.all(uploadPromises);
      console.log("✅ Tous les uploads terminés:", results);

      // Préparer les données des fichiers uploadés
      const uploadedFileData = results.map((result, index) => ({
        id: result.handle,
        filename: files[index].name,
        url: result.url,
        size: files[index].size,
        type: files[index].type,
        handle: result.handle,
        uploadedAt: new Date().toISOString(),
      }));

      setUploadedFiles((prev) => [...prev, ...uploadedFileData]);

      // Notifier le composant parent
      if (onUploadComplete) {
        onUploadComplete(uploadedFileData);
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'upload:", error);
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  return (
    <div className={`simple-filestack-uploader ${className}`}>
      {/* Input file pour sélectionner les fichiers */}
      <div className="file-input-container">
        <input
          type="file"
          onChange={handleFileChange}
          multiple={multiple}
          accept={accept}
          id="simple-filestack-input"
          style={{ display: "none" }}
        />
        <label htmlFor="simple-filestack-input" className="file-input-label">
          {uploading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Upload en cours...
            </>
          ) : (
            <>
              <i className="fas fa-cloud-upload-alt"></i>
              {multiple ? "Choisir des fichiers" : "Choisir un fichier"}
            </>
          )}
        </label>
      </div>

      {/* Liste des fichiers uploadés */}
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files-list">
          <h4>Fichiers uploadés ({uploadedFiles.length}):</h4>
          {uploadedFiles.map((file) => (
            <div key={file.id} className="uploaded-file-item">
              <div className="file-info">
                <i className="fas fa-file"></i>
                <div className="file-details">
                  <span className="file-name">{file.filename}</span>
                  <span className="file-url">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Voir le fichier
                    </a>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="remove-file-btn"
                title="Supprimer le fichier"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Données des fichiers pour le backend */}
      <input
        type="hidden"
        name="uploadedFiles"
        value={JSON.stringify(uploadedFiles)}
      />
    </div>
  );
};

export default SimpleFilestackUploader;
