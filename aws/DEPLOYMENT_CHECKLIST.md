# AWS ECS Deployment Checklist

Use this checklist to ensure all prerequisites are met before deploying EBL to AWS ECS.

## 📋 Pre-Deployment Checklist

### 1. AWS Account Setup
- [ ] AWS account created and active
- [ ] AWS CLI installed: `aws --version`
- [ ] AWS credentials configured: `aws configure`
- [ ] Correct region set: `us-east-1`
- [ ] IAM user has necessary permissions (ECS, ECR, IAM, CloudWatch)

### 2. ECR Repositories
- [x] Backend ECR repository created: `ebl-backend`
- [x] Frontend ECR repository created: `ebl-frontend`
- [ ] ECR repository policies configured (if needed)
- [ ] ECR lifecycle policies set up (optional, for image cleanup)

**Verify:**
```bash
aws ecr describe-repositories --region us-east-1 | jq '.repositories[].repositoryName'
```

### 3. IAM Roles
- [ ] `ecsTaskExecutionRole` created with policies:
  - AmazonECSTaskExecutionRolePolicy
  - AmazonEC2ContainerRegistryReadOnly
  - CloudWatchLogsFullAccess
- [ ] `ecsTaskRole` created (for task-level permissions)

**Create roles:**
```bash
# Task Execution Role
aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document file://aws/iam/ecs-task-execution-role-policy.json

aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly
aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess

# Task Role
aws iam create-role --role-name ecsTaskRole --assume-role-policy-document file://aws/iam/ecs-task-role-policy.json
```

### 4. VPC & Networking
- [ ] VPC created or using default VPC
- [ ] Public subnets available (at least 2 for high availability)
- [ ] Security groups created:
  - [ ] Backend SG: Allow inbound 8000 (from frontend SG)
  - [ ] Frontend SG: Allow inbound 80 (from anywhere or ALB)
- [ ] Internet Gateway attached to VPC
- [ ] Route tables configured

**Get VPC info:**
```bash
aws ec2 describe-vpcs --region us-east-1
aws ec2 describe-subnets --region us-east-1 | jq '.Subnets[] | {SubnetId, AvailabilityZone, CidrBlock}'
```

### 5. Secrets Manager
- [ ] `ebl/SECRET_KEY` secret created
- [ ] `ebl/JWT_SECRET` secret created
- [ ] Secret ARNs updated in task definitions

**Create secrets:**
```bash
aws secretsmanager create-secret --name ebl/SECRET_KEY --secret-string "$(openssl rand -base64 32)" --region us-east-1
aws secretsmanager create-secret --name ebl/JWT_SECRET --secret-string "$(openssl rand -base64 32)" --region us-east-1
```

**Get ARNs:**
```bash
aws secretsmanager describe-secret --secret-id ebl/SECRET_KEY --region us-east-1 | jq -r '.ARN'
aws secretsmanager describe-secret --secret-id ebl/JWT_SECRET --region us-east-1 | jq -r '.ARN'
```

### 6. CloudWatch Log Groups
- [ ] `/ecs/ebl-backend` log group created
- [ ] `/ecs/ebl-frontend` log group created

**Create log groups:**
```bash
aws logs create-log-group --log-group-name /ecs/ebl-backend --region us-east-1
aws logs create-log-group --log-group-name /ecs/ebl-frontend --region us-east-1
```

### 7. EFS File System (Optional - for persistent SQLite)
- [ ] EFS file system created
- [ ] Mount targets created in each subnet
- [ ] EFS security group allows NFS (2049) from ECS tasks
- [ ] File system ID updated in `ecs-task-definition-backend.json`

**Create EFS:**
```bash
# Create file system
aws efs create-file-system --region us-east-1 --tags Key=Name,Value=ebl-data

# Create mount targets (repeat for each subnet)
aws efs create-mount-target \
  --file-system-id fs-XXXXXXXXX \
  --subnet-id subnet-XXXXX \
  --security-groups sg-XXXXX
```

**Note:** If not using EFS, remove the `volumes` section from backend task definition.

### 8. GitLab CI/CD Variables
- [x] `AWS_ACCESS_KEY_ID` set in GitLab
- [x] `AWS_SECRET_ACCESS_KEY` set in GitLab
- [ ] `AWS_REGION` set to `us-east-1` (or configured in .gitlab-ci-deploy.yml)

**Set in GitLab:**
- Go to: Settings → CI/CD → Variables
- Add masked, protected variables

### 9. Application Load Balancer (Optional, Recommended)
- [ ] ALB created
- [ ] Target groups created:
  - [ ] `ebl-backend-tg` (Port 8000, Protocol HTTP, Health check: /health)
  - [ ] `ebl-frontend-tg` (Port 80, Protocol HTTP)
