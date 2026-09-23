# Admin Module

## Purpose

The admin module lets an admin review applications from users who want to become coaches or venue owners.

## Main Flow

1. A player applies for the `coach` or `venue-owner` role.
2. The application is stored with a `pending` status.
3. An admin views pending applications.
4. The admin approves or rejects an application.
5. The user's role is updated when the application is approved.

## Endpoints

- `GET /v1/admin/applications`
  - Returns pending applications.
  - Supports pagination.
- `PATCH /v1/admin/applications/:applicationId`
  - Approves or rejects an application.

## Rules

- Only authenticated admins can use these endpoints.
- Request bodies, query values, and IDs are validated with Zod.
- An application must still be pending before it can be updated.
