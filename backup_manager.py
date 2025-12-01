"""
ORILUXCHAIN - Backup Manager
Sistema de backup automático de blockchain y datos críticos
"""

import os
import json
import shutil
import logging
from datetime import datetime
from typing import Optional
import zipfile

logger = logging.getLogger(__name__)

class BackupManager:
    """Gestor de backups"""
    
    def __init__(self, backup_dir: str = 'backups'):
        self.backup_dir = backup_dir
        os.makedirs(backup_dir, exist_ok=True)
        self.max_backups = 10
    
    def create_backup(self, blockchain, name: str = None) -> Optional[str]:
        """Crea un backup de la blockchain"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_name = name or f"backup_{timestamp}"
            backup_path = os.path.join(self.backup_dir, backup_name)
            
            # Crear directorio de backup
            os.makedirs(backup_path, exist_ok=True)
            
            # Guardar blockchain
            chain_file = os.path.join(backup_path, 'blockchain.json')
            with open(chain_file, 'w') as f:
                json.dump({
                    'chain': [block.to_dict() for block in blockchain.chain],
                    'pending_transactions': [tx.to_dict() for tx in blockchain.pending_transactions],
                    'difficulty': blockchain.difficulty,
                    'timestamp': timestamp
                }, f, indent=2)
            
            # Guardar tokens
            tokens_file = os.path.join(backup_path, 'tokens.json')
            with open(tokens_file, 'w') as f:
                json.dump(blockchain.token_manager.to_dict(), f, indent=2)
            
            # Crear archivo zip
            zip_path = f"{backup_path}.zip"
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for root, dirs, files in os.walk(backup_path):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, backup_path)
                        zipf.write(file_path, arcname)
            
            # Limpiar directorio temporal
            shutil.rmtree(backup_path)
            
            # Limpiar backups antiguos
            self.cleanup_old_backups()
            
            logger.info(f"✅ Backup created: {zip_path}")
            return zip_path
            
        except Exception as e:
            logger.error(f"Error creating backup: {e}")
            return None
    
    def restore_backup(self, backup_file: str) -> Optional[dict]:
        """Restaura un backup"""
        try:
            # Extraer zip
            extract_dir = os.path.join(self.backup_dir, 'temp_restore')
            os.makedirs(extract_dir, exist_ok=True)
            
            with zipfile.ZipFile(backup_file, 'r') as zipf:
                zipf.extractall(extract_dir)
            
            # Leer blockchain
            chain_file = os.path.join(extract_dir, 'blockchain.json')
            with open(chain_file, 'r') as f:
                data = json.load(f)
            
            # Limpiar
            shutil.rmtree(extract_dir)
            
            logger.info(f"✅ Backup restored from: {backup_file}")
            return data
            
        except Exception as e:
            logger.error(f"Error restoring backup: {e}")
            return None
    
    def list_backups(self) -> list:
        """Lista todos los backups disponibles"""
        try:
            backups = []
            for file in os.listdir(self.backup_dir):
                if file.endswith('.zip'):
                    path = os.path.join(self.backup_dir, file)
                    size = os.path.getsize(path)
                    mtime = os.path.getmtime(path)
                    backups.append({
                        'name': file,
                        'path': path,
                        'size': size,
                        'modified': datetime.fromtimestamp(mtime).isoformat()
                    })
            return sorted(backups, key=lambda x: x['modified'], reverse=True)
        except Exception as e:
            logger.error(f"Error listing backups: {e}")
            return []
    
    def cleanup_old_backups(self):
        """Elimina backups antiguos"""
        try:
            backups = self.list_backups()
            if len(backups) > self.max_backups:
                for backup in backups[self.max_backups:]:
                    os.remove(backup['path'])
                    logger.info(f"Removed old backup: {backup['name']}")
        except Exception as e:
            logger.error(f"Error cleaning up backups: {e}")

logger.info("✅ Backup Manager initialized")
