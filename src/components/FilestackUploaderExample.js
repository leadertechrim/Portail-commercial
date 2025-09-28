import React, { useState } from 'react';
import FilestackUploader from './FilestackUploader';

/**
 * Exemple d'utilisation du composant FilestackUploader
 * 
 * Ce composant démontre comment utiliser FilestackUploader pour uploader
 * des fichiers vers Filestack et récupérer les URLs publiques.
 */

const FilestackUploaderExample = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleUploadComplete = (files) => {
    console.log('✅ Fichiers uploadés avec succès:', files);
    setUploadedFiles(prev => [...prev, ...files]);
    
    // Exemple d'envoi au backend
    sendToBackend(files);
  };

  const handleUploadError = (error) => {
    console.error('❌ Erreur lors de l\'upload:', error);
    alert('Erreur lors de l\'upload des fichiers');
  };

  const sendToBackend = async (files) => {
    try {
      // Exemple d'envoi des URLs Filestack au backend
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documents: files.map(file => ({
            filename: file.filename,
            url: file.url,
            handle: file.handle,
            size: file.size,
            type: file.type,
            uploadedAt: file.uploadedAt
          }))
        })
      });

      if (response.ok) {
        console.log('✅ Documents envoyés au backend avec succès');
      } else {
        console.error('❌ Erreur lors de l\'envoi au backend');
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Exemple d'utilisation FilestackUploader</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Upload de fichiers multiples</h3>
        <FilestackUploader
          multiple={true}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
          maxFiles={5}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Upload d'un seul fichier</h3>
        <FilestackUploader
          multiple={false}
          accept=".pdf,.jpg,.png"
          maxFiles={1}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />
      </div>

      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Fichiers uploadés ({uploadedFiles.length})</h3>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            {uploadedFiles.map((file, index) => (
              <div key={file.id || index} style={{ 
                marginBottom: '10px', 
                padding: '10px',
                background: 'white',
                borderRadius: '6px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {file.filename}
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '5px' }}>
                  Taille: {(file.size / 1024).toFixed(2)} KB
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '5px' }}>
                  Type: {file.type}
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '5px' }}>
                  Handle: {file.handle}
                </div>
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#007bff', 
                    textDecoration: 'none',
                    fontSize: '12px'
                  }}
                >
                  🔗 Voir le fichier
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#6c757d' }}>
        <h4>Informations techniques :</h4>
        <ul>
          <li><strong>API Key:</strong> AdaPuMcdXS7inEIbiDgO2z</li>
          <li><strong>URL publique:</strong> Chaque fichier uploadé reçoit une URL publique</li>
          <li><strong>Handle unique:</strong> Identifiant unique Filestack pour chaque fichier</li>
          <li><strong>Métadonnées:</strong> Nom, taille, type, date d'upload</li>
        </ul>
      </div>
    </div>
  );
};

export default FilestackUploaderExample;
