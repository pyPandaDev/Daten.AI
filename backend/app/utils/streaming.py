import asyncio
import json
from typing import Dict, Any, AsyncGenerator
from datetime import datetime
from threading import Lock

class StreamManager:
    """Manage server-sent events for streaming responses
    Thread-safe for multiple concurrent users and tasks"""
    
    def __init__(self):
        self.active_streams: Dict[str, asyncio.Queue] = {}
        self.completed_streams: set = set()  # Track completed streams
        self.cached_events: Dict[str, list] = {}  # Cache events for late connections
        self.lock = Lock()  # Thread-safe access
    
    def create_stream(self, task_execution_id: str) -> asyncio.Queue:
        """Create a new stream queue (thread-safe)"""
        with self.lock:
            queue = asyncio.Queue()
            self.active_streams[task_execution_id] = queue
            return queue
    
    def get_stream(self, task_execution_id: str) -> asyncio.Queue:
        """Get an existing stream queue (thread-safe)"""
        with self.lock:
            return self.active_streams.get(task_execution_id)
    
    async def send_event(self, task_execution_id: str, event: str, data: Dict[str, Any]):
        """Send an event to a stream (thread-safe)"""
        event_data = {
            "event": event,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Cache the event (thread-safe)
        with self.lock:
            if task_execution_id not in self.cached_events:
                self.cached_events[task_execution_id] = []
            self.cached_events[task_execution_id].append(event_data)
        
        # Also send to queue if it exists
        queue = self.get_stream(task_execution_id)
        if queue:
            await queue.put(event_data)
    
    async def close_stream(self, task_execution_id: str):
        """Close a stream (thread-safe)"""
        queue = self.get_stream(task_execution_id)
        if queue:
            await queue.put(None)  # Sentinel value
            with self.lock:
                self.completed_streams.add(task_execution_id)
            # Keep in active_streams briefly to avoid 404, will be cleaned by stream_events
    
    async def stream_events(self, task_execution_id: str) -> AsyncGenerator[str, None]:
        """Generator for SSE events (thread-safe)"""
        # First, send any cached events (thread-safe copy)
        with self.lock:
            cached = self.cached_events.get(task_execution_id, []).copy()
        
        if cached:
            print(f"[STREAM] Sending {len(cached)} cached events for {task_execution_id}")
            for event_data in cached:
                yield f"data: {json.dumps(event_data)}\n\n"
                # Small delay between events
                await asyncio.sleep(0.05)
        
        queue = self.get_stream(task_execution_id)
        if not queue:
            # Check if it was completed
            with self.lock:
                is_completed = task_execution_id in self.completed_streams
            if is_completed:
                print(f"[STREAM] Stream already completed for {task_execution_id}")
                return
            return
        
        try:
            while True:
                event_data = await queue.get()
                
                if event_data is None:  # Stream closed
                    break
                
                # Format as SSE
                yield f"data: {json.dumps(event_data)}\n\n"
        
        except asyncio.CancelledError:
            pass
        finally:
            # Clean up after stream is fully consumed (thread-safe)
            with self.lock:
                if task_execution_id in self.active_streams:
                    del self.active_streams[task_execution_id]
            # Keep cached events for a bit longer
            # They will be cleaned up manually or by a background task
    
    def get_stats(self) -> dict:
        """Get streaming statistics (thread-safe)"""
        with self.lock:
            return {
                "active_streams": len(self.active_streams),
                "completed_streams": len(self.completed_streams),
                "cached_events_count": len(self.cached_events)
            }

# Global stream manager
stream_manager = StreamManager()
