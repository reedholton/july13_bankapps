#!/bin/bash
set -e

MODE=$1

if [ -z "$MODE" ]; then
  echo "Usage: ./deploy.sh [backend|frontend|all]"
  echo ""
  echo "Backend requires these environment variables to be exported first:"
  echo "  MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD"
  echo "  SSH_KEY (path to your .pem file - defaults to ssh-keys/reed-key.pem)"
  echo "  CORS_ALLOWED_ORIGINS (optional - defaults to * if not set)"
  exit 1
fi

TF_DIR="$(dirname "$0")/terraform"
API_URL=$(terraform -chdir="$TF_DIR" output -raw api_url)
S3_BUCKET=$(terraform -chdir="$TF_DIR" output -raw s3_bucket)
FRONTEND_DIST_ID=$(terraform -chdir="$TF_DIR" output -raw frontend_distribution_id)
BACKEND_IP=$(terraform -chdir="$TF_DIR" output -raw backend_public_ip)

SSH_KEY="${SSH_KEY:-ssh-keys/reed-key.pem}"

deploy_backend() {
  if [ -z "$MONGODB_URI" ] || [ -z "$JWT_SECRET" ] || [ -z "$ADMIN_EMAIL" ] || [ -z "$ADMIN_PASSWORD" ]; then
    echo "Missing one or more required environment variables: MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD"
    echo "Export them first, e.g.: export MONGODB_URI=\"mongodb+srv://...\""
    exit 1
  fi

  echo "==> Building backend jar (this runs locally, not on the EC2 box)..."
  BACKEND_DIR="$(dirname "$0")/backend"
  (cd "$BACKEND_DIR" && ./mvnw clean package -DskipTests -q)

  echo "==> Copying jar + Dockerfile to EC2..."
  scp -i "$SSH_KEY" -o StrictHostKeyChecking=no \
    "$BACKEND_DIR"/target/*.jar ubuntu@"$BACKEND_IP":~/app.jar
  scp -i "$SSH_KEY" -o StrictHostKeyChecking=no \
    "$(dirname "$0")/Dockerfile.deploy" ubuntu@"$BACKEND_IP":~/Dockerfile

  echo "==> Building image and restarting the container on EC2..."
  ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ubuntu@"$BACKEND_IP" bash -s <<EOF
    set -e
    sudo docker build -t simple-bank-backend .
    sudo docker stop simple-bank-backend 2>/dev/null || true
    sudo docker rm simple-bank-backend 2>/dev/null || true
    sudo docker run -d --name simple-bank-backend \
      --restart unless-stopped \
      -p 8080:8080 \
      -e MONGODB_URI="$MONGODB_URI" \
      -e JWT_SECRET="$JWT_SECRET" \
      -e ADMIN_EMAIL="$ADMIN_EMAIL" \
      -e ADMIN_PASSWORD="$ADMIN_PASSWORD" \
      -e CORS_ALLOWED_ORIGINS="${CORS_ALLOWED_ORIGINS:-*}" \
      simple-bank-backend
EOF

  echo "Backend deployed. Give it ~15-20s to start, then check the logs if unsure:"
  echo "  ssh -i $SSH_KEY ubuntu@$BACKEND_IP 'sudo docker logs simple-bank-backend --tail 50'"
}

deploy_frontend() {
  echo "==> Building frontend (VITE_API_BASE_URL=$API_URL)..."
  FRONTEND_DIR="$(dirname "$0")/frontend"
  (cd "$FRONTEND_DIR" && VITE_API_BASE_URL="$API_URL" npm run build)

  echo "==> Uploading to S3..."
  aws s3 sync "$FRONTEND_DIR/dist/" "s3://$S3_BUCKET/" --delete

  echo "==> Invalidating CloudFront cache..."
  aws cloudfront create-invalidation \
    --distribution-id "$FRONTEND_DIST_ID" \
    --paths "/*" \
    --query 'Invalidation.Id' --output text

  echo "Frontend deployed."
}

case "$MODE" in
  backend)  deploy_backend ;;
  frontend) deploy_frontend ;;
  all)      deploy_backend && deploy_frontend ;;
  *)
    echo "Unknown mode: $MODE. Use backend, frontend, or all."
    exit 1
    ;;
esac

echo ""
echo "Frontend: $(terraform -chdir="$TF_DIR" output -raw frontend_url)"
echo "Backend:  $API_URL"
