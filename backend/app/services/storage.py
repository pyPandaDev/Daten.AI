import io
import uuid
from typing import Dict, Optional
import pandas as pd
from datetime import datetime, timedelta
from threading import Lock

class InMemoryStorage:
    """Thread-safe in-memory storage for uploaded datasets and execution results
    Supports multiple concurrent users and tasks"""
    
    def __init__(self):
        self.datasets: Dict[str, pd.DataFrame] = {}
        self.metadata: Dict[str, dict] = {}
        self.results: Dict[str, dict] = {}
        self.timestamps: Dict[str, datetime] = {}
        self.lock = Lock()  # Thread-safe access
    
    def store_dataset(self, df: pd.DataFrame, filename: str) -> str:
        """Store a dataset and return its ID (thread-safe)"""
        with self.lock:
            file_id = str(uuid.uuid4())
            self.datasets[file_id] = df.copy()
            self.metadata[file_id] = {
                "filename": filename,
                "uploaded_at": datetime.utcnow().isoformat()
            }
            self.timestamps[file_id] = datetime.utcnow()
            
            # Clean old datasets (older than 1 hour)
            self._cleanup_old_data()
            
            return file_id
    
    def get_dataset(self, file_id: str) -> Optional[pd.DataFrame]:
        """Retrieve a dataset by ID (thread-safe)"""
        with self.lock:
            df = self.datasets.get(file_id)
            return df.copy() if df is not None else None
    
    def get_metadata(self, file_id: str) -> Optional[dict]:
        """Retrieve metadata by ID (thread-safe)"""
        with self.lock:
            return self.metadata.get(file_id)
    
    def store_metadata(self, file_id: str, key: str, value: any):
        """Store additional metadata for a file_id (thread-safe)"""
        with self.lock:
            if file_id in self.metadata:
                self.metadata[file_id][key] = value
    
    def store_result(self, task_execution_id: str, result: dict):
        """Store execution result (thread-safe)"""
        with self.lock:
            self.results[task_execution_id] = result
            self.timestamps[task_execution_id] = datetime.utcnow()
    
    def get_result(self, task_execution_id: str) -> Optional[dict]:
        """Retrieve execution result (thread-safe)"""
        with self.lock:
            return self.results.get(task_execution_id)
    
    def _cleanup_old_data(self):
        """Remove data older than 1 hour (assumes lock is already held)"""
        cutoff = datetime.utcnow() - timedelta(hours=1)
        
        # Clean datasets
        expired_ids = [
            id for id, ts in self.timestamps.items()
            if ts < cutoff
        ]
        
        if expired_ids:
            print(f"[STORAGE] Cleaning up {len(expired_ids)} expired items")
        
        for id in expired_ids:
            self.datasets.pop(id, None)
            self.metadata.pop(id, None)
            self.results.pop(id, None)
            self.timestamps.pop(id, None)
    
    def get_stats(self) -> dict:
        """Get storage statistics (thread-safe)"""
        with self.lock:
            return {
                "datasets_count": len(self.datasets),
                "results_count": len(self.results),
                "total_items": len(self.timestamps)
            }

# Global storage instance
storage = InMemoryStorage()
