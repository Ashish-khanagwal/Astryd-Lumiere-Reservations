#!/usr/bin/env bash

set -euo pipefail

echo "Building the frontend with .env.production..."
echo "WARNING: This build uses the live Finix frontend profile. Do not submit a payment unless the backend is intentionally running the completed production configuration."

npm run build:production

echo "Starting the local production preview at http://localhost:4173"
echo "API requests will be proxied to http://127.0.0.1:5000"
exec npm run preview:production
