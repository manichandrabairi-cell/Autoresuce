from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.models import User, UserRole, CustomerProfile, ProviderProfile, VerificationStatus
from app.schemas.schemas import (
    UserRegister, UserLogin, Token, OTPVerifyRequest, ForgotPasswordRequest, ResetPasswordRequest
)
from app.routers.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if email exists
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # Create user
    user = User(
        email=user_in.email.lower(),
        phone=user_in.phone,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create associated profile
    if user.role == UserRole.CUSTOMER:
        profile = CustomerProfile(user_id=user.id)
        db.add(profile)
    elif user.role == UserRole.PROVIDER:
        provider_profile = ProviderProfile(
            user_id=user.id,
            business_name=user_in.business_name or f"{user.full_name}'s Roadside Rescue",
            verification_status=VerificationStatus.PENDING,
            is_verified=False,
            is_available=True
        )
        db.add(provider_profile)

    db.commit()

    token = create_access_token(subject=user.id, role=user.role.value)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
            "phone": user.phone
        }
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is suspended or deactivated. Contact support."
        )

    token = create_access_token(subject=user.id, role=user.role.value)

    provider_info = None
    if user.role == UserRole.PROVIDER and user.provider_profile:
        provider_info = {
            "provider_id": user.provider_profile.id,
            "business_name": user.provider_profile.business_name,
            "is_verified": user.provider_profile.is_verified,
            "verification_status": user.provider_profile.verification_status.value,
            "is_available": user.provider_profile.is_available
        }

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
            "phone": user.phone,
            "provider_info": provider_info
        }
    }

@router.post("/verify-otp")
def verify_otp(otp_data: OTPVerifyRequest):
    """
    Development Mobile OTP verification simulator.
    In testing environment, accepts any 6-digit OTP (e.g. 123456) with clear simulated indicator.
    """
    if len(otp_data.otp) != 6:
        raise HTTPException(status_code=400, detail="Invalid OTP length. Must be 6 digits.")

    return {
        "verified": True,
        "phone": otp_data.phone,
        "is_mock_simulation": True,
        "message": "Mobile number verified successfully via development SMS OTP simulator."
    }

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    # Always return success message to prevent user enumeration
    return {
        "success": True,
        "message": f"If an account exists for {req.email}, a password reset code has been dispatched. (Dev demo OTP: 123456)",
        "demo_otp": "123456"
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    if req.otp != "123456" and len(req.otp) != 6:
        raise HTTPException(status_code=400, detail="Invalid verification code")

    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found")

    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"success": True, "message": "Password updated successfully. You may now login."}

@router.get("/me")
def get_current_user_profile(user: User = Depends(get_current_user)):
    provider_info = None
    if user.role == UserRole.PROVIDER and user.provider_profile:
        provider_info = {
            "provider_id": user.provider_profile.id,
            "business_name": user.provider_profile.business_name,
            "is_verified": user.provider_profile.is_verified,
            "verification_status": user.provider_profile.verification_status.value,
            "is_available": user.provider_profile.is_available,
            "rating": user.provider_profile.rating,
            "total_jobs": user.provider_profile.total_jobs
        }

    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role.value,
        "phone": user.phone,
        "avatar_url": user.avatar_url,
        "provider_info": provider_info
    }
