from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer

from jose import JWTError


from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from ..core.database import get_db
from ..core.security import (
    create_token,
    decode_token,
    access_expiry,
    refresh_expiry,
    hash_password,
    verify_password,
)
from ..models.models import User, OTPRecord

from ..schemas.schemas import TokenResponse, UserMeResponse


router = APIRouter()


class RegisterPayload(BaseModel):
    email: str
    full_name: str
    password: str


class RefreshPayload(BaseModel):
    token: str


class ForgotPasswordPayload(BaseModel):
    email: str


class VerifyOtpPayload(BaseModel):
    email: str
    otp: str
    new_password: str


class UpdateProfilePayload(BaseModel):
    full_name: str


class ChangePasswordPayload(BaseModel):
    current_password: str
    new_password: str


oauth2_form = OAuth2PasswordRequestForm


async def get_current_user_from_header(
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Missing Authorization header')

    parts = authorization.split(' ')
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid Authorization header format')

    token = parts[1]
    try:
        payload = decode_token(token)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid or expired token')

    if payload.get('type') != 'access':
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token type')

    user_id = payload.get('sub')
    res = await db.execute(select(User).where(User.id == int(user_id)))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User not found')
    return user


@router.post('/register')
async def register(payload: RegisterPayload, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(User).where(User.email == payload.email))
    existing = res.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail='Email already registered')

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {'id': user.id, 'email': user.email, 'full_name': user.full_name}


@router.post('/login/json', response_model=TokenResponse)
async def login_json(form: dict, db: AsyncSession = Depends(get_db)):
    email = form.get('email')
    password = form.get('password')
    if not email or not password:
        raise HTTPException(status_code=400, detail='Missing credentials')

    res = await db.execute(select(User).where(User.email == email))
    user = res.scalar_one_or_none()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail='Invalid credentials')

    access_token = create_token(str(user.id), 'access', access_expiry())
    refresh_token = create_token(str(user.id), 'refresh', refresh_expiry())
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.get('/me', response_model=UserMeResponse)
async def me(current_user: User = Depends(get_current_user_from_header)):
    return UserMeResponse(id=current_user.id, email=current_user.email, full_name=current_user.full_name)


@router.put('/me', response_model=UserMeResponse)
async def update_profile(
    payload: UpdateProfilePayload,
    current_user: User = Depends(get_current_user_from_header),
    db: AsyncSession = Depends(get_db),
):
    if not payload.full_name or not payload.full_name.strip():
        raise HTTPException(status_code=400, detail='Full name cannot be empty')
    current_user.full_name = payload.full_name.strip()
    await db.commit()
    await db.refresh(current_user)
    return UserMeResponse(id=current_user.id, email=current_user.email, full_name=current_user.full_name)


@router.put('/me/password')
async def change_password(
    payload: ChangePasswordPayload,
    current_user: User = Depends(get_current_user_from_header),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail='Current password is incorrect')
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail='New password must be at least 8 characters')
    current_user.hashed_password = hash_password(payload.new_password)
    await db.commit()
    return {'ok': True, 'message': 'Password updated successfully'}


@router.post('/refresh', response_model=TokenResponse)
async def refresh(token: str = Query(...), db: AsyncSession = Depends(get_db)):
    try:
        payload = decode_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail='Invalid refresh token')

    if payload.get('type') != 'refresh':
        raise HTTPException(status_code=401, detail='Invalid token type')

    user_id = int(payload.get('sub'))
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail='User not found')

    access_token = create_token(str(user.id), 'access', access_expiry())
    refresh_token = create_token(str(user.id), 'refresh', refresh_expiry())
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post('/forgot-password')
async def forgot_password(payload: ForgotPasswordPayload, db: AsyncSession = Depends(get_db)):
    import datetime
    res = await db.execute(select(User).where(User.email == payload.email))
    user = res.scalar_one_or_none()
    if not user:
        return {'ok': True}

    otp_code = '123456'
    otp = OTPRecord(
        email=payload.email,
        otp_code=otp_code,
        expires_at=datetime.datetime.utcnow() + datetime.timedelta(minutes=10),
    )
    db.add(otp)
    await db.commit()

    return {'ok': True, 'otp': otp_code}


@router.post('/verify-otp')
async def verify_otp(payload: VerifyOtpPayload, db: AsyncSession = Depends(get_db)):
    import datetime
    res = await db.execute(select(OTPRecord).where(OTPRecord.email == payload.email))
    otp_row = res.scalar_one_or_none()
    if not otp_row:
        raise HTTPException(status_code=400, detail='Invalid OTP')

    if otp_row.otp_code != payload.otp:
        raise HTTPException(status_code=400, detail='Invalid OTP')

    if otp_row.expires_at < datetime.datetime.utcnow():
        raise HTTPException(status_code=400, detail='OTP expired')

    res = await db.execute(select(User).where(User.email == payload.email))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=400, detail='User not found')

    user.hashed_password = hash_password(payload.new_password)
    await db.commit()

    return {'ok': True}
