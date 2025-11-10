# EBL AWS Deployment - Quick Start Guide

**Get your EBL app deployed to AWS ECS in under 30 minutes!**

## 🎯 Prerequisites (5 minutes)

1. **AWS Account** with active credentials
2. **AWS CLI** installed: `aws --version`
3. **Docker** running: `docker --version`
4. **GitLab CI/CD** variables configured:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION` (or set in deployment config)

## 🚀 Fast Track Deployment (3 Steps)

### Step 1: Build & Test Locally (10 minutes)

```bash
# Navigate to project root
cd C:\Users\bisho\IdeaProjects\ebl

# Login to AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 498251986918.dkr.ecr.us-east-1.amazonaws.com

# Build backend image
docker build -f backend/Dockerfile -t 498251986918.dkr.ecr.us-east-1.amazonaws.com/ebl-backend:test .

# Build frontend image
docker build -f Dockerfile.frontend -t 498251986918.dkr.ecr.us-east-1.amazonaws.com/ebl-frontend:test .

# Test locally with docker-compose
docker-compose up -d

# Verify services are running
curl http://localhost:8000/health  # Backend health check
curl http://localhost:80/          # Frontend check

# Stop test containers
docker-compose down
```

### Step 2: Setup AWS Infrastructure (10 minutes)

```bash
# 1. Create IAM roles (if not exists)
aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "ecs-tasks.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}'

aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess

# 2. Create CloudWatch log groups
aws logs create-log-group --log-group-name /ecs/ebl-backend --region us-east-1
aws logs create-log-group --log-group-name /ecs/ebl-frontend --region us-east-1

# 3. Create secrets (generate secure random strings)
aws secretsmanager create-secret --name ebl/SECRET_KEY --secret-string "$(openssl rand -base64 32)" --region us-east-1
aws secretsmanager create-secret --name ebl/JWT_SECRET --secret-string "$(openssl rand -base64 32)" --region us-east-1

# 4. Get secret ARNs and update task definitions
aws secretsmanager describe-secret --secret-id ebl/SECRET_KEY --region us-east-1 | jq -r '.ARN'
aws secretsmanager describe-secret --secret-id ebl/JWT_SECRET --region us-east-1 | jq -r '.ARN'

# Edit aws/ecs-task-definition-backend.json and replace secret ARNs
```

### Step 3: Deploy to AWS (10 minutes)

#### Option A: Automated with GitLab CI/CD

```bash
# 1. Include deployment config (already created)
# File .gitlab-ci-deploy.yml is ready to use

# 2. Update main .gitlab-ci.yml to include deployment
# Add at the top of .gitlab-ci.yml:
# include:
#   - local: '/.gitlab-ci-deploy.yml'

# 3. Commit and push
git add .
git commit -m "feat: add AWS ECS deployment infrastructure"
git push origin develop  # Or main for production

# 4. Monitor in GitLab UI
# Go to CI/CD → Pipelines and watch the deployment
```

#### Option B: Manual Script

```bash
# Make script executable
chmod +x aws/deploy-scripts/deploy-to-ecs.sh

# Run deployment
./aws/deploy-scripts/deploy-to-ecs.sh

# Follow prompts and wait for completion
```

---

## 📋 Minimal AWS Setup (First Time Only)

If you haven't set up any AWS resources yet:

### 1. VPC & Networking (Use Default VPC)

```bash
# Get default VPC and subnets
aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --region us-east-1
aws ec2 describe-subnets --filters "Name=vpc-id,Values=<your-vpc-id>" --region us-east-1

# Get subnet IDs (you'll need at least 2 for high availability)
aws ec2 describe-subnets --region us-east-1 --query 'Subnets[*].[SubnetId,AvailabilityZone]' --output table
```

### 2. Security Groups

```bash
# Create backend security group
aws ec2 create-security-group \
  --group-name ebl-backend-sg \
  --description "Security group for EBL backend" \
  --vpc-id <your-vpc-id> \
  --region us-east-1

# Allow inbound 8000 (from anywhere for testing, restrict in production)
aws ec2 authorize-security-group-ingress \
  --group-id <backend-sg-id> \
  --protocol tcp \
  --port 8000 \
  --cidr 0.0.0.0/0 \
  --region us-east-1

# Create frontend security group
aws ec2 create-security-group \
  --group-name ebl-frontend-sg \
  --description "Security group for EBL frontend" \
  --vpc-id <your-vpc-id> \
  --region us-east-1

# Allow inbound 80
aws ec2 authorize-security-group-ingress \
  --group-id <frontend-sg-id> \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0 \
  --region us-east-1
```

### 3. Update Task Definitions with VPC Info

Edit `aws/ecs-task-definition-backend.json` and `aws/ecs-task-definition-frontend.json`:
- Remove EFS volume configuration if not using persistent storage
- Update secret ARNs with your actual values from Step 2

### 4. Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name ebl-cluster --region us-east-1
```

### 5. Register Task Definitions

