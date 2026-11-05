# GLAVAT STUDIO API

Private backend for public invitations and guest RSVP responses.

## Endpoints

- `GET /healthz` — API and database health.
- `POST /api/invites` — create an invitation; returns a public ID and a one-time owner token.
- `GET /api/invites/:id` — read a public invitation.
- `POST /api/invites/:id/rsvps` — submit a guest response.
- `PUT /api/invites/:id` — update an invitation (owner token required).
- `GET /api/invites/:id/rsvps` — list responses (owner token required).
- `DELETE /api/invites/:id` — delete an invitation and its responses (owner token required).

## Security

- Owner tokens are generated with a cryptographically secure random generator; only SHA-256 hashes are stored in PostgreSQL.
- Owner endpoints require a bearer token and use constant-time hash comparison.
- Guest data is validated and length-limited; requests are rate-limited.
- CORS is restricted to the GLAVAT STUDIO Pages origin and local development.
- The organizer URL carries its secret in the URL fragment. Browsers do not send fragments to the server; the frontend stores the key locally and removes it from the address bar.
- PostgreSQL is reached through Railway's private network.

## Runtime

Railway builds from this directory. Required variable: `DATABASE_URL`. The service creates its tables and index on startup.
