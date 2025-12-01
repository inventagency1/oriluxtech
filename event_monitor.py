"""
ORILUXCHAIN - Event Monitor
Sistema de monitoreo y alertas de eventos críticos
"""

import logging
from datetime import datetime
from typing import Dict, List
from collections import deque
import json

logger = logging.getLogger(__name__)

class EventMonitor:
    """Monitor de eventos del sistema"""
    
    def __init__(self, max_events: int = 1000):
        self.events = deque(maxlen=max_events)
        self.alerts = deque(maxlen=100)
        self.stats = {
            'total_events': 0,
            'critical_events': 0,
            'warnings': 0,
            'errors': 0
        }
    
    def log_event(self, event_type: str, severity: str, message: str, data: dict = None):
        """Registra un evento"""
        event = {
            'timestamp': datetime.now().isoformat(),
            'type': event_type,
            'severity': severity,
            'message': message,
            'data': data or {}
        }
        
        self.events.append(event)
        self.stats['total_events'] += 1
        
        if severity == 'CRITICAL':
            self.stats['critical_events'] += 1
            self.create_alert(event)
            logger.critical(f"{event_type}: {message}")
        elif severity == 'ERROR':
            self.stats['errors'] += 1
            logger.error(f"{event_type}: {message}")
        elif severity == 'WARNING':
            self.stats['warnings'] += 1
            logger.warning(f"{event_type}: {message}")
        else:
            logger.info(f"{event_type}: {message}")
    
    def create_alert(self, event: dict):
        """Crea una alerta para eventos críticos"""
        alert = {
            'timestamp': datetime.now().isoformat(),
            'event': event,
            'acknowledged': False
        }
        self.alerts.append(alert)
    
    def get_recent_events(self, count: int = 10) -> List[dict]:
        """Obtiene eventos recientes"""
        return list(self.events)[-count:]
    
    def get_alerts(self) -> List[dict]:
        """Obtiene alertas pendientes"""
        return [a for a in self.alerts if not a['acknowledged']]
    
    def acknowledge_alert(self, index: int):
        """Marca una alerta como reconocida"""
        if 0 <= index < len(self.alerts):
            self.alerts[index]['acknowledged'] = True
    
    def get_stats(self) -> dict:
        """Obtiene estadísticas"""
        return self.stats.copy()
    
    def export_events(self, filepath: str):
        """Exporta eventos a archivo JSON"""
        try:
            with open(filepath, 'w') as f:
                json.dump(list(self.events), f, indent=2)
            logger.info(f"Events exported to {filepath}")
        except Exception as e:
            logger.error(f"Error exporting events: {e}")

# Instancia global
event_monitor = EventMonitor()

logger.info("✅ Event Monitor initialized")
