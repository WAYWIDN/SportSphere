# Profile Management Module

## Purpose

This module stores user profile information and handles applications to become a coach or venue owner.

## Main Flow

1. A user views or updates their profile.
2. A player submits an application for a new role.
3. The application is sent to the admin module for review.

## Endpoints

- `GET /v1/user-profile`
  - Returns the current user's profile.
- `GET /v1/user-profile/:userId`
  - Returns a user's public profile information.
- `POST /v1/user-profile`
  - Updates profile data.
- `POST /v1/apply-coach-venue-owner`
  - Applies for the coach or venue-owner role.

## Rules

- All profile endpoints require authentication.
- Only players can apply for coach or venue-owner roles.
- A user must complete required profile information before applying.
- Request bodies are validated with Zod.
- Admin approval is required before the user's role changes.
