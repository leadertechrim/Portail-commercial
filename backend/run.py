#!/usr/bin/env python3
"""
Script de démarrage du serveur Flask
"""

from app import app

if __name__ == '__main__':
    print("🚀 Démarrage du serveur Flask...")
    print("📡 API disponible sur http://localhost:5000/api")
    print("🔗 Test de connexion: http://localhost:5000/api/test")
    app.run(debug=True, host='0.0.0.0', port=5000)