- [ ] Listener rules configured:
  - [ ] HTTP:80 → Frontend TG (default)
  - [ ] HTTP:80/api/* → Backend TG
  - [ ] HTTP:80/ws → Backend TG (with stickiness enabled for WebSocket)
- [ ] ALB security group allows HTTP/HTTPS from internet

### 10. Domain & SSL (Optional, Production)
- [ ] Domain name registered
- [ ] Route53 hosted zone created
- [ ] ACM certificate requested and validated
- [ ] HTTPS listener added to ALB
- [ ] DNS records point to ALB

---

## 🚀 Deployment Steps

### Option 1: Automated GitLab CI/CD (Recommended)

1. **Update main GitLab CI config** to include deployment:
   ```bash
   # Edit .gitlab-ci.yml and add at the top:
   include:
     - local: '/.gitlab-ci-deploy.yml'
   ```

2. **Push to GitLab**:
   ```bash
   git add .
   git commit -m "feat: add AWS ECS deployment configuration"
   git push origin develop  # Auto-deploy to staging
   ```

3. **Monitor pipeline** in GitLab UI:
   - Go to CI/CD → Pipelines
   - Click on your pipeline
   - Watch build and deploy jobs

4. **For production**, push to main:
   ```bash
   git push origin main
   ```
   - Manually trigger `deploy-backend-ecs` and `deploy-frontend-ecs` jobs in GitLab UI

### Option 2: Manual Deployment Script

1. **Make script executable**:
   ```bash
   chmod +x aws/deploy-scripts/deploy-to-ecs.sh
   ```

2. **Run deployment**:
   ```bash
   ./aws/deploy-scripts/deploy-to-ecs.sh
   ```

3. **Create ECS services** (first time only):
   - Go to AWS Console → ECS → Clusters
   - Click on `ebl-cluster`
   - Create services for backend and frontend
   - Configure networking, security groups, and load balancer

### Option 3: Manual AWS CLI

Follow steps in `aws/README.md` for detailed AWS CLI commands.

---

## ✅ Post-Deployment Verification

### 1. Verify ECS Cluster
```bash
aws ecs list-clusters --region us-east-1
aws ecs describe-clusters --clusters ebl-cluster --region us-east-1
```

### 2. Check Task Status
```bash
aws ecs list-tasks --cluster ebl-cluster --region us-east-1
aws ecs describe-tasks --cluster ebl-cluster --tasks <task-arn> --region us-east-1
```

### 3. View Service Status
```bash
aws ecs describe-services --cluster ebl-cluster --services ebl-backend-service ebl-frontend-service --region us-east-1
```

### 4. Check CloudWatch Logs
```bash
# Backend logs
aws logs tail /ecs/ebl-backend --follow --region us-east-1

# Frontend logs
aws logs tail /ecs/ebl-frontend --follow --region us-east-1
```

### 5. Test Health Endpoints
```bash
# Get task public IP
BACKEND_IP=$(aws ecs describe-tasks --cluster ebl-cluster --tasks <task-arn> --region us-east-1 | jq -r '.tasks[0].attachments[0].details[] | select(.name=="networkInterfaceId") | .value' | xargs -I {} aws ec2 describe-network-interfaces --network-interface-ids {} --region us-east-1 | jq -r '.NetworkInterfaces[0].Association.PublicIp')

# Test backend health
curl http://${BACKEND_IP}:8000/health

# Test frontend
curl http://${FRONTEND_PUBLIC_IP}/
```

### 6. Test WebSocket Connection
```bash
# Using websocat or wscat
wscat -c ws://${BACKEND_IP}:8000/ws
```

### 7. Test Full Stack (via ALB if configured)
```bash
# Get ALB DNS
ALB_DNS=$(aws elbv2 describe-load-balancers --region us-east-1 | jq -r '.LoadBalancers[0].DNSName')

# Test frontend
curl http://${ALB_DNS}/

# Test backend API
curl http://${ALB_DNS}/api/health

# Test WebSocket
wscat -c ws://${ALB_DNS}/ws
```

---

## 🔄 Rollback Procedure

If deployment fails or issues arise:

### Via GitLab CI/CD
1. Go to CI/CD → Pipelines → Latest pipeline
2. Manually trigger `rollback-backend` or `rollback-frontend` job

### Via AWS CLI
```bash
# Get current task definition revision
CURRENT_REV=$(aws ecs describe-services --cluster ebl-cluster --services ebl-backend-service --region us-east-1 | jq -r '.services[0].taskDefinition' | grep -oP ':\K[0-9]+$')

# Rollback to previous revision
PREVIOUS_REV=$((CURRENT_REV - 1))
aws ecs update-service --cluster ebl-cluster --service ebl-backend-service --task-definition ebl-backend:${PREVIOUS_REV} --region us-east-1
```

---

## 🐛 Common Issues & Solutions

### Issue: Task fails to start with "CannotPullContainerError"
**Solution:**
- Verify ECS task execution role has ECR permissions
- Check image exists: `aws ecr describe-images --repository-name ebl-backend --region us-east-1`
- Ensure task execution role ARN is correct in task definition

### Issue: Health check failures
**Solution:**
- Increase `startPeriod` in task definition health check
- Verify container actually starts and listens on correct port
- Check CloudWatch logs for application errors

### Issue: Cannot connect to backend from frontend
**Solution:**
- Verify backend service discovery or ALB configuration
- Check security group rules allow traffic between frontend and backend
- Update `BACKEND_URL` environment variable in frontend task definition

### Issue: WebSocket disconnects immediately
**Solution:**
- Enable ALB target group stickiness
- Configure proper timeout values in ALB and task definition
- Ensure `Connection: upgrade` headers are preserved

### Issue: SQLite database resets on task restart
**Solution:**
- Set up EFS for persistent storage
- Update backend task definition to mount EFS volume
- Ensure database file path points to EFS mount

---

## 📊 Monitoring & Maintenance

### CloudWatch Dashboards
- Create custom dashboard for ECS metrics
- Monitor: CPU, memory, network, task count

### Alarms
```bash
# High CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name ebl-backend-high-cpu \
  --alarm-description "Alert when backend CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

### Cost Monitoring
- Set up AWS Budgets for cost alerts
- Review Fargate pricing regularly
- Consider reserved capacity for production

---

**Last Updated:** 2025-01-10
**Maintained by:** bishop8-group