```bash
# Backend
aws ecs register-task-definition --cli-input-json file://aws/ecs-task-definition-backend.json --region us-east-1

# Frontend
aws ecs register-task-definition --cli-input-json file://aws/ecs-task-definition-frontend.json --region us-east-1
```

### 6. Create ECS Services

```bash
# Get your subnet IDs and security group IDs first
SUBNET_1=<your-subnet-id-1>
SUBNET_2=<your-subnet-id-2>
BACKEND_SG=<backend-security-group-id>
FRONTEND_SG=<frontend-security-group-id>

# Create backend service
aws ecs create-service \
  --cluster ebl-cluster \
  --service-name ebl-backend-service \
  --task-definition ebl-backend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$BACKEND_SG],assignPublicIp=ENABLED}" \
  --region us-east-1

# Create frontend service
aws ecs create-service \
  --cluster ebl-cluster \
  --service-name ebl-frontend-service \
  --task-definition ebl-frontend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$FRONTEND_SG],assignPublicIp=ENABLED}" \
  --region us-east-1
```

---

## ✅ Verify Deployment

### 1. Check ECS Services

```bash
aws ecs describe-services --cluster ebl-cluster --services ebl-backend-service ebl-frontend-service --region us-east-1 | jq '.services[] | {name: .serviceName, status: .status, desiredCount, runningCount}'
```

### 2. Get Task Public IPs

```bash
# Backend task
BACKEND_TASK=$(aws ecs list-tasks --cluster ebl-cluster --service-name ebl-backend-service --region us-east-1 | jq -r '.taskArns[0]')

BACKEND_ENI=$(aws ecs describe-tasks --cluster ebl-cluster --tasks $BACKEND_TASK --region us-east-1 | jq -r '.tasks[0].attachments[0].details[] | select(.name=="networkInterfaceId") | .value')

BACKEND_IP=$(aws ec2 describe-network-interfaces --network-interface-ids $BACKEND_ENI --region us-east-1 | jq -r '.NetworkInterfaces[0].Association.PublicIp')

echo "Backend IP: $BACKEND_IP"

# Test backend
curl http://${BACKEND_IP}:8000/health

# Frontend task (same process)
FRONTEND_TASK=$(aws ecs list-tasks --cluster ebl-cluster --service-name ebl-frontend-service --region us-east-1 | jq -r '.taskArns[0]')

FRONTEND_ENI=$(aws ecs describe-tasks --cluster ebl-cluster --tasks $FRONTEND_TASK --region us-east-1 | jq -r '.tasks[0].attachments[0].details[] | select(.name=="networkInterfaceId") | .value')

FRONTEND_IP=$(aws ec2 describe-network-interfaces --network-interface-ids $FRONTEND_ENI --region us-east-1 | jq -r '.NetworkInterfaces[0].Association.PublicIp')

echo "Frontend IP: $FRONTEND_IP"

# Test frontend
curl http://${FRONTEND_IP}/
```

### 3. View Logs

```bash
# Backend logs
aws logs tail /ecs/ebl-backend --follow --region us-east-1

# Frontend logs (in separate terminal)
aws logs tail /ecs/ebl-frontend --follow --region us-east-1
```

---

## 🎉 Success!

Your EBL application is now running on AWS ECS!

**Access URLs:**
- **Backend**: `http://<BACKEND_IP>:8000`
- **Frontend**: `http://<FRONTEND_IP>`

**Next Steps:**
1. Set up Application Load Balancer for production traffic
2. Configure domain name and SSL certificate
3. Enable auto-scaling for high availability
4. Set up CloudWatch alarms for monitoring

---

## 🔧 Troubleshooting

### Services not starting?
```bash
# Check events
aws ecs describe-services --cluster ebl-cluster --services ebl-backend-service --region us-east-1 | jq '.services[0].events[0:5]'

# Check CloudWatch logs
aws logs tail /ecs/ebl-backend --region us-east-1
```

### Cannot pull image?
```bash
# Verify images exist in ECR
aws ecr describe-images --repository-name ebl-backend --region us-east-1
aws ecr describe-images --repository-name ebl-frontend --region us-east-1

# Check task execution role has ECR permissions
aws iam get-role --role-name ecsTaskExecutionRole | jq '.Role.AssumeRolePolicyDocument'
```

### Tasks stopping unexpectedly?
```bash
# View stopped task reason
STOPPED_TASK=$(aws ecs list-tasks --cluster ebl-cluster --desired-status STOPPED --region us-east-1 | jq -r '.taskArns[0]')

aws ecs describe-tasks --cluster ebl-cluster --tasks $STOPPED_TASK --region us-east-1 | jq '.tasks[0] | {stoppedReason, containers: .containers[0] | {exitCode, reason}}'
```

---

**Need Help?**
- Check full documentation: `aws/README.md`
- Review deployment checklist: `aws/DEPLOYMENT_CHECKLIST.md`
- GitLab CI/CD logs: CI/CD → Pipelines → View job logs

**Last Updated:** 2025-01-10
