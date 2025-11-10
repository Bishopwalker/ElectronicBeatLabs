# AWS ECS Deployment Guide for Electromagnetic Beat Lab

This directory contains all AWS deployment configurations and scripts for deploying EBL to Amazon ECS.

## 📁 Contents

- `ecs-task-definition-backend.json` - ECS task definition for FastAPI backend
- `ecs-task-definition-frontend.json` - ECS task definition for React frontend
- `deploy-scripts/deploy-to-ecs.sh` - Automated deployment script
- `README.md` - This file

## 🚀 Quick Start Deployment

### Prerequisites

1. **AWS CLI** installed and configured
   ```bash
   aws --version
   aws configure  # Set your AWS credentials
   ```

2. **Docker** installed and running
   ```bash
   docker --version
   ```

3. **jq** for JSON processing
   ```bash
   # Ubuntu/Debian
   sudo apt-get install jq

   # macOS
   brew install jq

   # Windows (via Chocolatey)
   choco install jq
   ```

4. **GitLab CI/CD Variables** (for automated deployment)
   - `AWS_ACCESS_KEY_ID` - Your AWS access key
   - `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
   - `AWS_REGION` - Set to `us-east-1`

### Manual Deployment Steps

#### 1. Login to AWS ECR

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 498251986918.dkr.ecr.us-east-1.amazonaws.com
```

#### 2. Build Docker Images

```bash
# Backend
docker build -f backend/Dockerfile -t 498251986918.dkr.ecr.us-east-1.amazonaws.com/ebl-backend:latest .

# Frontend
docker build -f Dockerfile.frontend -t 498251986918.dkr.ecr.us-east-1.amazonaws.com/ebl-frontend:latest .
```

#### 3. Push Images to ECR

```bash
docker push 498251986918.dkr.ecr.us-east-1.amazonaws.com/ebl-backend:latest
docker push 498251986918.dkr.ecr.us-east-1.amazonaws.com/ebl-frontend:latest
```

#### 4. Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name ebl-cluster --region us-east-1
```

#### 5. Register Task Definitions

```bash
aws ecs register-task-definition --cli-input-json file://aws/ecs-task-definition-backend.json --region us-east-1
aws ecs register-task-definition --cli-input-json file://aws/ecs-task-definition-frontend.json --region us-east-1
```

#### 6. Create ECS Services

**Note:** Services require VPC, subnets, and security groups. Use AWS Console for initial setup or update the commands below:

```bash
# Backend Service
aws ecs create-service \
  --cluster ebl-cluster \
  --service-name ebl-backend-service \
  --task-definition ebl-backend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-XXXXX],securityGroups=[sg-XXXXX],assignPublicIp=ENABLED}" \
  --region us-east-1

# Frontend Service
aws ecs create-service \
  --cluster ebl-cluster \
  --service-name ebl-frontend-service \
  --task-definition ebl-frontend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-XXXXX],securityGroups=[sg-XXXXX],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:498251986918:targetgroup/ebl-frontend-tg/XXXXX,containerName=ebl-frontend,containerPort=80" \
  --region us-east-1
```

### Automated Deployment (GitLab CI/CD)

The project includes GitLab CI/CD pipeline configuration for automated deployment:

1. **Include deployment configuration** in `.gitlab-ci.yml`:
   ```yaml
   include:
     - local: '/.gitlab-ci-deploy.yml'
   ```

2. **Push to GitLab** to trigger pipeline:
   ```bash
   git push origin develop  # Auto-deploy to staging
   git push origin main     # Manual deploy to production
   ```

3. **Manual deployment** via GitLab UI:
   - Go to CI/CD → Pipelines
   - Click on the pipeline for your commit
   - Manually trigger `deploy-backend-ecs` and `deploy-frontend-ecs` jobs

### Using the Deployment Script

```bash
# Make script executable
chmod +x aws/deploy-scripts/deploy-to-ecs.sh

# Run deployment
./aws/deploy-scripts/deploy-to-ecs.sh
```

## 🏗️ Infrastructure Setup

### Required AWS Resources

#### 1. IAM Roles

**ECS Task Execution Role** (`ecsTaskExecutionRole`)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Attach policies:
- `AmazonECSTaskExecutionRolePolicy`
- `AmazonEC2ContainerRegistryReadOnly`
- `CloudWatchLogsFullAccess`

**ECS Task Role** (`ecsTaskRole`)
- Permissions for S3, Secrets Manager, etc. based on your needs

#### 2. VPC & Networking

- **VPC** with public and private subnets
- **Security Groups**:
  - Backend: Allow inbound 8000 (from frontend SG and ALB)
  - Frontend: Allow inbound 80 (from ALB)
  - ALB: Allow inbound 80/443 from internet

#### 3. Application Load Balancer (Optional but recommended)

- **Target Groups**:
  - `ebl-backend-tg` (Port 8000)
  - `ebl-frontend-tg` (Port 80)
- **Listeners**:
  - HTTP:80 → Frontend target group
  - HTTP:80/api → Backend target group
  - HTTP:80/ws → Backend target group (WebSocket)

#### 4. EFS for Persistent Storage (Backend only)

```bash
# Create EFS file system
aws efs create-file-system --region us-east-1 --tags Key=Name,Value=ebl-data

