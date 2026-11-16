
from PIL import Image, ImageChops, ImageEnhance
import io


def perform_ela(image_path, quality=90, scale=10):

    # Load original image
    original = Image.open(image_path)

    if original.format != "JPEG":
        raise ValueError(
            "ELA currently supports JPEG images only."
        )

    original = original.convert("RGB")

    # Recompress image into memory
    buffer = io.BytesIO()

    original.save(
        buffer,
        format="JPEG",
        quality=quality
    )

    buffer.seek(0)

    # Load recompressed image
    recompressed = Image.open(buffer).convert("RGB")

    # Calculate pixel differences
    difference = ImageChops.difference(
        original,
        recompressed
    )

    # Amplify differences
    enhanced = ImageEnhance.Brightness(
        difference
    ).enhance(scale)

    return enhanced
