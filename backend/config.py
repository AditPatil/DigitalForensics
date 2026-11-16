
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

EVIDENCE_DIR = BASE_DIR / "evidence"
ARTIFACTS_DIR = BASE_DIR / "artifacts"

MAX_FILE_SIZE = 15 * 1024 * 1024

EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
