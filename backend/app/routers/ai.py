import os
import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.ai_classifier import classifier_service
from app.core.config import settings

router = APIRouter(prefix="/ai", tags=["AI Vehicle Diagnostics"])

@router.post("/classify-breakdown")
async def classify_breakdown(
    file: UploadFile = File(...)
):
    """
    Analyzes vehicle breakdown photo with MobileNetV2 transfer learning inference.
    Returns predicted failure category, confidence score, severity, and suggested roadside service.
    """
    # Validate content type
    if file.content_type not in ["image/jpeg", "image/png", "image/webp", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Invalid image format. Supported: JPG, PNG, WEBP")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image size exceeds 10MB limit.")

    # Save to uploads folder with safe UUID
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    safe_filename = f"breakdown_{uuid.uuid4().hex[:12]}.{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    # Run inference
    result = classifier_service.classify_image(contents, filename=file.filename)
    result["image_url"] = f"/uploads/{safe_filename}"

    return result
