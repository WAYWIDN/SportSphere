# Auth Module

## Purpose

The auth module manages registration, login, OTP verification, password changes, and logout.

## Main Flow

1. A user registers with an email and password.
2. The user verifies the email with an OTP when required.
3. The user logs in.
4. The server stores a JWT in an HTTP cookie.
5. Protected routes read and verify that cookie through `authMiddleware`.

## Endpoints

- `POST /v1/register`
- `POST /v1/login`
- `POST /v1/send-otp`
- `POST /v1/verify-otp`
- `POST /v1/forgot-password`
- `POST /v1/reset-password/send-otp`
- `POST /v1/reset-password/verify-otp`
- `POST /v1/reset-password/change`
- `GET /v1/auth-me`
- `POST /v1/logout`

## Rules

- Request data is checked with Zod before controllers run.
- Passwords are hashed before storage.
- JWT data contains the user ID, role, and verification state.
- Blacklisted JWTs are checked through Redis.
- Role checks are handled by the role middleware.
