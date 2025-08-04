# render.yaml
# -----------------------------------------------------------------------------
# FINAL CORRECTED BLUEPRINT - Version 4
# This version uses the correct `pserv` type for the database and explicitly
# sets the `runtime` for the web service to `docker`.
# -----------------------------------------------------------------------------

services:
  # -----------------------------------------------------------------
  # Service 1: The PostgreSQL Database
  # Using the 'pserv' (Private Service) type as required by Render for databases.
  # -----------------------------------------------------------------
  - type: pserv
    name: skysniper-db
    plan: free # Change to 'starter' or higher for production use
    # The 'postgres' block specifies the database details. NO 'runtime' key here.
    postgres:
      version: 15
      databaseName: skysniperdb
      user: skysniper_user

  # -----------------------------------------------------------------
  # Service 2: The Redis Cache & Job Queue
  # (This definition is correct)
  # -----------------------------------------------------------------
  - type: redis
    name: skysniper-cache
    plan: free
    ipAllowList: []

  # -----------------------------------------------------------------
  # Service 3: The SkySniper X NestJS Application
  # -----------------------------------------------------------------
  - type: web
    name: skysniper-app
    plan: free
    # CRITICAL FIX: Explicitly set the runtime to 'docker'.
    runtime: docker
    # This now becomes valid because the runtime is 'docker'.
    dockerfilePath: ./Dockerfile

    healthCheckPath: /

    envVars:
      # --- Automatic Variables (linked from other Render services) ---
      - key: DATABASE_URL
        fromService:
          type: pserv # Match the service type above
          name: skysniper-db
          property: connectionString # This is valid for a postgres pserv
      - key: REDIS_URL
        fromService:
          type: redis
          name: skysniper-cache
          property: connectionString # Use the full URL for Redis

      # --- Manual Secret Variables (you MUST set these in the Render dashboard) ---
      - key: GEMINI_API_KEY
        sync: false
      - key: ADMIN_TOKEN
        sync: false

      # --- Standard Variables ---
      - key: PORT
        value: 8080
      - key: NODE_ENV
        value: production
