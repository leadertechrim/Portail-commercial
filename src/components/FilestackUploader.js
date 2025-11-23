import React, { useState } from "react";
import * as filestack from "filestack-js";

const FilestackUploader = ({
  onUploadComplete,
  onUploadError,
  multiple = false,
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt",
  maxFiles = 10,
  className = "",
  children,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Configuration Filestack avec API key depuis les variables d'environnement
  const FILESTACK_API_KEY = process.env.REACT_APP_FILESTACK_API_KEY || "AJOUNH2oSuidEE40RQHN3z";
  const client = filestack.init(FILESTACK_API_KEY);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadPromises = [];

    try {
      // Traiter chaque fichier
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Options d'upload Filestack
        const uploadOptions = {
          onProgress: (evt) => {
            console.log(
              `Upload progress for ${file.name}: ${evt.totalPercent}%`
            );
          },
          onUploadDone: (res) => {
            console.log(`File uploaded successfully: ${res.filename}`);
          },
        };

        // Upload du fichier vers Filestack
        const uploadPromise = client.upload(file, uploadOptions);
        uploadPromises.push(uploadPromise);
      }

      // Attendre que tous les uploads soient terminés
      const results = await Promise.all(uploadPromises);

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
      console.error("Erreur lors de l'upload:", error);
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

  const openFilestackPicker = () => {
    // Configuration simplifiée du picker pour éviter les erreurs de paramètres
    const pickerOptions = {
      accept: accept.split(",").map((type) => type.trim()),
      maxFiles: multiple ? maxFiles : 1,
      fromSources: ["local_file_system"],
      onUploadDone: (result) => {
        console.log("✅ Upload réussi:", result);
        const uploadedFileData = result.filesUploaded.map((file) => ({
          id: file.handle,
          filename: file.filename,
          url: file.url,
          size: file.size,
          type: file.mimetype,
          handle: file.handle,
          uploadedAt: new Date().toISOString(),
        }));

        setUploadedFiles((prev) => [...prev, ...uploadedFileData]);

        if (onUploadComplete) {
          onUploadComplete(uploadedFileData);
        }
      },
      onError: (error) => {
        console.error("❌ Erreur Filestack Picker:", error);
        if (onUploadError) {
          onUploadError(error);
        }
      },
    };

    try {
      console.log("🚀 Ouverture du picker avec options:", pickerOptions);
      client.picker(pickerOptions).open();
    } catch (error) {
      console.error("❌ Erreur lors de l'ouverture du picker:", error);
      if (onUploadError) {
        onUploadError(error);
      }
    }
  };

  return (
    <div className={`filestack-uploader ${className}`}>
      {/* Bouton pour ouvrir le picker Filestack */}
      <button
        type="button"
        onClick={openFilestackPicker}
        disabled={uploading}
        className="filestack-picker-btn"
      >
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
      </button>

      {/* Input file traditionnel comme alternative */}
      <input
        type="file"
        onChange={handleFileChange}
        multiple={multiple}
        accept={accept}
        style={{ display: "none" }}
        id="filestack-file-input"
      />

      <label
        htmlFor="filestack-file-input"
        className="filestack-file-input-label"
      >
        <i className="fas fa-upload"></i>
        Ou sélectionner depuis l'ordinateur
      </label>

      {/* Liste des fichiers uploadés */}
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files-list">
          <h4>Fichiers uploadés:</h4>
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

export default FilestackUploader;
