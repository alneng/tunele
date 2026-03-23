# Kubernetes Operations

Operational guide for managing the tunele-api backend on k3s.

## Cluster Overview

The backend runs on a single-node k3s cluster with two namespaces:


| Namespace        | Domain             | Context          |
| ---------------- | ------------------ | ---------------- |
| `tunele-prod`    | `api.tunele.app`   | `tunele-prod`    |
| `tunele-preview` | `api-d.tunele.app` | `tunele-preview` |


Each namespace runs its own isolated set of pods: `tunele-api`, `redis`, and `grafana-agent`.

All `kubectl` commands require `--context` to select the right service account and namespace. Examples below use `tunele-prod` — substitute `tunele-preview` for the preview environment.

## Manifest Structure

```
k8s/
├── base/                          # Shared resources
│   ├── kustomization.yaml
│   ├── api-deployment.yaml        # tunele-api Deployment (1 replica, rolling update)
│   ├── api-service.yaml           # ClusterIP service on port 7600
│   ├── redis-deployment.yaml      # Redis Deployment (1 replica)
│   ├── redis-service.yaml         # ClusterIP service on port 6379
│   ├── grafana-agent-deployment.yaml
│   └── grafana-agent-configmap.yaml
└── overlays/
    ├── prod/
    │   ├── kustomization.yaml     # Sets namespace: tunele-prod, image tag
    │   └── ingressroute.yaml      # Traefik IngressRoute for api.tunele.app
    └── preview/
        ├── kustomization.yaml     # Sets namespace: tunele-preview, image tag
        └── ingressroute.yaml      # Traefik IngressRoute for api-d.tunele.app
```

Overlays use Kustomize to set the namespace and image tag on top of the shared base resources.

## Scaling

The API deployment defaults to 1 replica. To scale up or down:

```bash
# Scale to 3 replicas
kubectl scale deployment/tunele-api --replicas=3 \
  -n tunele-prod --context=tunele-prod

# Scale back to 1
kubectl scale deployment/tunele-api --replicas=1 \
  -n tunele-prod --context=tunele-prod

# Check current replica count
kubectl get deployment tunele-api -n tunele-prod --context=tunele-prod
```

Note: `kubectl scale` is an imperative change. The next CI/CD deploy will reset replicas to whatever is in `api-deployment.yaml` (currently 1). To make a permanent change, update `spec.replicas` in `k8s/base/api-deployment.yaml`.

## Rollbacks

### Automatic (CI/CD)

The deploy job runs `kubectl rollout status` with a 120s timeout. If the rollout fails, it automatically runs `kubectl rollout undo` to revert to the previous revision.

### Manual

```bash
# View rollout history
kubectl rollout history deployment/tunele-api \
  -n tunele-prod --context=tunele-prod

# Undo the last rollout (revert to previous revision)
kubectl rollout undo deployment/tunele-api \
  -n tunele-prod --context=tunele-prod

# Undo to a specific revision
kubectl rollout undo deployment/tunele-api --to-revision=2 \
  -n tunele-prod --context=tunele-prod

# Watch the rollback progress
kubectl rollout status deployment/tunele-api \
  -n tunele-prod --context=tunele-prod
```

### Redeploy via CI/CD

Alternatively, re-run the GitHub Actions workflow from a known-good commit:

1. Go to **Actions** > **Backend CI/CD** > **Run workflow**
2. Select the commit/branch to deploy
3. Select the environment

## Deploying Manually (without CI/CD)

```bash
# Apply the overlay directly
kubectl apply -k k8s/overlays/prod --context=tunele-prod

# Or set a specific image tag first
cd k8s/overlays/prod
kustomize edit set image ghcr.io/alneng/tunele-api=ghcr.io/alneng/tunele-api:<tag>
kubectl apply -k . --context=tunele-prod
```

## Monitoring

### Pod Status

```bash
# List pods
kubectl get pods -n tunele-prod --context=tunele-prod

# Watch pods in real-time
kubectl get pods -n tunele-prod --context=tunele-prod -w
```

### Logs

```bash
# API logs
kubectl logs -l app=tunele-api -n tunele-prod --context=tunele-prod

# Follow logs
kubectl logs -l app=tunele-api -n tunele-prod --context=tunele-prod -f

# Redis logs
kubectl logs -l app=redis -n tunele-prod --context=tunele-prod

# Grafana Agent logs
kubectl logs -l app=grafana-agent -n tunele-prod --context=tunele-prod
```

### Resource Usage

```bash
# Pod resource consumption (requires metrics-server)
kubectl top pods -n tunele-prod --context=tunele-prod
```

## Troubleshooting

### Pod stuck in CrashLoopBackOff

```bash
# Check why the pod is failing
kubectl describe pod -l app=tunele-api -n tunele-prod --context=tunele-prod

# Check logs from the previous (crashed) container
kubectl logs -l app=tunele-api -n tunele-prod --context=tunele-prod --previous
```

### Pod stuck in ImagePullBackOff

The `ghcr-secret` image pull secret may have expired or the image tag doesn't exist.

```bash
# Verify the secret exists
kubectl get secret ghcr-secret -n tunele-prod --context=tunele-prod

# Check pod events for details
kubectl describe pod -l app=tunele-api -n tunele-prod --context=tunele-prod
```

### Health check failures

The API has readiness and liveness probes on `/api/health`:

- **Readiness**: checked every 5s, fails after 3 consecutive failures (pod stops receiving traffic)
- **Liveness**: checked every 10s, fails after 3 consecutive failures (pod is restarted)

```bash
# Port-forward to test the health endpoint directly
kubectl port-forward svc/tunele-api 8080:7600 \
  -n tunele-prod --context=tunele-prod

# In another terminal
curl http://localhost:8080/api/health
```

### Force restart

```bash
# Restart all pods in the deployment (rolling restart, no downtime)
kubectl rollout restart deployment/tunele-api \
  -n tunele-prod --context=tunele-prod
```

### Secrets

Environment variables are loaded from the `tunele-api-secrets` Kubernetes secret. To update secrets, recreate the secret on the VPS:

```bash
# Delete and recreate from .env file (on VPS with admin access)
sudo kubectl delete secret tunele-api-secrets -n tunele-prod
sudo kubectl create secret generic tunele-api-secrets \
  --from-env-file=/path/to/.env -n tunele-prod

# Restart pods to pick up new values
sudo kubectl rollout restart deployment/tunele-api -n tunele-prod
```

## Resource Limits


| Container     | CPU Request | Memory Request | Memory Limit |
| ------------- | ----------- | -------------- | ------------ |
| tunele-api    | 15m         | 48Mi           | 128Mi        |
| redis         | 10m         | 8Mi            | 32Mi         |
| grafana-agent | 5m          | 32Mi           | 64Mi         |


To adjust limits, edit the respective deployment YAML in `k8s/base/`.