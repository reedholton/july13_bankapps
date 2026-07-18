# Deploying to AWS with Terraform

## Expected repo layout

This assumes the merged repo (frontend + backend + this deployment tooling) ends up
looking like:

```
your-repo/
├── frontend/            ← contents of your BankUI-ts React app
├── backend/              ← contents of your simple-bank-application Spring Boot app
├── terraform/             ← the .tf files in this zip
├── deploy.sh               ← in this zip
└── Dockerfile.deploy        ← in this zip
```

`deploy.sh` assumes it's sitting at the repo root, as a sibling to `frontend/`,
`backend/`, and `terraform/` - if your merged structure looks different, the relative
paths near the top of `deploy.sh` need to match.

## What gets created

- An EC2 instance (Ubuntu, Docker pre-installed via `user_data`) running your Spring
  Boot backend in a container, with a stable Elastic IP.
- A CloudFront distribution in front of that EC2 instance, purely to get free HTTPS
  (see the comment at the top of `backend-cdn.tf` for why this is necessary, not optional).
- A private S3 bucket + CloudFront distribution for the frontend (same pattern as the
  task-tracker reference project).
- A security group: SSH open (for deploys), the app port locked to CloudFront's own IP
  range only - nothing reaches the backend directly except through CloudFront.

No IAM roles are created - confirmed your account can't (`iam:CreateRole` is denied),
so this deliberately avoids anything (ECS, App Runner, Secrets Manager) that would need one.

## Prerequisites

- Terraform installed and `aws configure` already working (both already true for you)
- An **existing** EC2 key pair already in your AWS account (e.g. from the hello-cicd lab)
- MongoDB Atlas Network Access set to allow `0.0.0.0/0` (same as the Render deploy - EC2
  doesn't have a static outbound IP by default either)
- Docker installed locally is NOT required - `deploy.sh` builds the jar with Maven and
  builds the Docker image on the EC2 instance itself, not on your machine

## Step 1: Apply the infrastructure

```bash
cd terraform
terraform init
terraform plan -var="student_name=reed-holton" -var="key_pair_name=YOUR-KEY-PAIR-NAME" -var="created_date=17-Jul-2026"
terraform apply -var="student_name=reed-holton" -var="key_pair_name=YOUR-KEY-PAIR-NAME" -var="created_date=17-Jul-2026"
```

Replace `YOUR-KEY-PAIR-NAME` with the **name** of your existing key pair as it appears
in the EC2 console (not the `.pem` filename necessarily - check if they differ).

To avoid retyping these every time, put them in a `terraform.tfvars` file in the
`terraform/` folder instead (already covered by a `.gitignore` pattern - never commit
this file if you add real secrets to it later):
```hcl
student_name  = "reed-holton"
key_pair_name = "your-key-pair-name"
created_date  = "17-Jul-2026"
```

Takes a few minutes, mostly CloudFront distribution creation. Note the outputs at the
end - you'll need `api_url`, `s3_bucket`, `frontend_distribution_id`, and
`backend_public_ip` for the next step (deploy.sh reads these automatically via
`terraform output`, so you don't need to copy them anywhere yourself).

## Step 2: Deploy the app

From the repo root (not inside `terraform/`):

```bash
chmod +x deploy.sh   # first time only

export MONGODB_URI="mongodb+srv://your-real-atlas-connection-string"
export JWT_SECRET="a-real-random-secret-not-the-placeholder"
export ADMIN_EMAIL="admin@simplebank.local"
export ADMIN_PASSWORD="something-you-actually-changed"
export SSH_KEY="ssh-keys/reed-key.pem"   # path to your .pem file
# Optional - narrows CORS to your real frontend URL instead of the wide-open "*"
# default. Leave unset for your first deploy (you won't have the frontend URL yet);
# set it and redeploy the backend once you do:
# export CORS_ALLOWED_ORIGINS="https://your-frontend-distribution.cloudfront.net"

./deploy.sh backend
./deploy.sh frontend
```

Or `./deploy.sh all` to do both in sequence. If `./deploy.sh` isn't recognized, run
`bash deploy.sh backend` instead - same thing, just explicit about which interpreter runs it.

`deploy.sh backend` builds the jar locally (fast, doesn't strain the tiny EC2 instance),
copies it up, builds a small Docker image on the instance, and restarts the container.
`deploy.sh frontend` builds the React app with `VITE_API_BASE_URL` pointed at your new
backend's CloudFront URL, uploads it to S3, and invalidates the CloudFront cache so the
change shows up immediately instead of waiting for the old cached version to expire.

## Step 3: Open it

```bash
terraform -chdir=terraform output -raw frontend_url
```
Open that URL. Register a user, or log in as the seeded admin with the email/password
you exported above.

## Tearing it down

```bash
cd terraform
terraform destroy -var="student_name=reed-holton" -var="key_pair_name=YOUR-KEY-PAIR-NAME" -var="created_date=17-Jul-2026"
```
(or reuse the same `terraform.tfvars` file, no need to retype the vars). Worth doing
between work sessions if you're mindful of the AWS credits - none of this is free-tier
guaranteed, though a `t3.micro` + two CloudFront distributions + one small S3 bucket
should be genuinely cheap for a project like this.

## What's NOT done yet (by design, matches how we sequenced this)

- **GitHub Actions** - `deploy.sh` is the manual version. Automating it (same steps,
  triggered on push) is a deliberate next step, not done here - infrastructure first,
  confirm it actually works by hand, automate after.
- **CORS still matters here**, unlike a single-distribution setup - frontend and backend
  are genuinely different origins. Set `CORS_ALLOWED_ORIGINS` (see Step 2) once you have
  your frontend's real URL and redeploy the backend.
