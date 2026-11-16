
from pathlib import Path

from PIL import Image, ExifTags, UnidentifiedImageError
import hashlib

from services.ela import perform_ela


EXTENSION_FORMATS = {
    ".jpg": "JPEG",
    ".jpeg": "JPEG",
    ".png": "PNG",
    ".bmp": "BMP",
    ".gif": "GIF",
    ".tif": "TIFF",
    ".tiff": "TIFF",
    ".webp": "WEBP"
}


def json_safe(value):

    if isinstance(value, bytes):
        return value.hex()

    if isinstance(value, (str, int, float, bool)) or value is None:
        return value

    if isinstance(value, (tuple, list)):
        return [json_safe(item) for item in value]

    if isinstance(value, dict):
        return {
            str(key): json_safe(item)
            for key, item in value.items()
        }

    return str(value)

def calculate_sha256(file_path):

    digest = hashlib.sha256()

    with open(file_path, "rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)

    return digest.hexdigest()

def analyze_image(file_path, original_filename, evidence_id, artifacts_dir):

    file_path = Path(file_path)
    artifacts_dir = Path(artifacts_dir)

    # Calculate original file hash
    file_hash = calculate_sha256(file_path)

    file_size = file_path.stat().st_size

    try:

        # Verify image
        with Image.open(file_path) as image:
            image.verify()

        # Reopen image for metadata extraction
        with Image.open(file_path) as image:

            detected_format = image.format or "Unknown"

            width, height = image.size

            color_mode = image.mode

            exif = image.getexif()

            metadata = {
                ExifTags.TAGS.get(tag_id, str(tag_id)): json_safe(value)
                for tag_id, value in exif.items()
            }

    except (
        UnidentifiedImageError,
        OSError,
        ValueError,
        Image.DecompressionBombError
    ) as exc:

        raise ValueError(
            f"Invalid or unsupported image: {exc}"
        ) from exc

    # Extension consistency check
    extension = Path(original_filename).suffix.lower()

    expected_format = EXTENSION_FORMATS.get(extension)

    observations = []

    if not metadata:
        observations.append(
            "No EXIF metadata found."
        )

    if expected_format and expected_format != detected_format.upper():
        observations.append(
            f"Expected {expected_format}, detected {detected_format}."
        )

    if not observations:
        observations.append(
            "No basic metadata or extension inconsistency detected."
        )

    # ELA analysis
    ela_result = {
        "available": False,
        "image_url": None,
        "reason": None
    }

    if detected_format.upper() == "JPEG":

        try:

            ela_image = perform_ela(
                file_path,
                quality=90,
                scale=10
            )

            ela_path = artifacts_dir / f"{evidence_id}_ela.png"

            ela_image.save(ela_path, format="PNG")

            ela_result = {
                "available": True,
                "image_url": f"/api/analysis/{evidence_id}/ela",
                "quality": 90,
                "scale": 10,
                "reason": None
            }

        except (OSError, ValueError) as exc:

            ela_result["reason"] = str(exc)

    else:

        ela_result["reason"] = (
            "ELA is currently available only for JPEG images."
        )

    if not ela_result["available"]:
        observations.append(ela_result["reason"])

    return {
        "evidence_id": evidence_id,
        "file_name": original_filename,
        "file_size_bytes": file_size,
        "file_extension": extension,
        "detected_format": detected_format,

        "dimensions_pixels": {
            "width": width,
            "height": height
        },

        "color_mode": color_mode,
        "sha256": file_hash,
        "exif_metadata": metadata,
        "observations": observations,
        "ela": ela_result,

        "assessment_note": (
            "Forensic indicators do not independently prove "
            "authenticity or manipulation."
        )
    }
