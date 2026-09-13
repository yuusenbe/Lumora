import sys
import os
from pathlib import Path

# Add workspace root to sys.path so the 'backend' package can be imported
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

from backend.main import app
