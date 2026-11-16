
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import uuid

from pathlib import Path

from fastapi import UploadFile, File, HTTPException
from fastapi.responses import FileResponse

from config import (
    EVIDENCE_DIR,
    ARTIFACTS_DIR,
    MAX_FILE_SIZE
)

from services.image_analysis import analyze_image




app = FastAPI(
    title="ImageGuard",
    description="Digital Image Forensics and Analysis Tool",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.0.102:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)





@app.get("/")
def home():

    return {
        "application": "ImageGuard",
        "status": "running",
        "version": "1.0.0"
    }
    
@app.post("/api/analyze")
async def analyze_uploaded_image(file: UploadFile = File(...)):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is missing."
        )

    evidence_id = str(uuid.uuid4())

    extension = Path(file.filename).suffix.lower()

    if extension not in {
        ".jpg", ".jpeg", ".png", ".bmp",
        ".gif", ".tif", ".tiff", ".webp"
    }:
        extension = ".bin"

    file_path = EVIDENCE_DIR / f"{evidence_id}{extension}"

    file_size = 0

    try:

        # Save uploaded evidence
        with open(file_path, "xb") as output:

            while True:

                chunk = await file.read(1024 * 1024)

                if not chunk:
                    break

                file_size += len(chunk)

                if file_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="Maximum upload size is 15 MB."
                    )

                output.write(chunk)

        if file_size == 0:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty."
            )

        # Call forensic engine
        result = analyze_image(
            file_path=file_path,
            original_filename=file.filename,
            evidence_id=evidence_id,
            artifacts_dir=ARTIFACTS_DIR
        )

        return result

    except HTTPException:

        file_path.unlink(missing_ok=True)
        raise

    except (ValueError, OSError) as exc:

        file_path.unlink(missing_ok=True)

        raise HTTPException(
            status_code=415,
            detail=str(exc)
        )

    finally:

        await file.close()


@app.get("/api/analysis/{evidence_id}/ela")
def get_ela_image(evidence_id: str):

    try:
        evidence_id = str(uuid.UUID(evidence_id))
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid evidence ID."
        )

    ela_path = ARTIFACTS_DIR / f"{evidence_id}_ela.png"

    if not ela_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="ELA visualization not found."
        )

    return FileResponse(
        path=ela_path,
        media_type="image/png",
        filename="ela_analysis.png"
    )    