# Create mount targets in each subnet
aws efs create-mount-target \
  --file-system-id fs-XXXXXXXXX \
  --subnet-id subnet-XXXXX \
  --security-groups sg-XXXXX
```

Update `ecs-task-definition-backend.json` with your EFS file system ID.

#### 5. Secrets Manager

```bash
# Create secrets
aws secretsmanager create-secret --name ebl/SECRET_KEY --secret-string "your-secret-key" --region us-east-1
aws secretsmanager create-secret --name ebl/JWT_SECRET --secret-string "your-jwt-secret" --region us-east-1
```

#### 6. CloudWatch Log Groups

```bash
aws logs create-log-group --log-group-name /ecs/ebl-backend --region us-east-1
aws logs create-log-group --log-group-name /ecs/ebl-frontend --region us-east-1
```

## 🔧 Configuration

### Environment Variables

Update task definitions with your environment-specific values:

**Backend** (`ecs-task-definition-backend.json`):
- `ALLOWED_ORIGINS` - Your frontend URL
- EFS `fileSystemId` - Your EFS file system ID
- Secrets ARNs - Your Secrets Manager ARNs

**Frontend** (`ecs-task-definition-frontend.json`):
- `BACKEND_URL` - Your backend service URL (ALB DNS or service discovery)

### GitLab CI/CD

Update `.gitlab-ci-deploy.yml` if needed:
- `AWS_ACCOUNT_ID` - Your AWS account ID (currently: 498251986918)
- `AWS_REGION` - Your AWS region (currently: us-east-1)
- `ECS_CLUSTER` - Your ECS cluster name
- Service names and task definitions

## 📊 Monitoring & Logs

### View ECS Service Status

```bash
# List services
aws ecs list-services --cluster ebl-cluster --region us-east-1

# Describe service
aws ecs describe-services --cluster ebl-cluster --services ebl-backend-service --region us-east-1

# List tasks
aws ecs list-tasks --cluster ebl-cluster --region us-east-1

# View task details
aws ecs describe-tasks --cluster ebl-cluster --tasks <task-id> --region us-east-1
```

### View CloudWatch Logs

```bash
# Backend logs
aws logs tail /ecs/ebl-backend --follow --region us-east-1

# Frontend logs
aws logs tail /ecs/ebl-frontend --follow --region us-east-1
```

### Health Checks

- Backend: `http://<backend-url>:8000/health`
- Frontend: `http://<frontend-url>/`

## 🔄 Updates & Rollbacks

### Update Service (Force New Deployment)

```bash
# Backend
aws ecs update-service --cluster ebl-cluster --service ebl-backend-service --force-new-deployment --region us-east-1

# Frontend
aws ecs update-service --cluster ebl-cluster --service ebl-frontend-service --force-new-deployment --region us-east-1
```

### Rollback to Previous Task Definition

```bash
# Backend (rollback to revision N-1)
aws ecs update-service --cluster ebl-cluster --service ebl-backend-service --task-definition ebl-backend:N-1 --region us-east-1

# Frontend (rollback to revision N-1)
aws ecs update-service --cluster ebl-cluster --service ebl-frontend-service --task-definition ebl-frontend:N-1 --region us-east-1
```

## 🔒 Security Considerations

1. **Secrets Management**: Use AWS Secrets Manager for sensitive data
2. **IAM Roles**: Follow least-privilege principle
3. **Network Security**: Use private subnets for backend, security groups for access control
4. **HTTPS**: Use ALB with ACM certificate for SSL/TLS
5. **CORS**: Configure `ALLOWED_ORIGINS` properly in backend
6. **Logging**: Enable CloudWatch logs for audit trails

## 💰 Cost Optimization

- **Fargate Spot**: Consider using Fargate Spot for non-production environments
- **Auto Scaling**: Configure service auto-scaling based on CPU/memory
- **Task Sizing**: Right-size CPU and memory based on actual usage
- **EFS**: Use EFS Infrequent Access for cold data

## 🐛 Troubleshooting

### Task fails to start

```bash
# Check task stopped reason
aws ecs describe-tasks --cluster ebl-cluster --tasks <task-id> --region us-east-1 | jq -r '.tasks[0].stoppedReason'

# Check CloudWatch logs
aws logs tail /ecs/ebl-backend --since 1h --region us-east-1
```

### Cannot pull image from ECR

- Verify ECS task execution role has ECR permissions
- Check ECR repository policy
- Verify image exists: `aws ecr describe-images --repository-name ebl-backend --region us-east-1`

### Health check failures

- Verify container port mappings match health check
- Check security group allows health check port
- Increase `startPeriod` in health check if app takes longer to start

### WebSocket connection issues

- Ensure ALB target group has `stickiness` enabled
- Configure proper `Connection: upgrade` headers
- Use ALB listener rules for `/ws` path

## 📚 Additional Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS ECR Documentation](https://docs.aws.amazon.com/ecr/)
- [Fargate Pricing](https://aws.amazon.com/fargate/pricing/)
- [ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)

---

**Maintained by:** bishop8-group
**Last Updated:** 2025-01-10
**Region:** us-east-1
