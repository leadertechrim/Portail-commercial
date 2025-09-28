import React, { useState } from 'react';
import FilestackUploader from '../components/FilestackUploader';
import '../components/FilestackUploader.css';

const FilestackExample = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleUploadComplete = (files) => {
    console.log('Fichiers uploadés:', files);
    setUploadedFiles(prev => [...prev, ...files]);
    
    // Exemple d'envoi au backend
    sendFilesToBackend(files);
  };

  const handleUploadError = (error) => {
    console.error('Erreur upload:', error);
    alert('Erreur lors de l\'upload: ' + error.message);
  };

  const sendFilesToBackend = async (files) => {
    try {
      // Préparer les données pour le backend
      const filesData = files.map(file => ({
        filename: file.filename,
        url: file.url,
        handle: file.handle,
        size: file.size,
        type: file.type,
        uploadedAt: file.uploadedAt
      }));

      // Exemple d'envoi au backend
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: filesData,
          // Autres données du formulaire...
        }),
      });

      if (response.ok) {
        console.log('Fichiers sauvegardés avec succès');
        alert('Fichiers sauvegardés avec succès !');
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des fichiers');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Exemple d'utilisation FilestackUploader</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Upload simple (un fichier)</h3>
        <FilestackUploader
          multiple={false}
          accept=".pdf,.doc,.docx"
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Upload multiple (plusieurs fichiers)</h3>
        <FilestackUploader
          multiple={true}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
          maxFiles={5}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Upload d'images uniquement</h3>
        <FilestackUploader
          multiple={true}
          accept=".jpg,.jpeg,.png,.gif,.webp"
          maxFiles={3}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />
      </div>

      {/* Affichage des fichiers uploadés */}
      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>Fichiers uploadés ({uploadedFiles.length})</h3>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            {uploadedFiles.map((file, index) => (
              <div key={file.id || index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: index < uploadedFiles.length - 1 ? '1px solid #dee2e6' : 'none'
              }}>
                <div>
                  <strong>{file.filename}</strong>
                  <br />
                  <small style={{ color: '#6c757d' }}>
                    Taille: {Math.round(file.size / 1024)} KB
                  </small>
                  <br />
                  <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
                    Voir le fichier
                  </a>
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                  Handle: {file.handle}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exemple de données JSON pour le backend */}
      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4>Données JSON pour le backend:</h4>
          <pre style={{ 
            background: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '8px',
            fontSize: '12px',
            overflow: 'auto'
          }}>
            {JSON.stringify(uploadedFiles, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default FilestackExample;
