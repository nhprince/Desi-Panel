#!/usr/bin/env bash
set -e

echo "Desi Panel Installer (Linux)"

read -p "PostgreSQL URL (e.g., postgres://user:pass@localhost:5432/desipanel): " DATABASE_URL
read -p "JWT Secret (enter a strong random string): " JWT_SECRET
read -p "Admin Email: " ADMIN_EMAIL
read -s -p "Admin Password: " ADMIN_PASSWORD
printf "\n"
FRONTEND_ORIGIN_DEFAULT="http://localhost:5173"
FILES_ROOT_DEFAULT="/var/lib/desi-panel/storage"
read -p "Frontend Origin [${FRONTEND_ORIGIN_DEFAULT}]: " FRONTEND_ORIGIN
read -p "Files Root [${FILES_ROOT_DEFAULT}]: " FILES_ROOT
FRONTEND_ORIGIN=${FRONTEND_ORIGIN:-$FRONTEND_ORIGIN_DEFAULT}
FILES_ROOT=${FILES_ROOT:-$FILES_ROOT_DEFAULT}

ENV_FILE="backend/.env"
mkdir -p backend
cat > "$ENV_FILE" <<EOF
PORT=4000
DATABASE_URL=$DATABASE_URL
JWT_SECRET=$JWT_SECRET
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD
FRONTEND_ORIGIN=$FRONTEND_ORIGIN
NODE_ENV=production
FILES_ROOT=$FILES_ROOT
EOF

echo "Wrote $ENV_FILE"

echo "You can now install dependencies and start the services:"
echo "  npm install --prefix backend"
echo "  npm run start --prefix backend"
echo "Optionally set up the frontend:"
echo "  npm install --prefix frontend"
echo "  npm run build --prefix frontend"
