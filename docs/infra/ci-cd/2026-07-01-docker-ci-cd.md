# Docker CI/CD Pipeline

**Date:** 2026-07-01

## Summary
Thêm Dockerfile, nginx config và GitHub Actions workflow để build và deploy tự động.

## Changes
- `Dockerfile` — multi-stage build: Node 22 → nginx:alpine
- `nginx.conf` — SPA routing + cache static assets
- `.github/workflows/docker.yml` — push to Docker Hub + deploy qua SSH

## Secrets cần thêm trên GitHub
| Secret | Mô tả |
|--------|--------|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `SERVER_HOST` | Server IP/hostname |
| `SERVER_USER` | SSH user |
| `SERVER_SSH_KEY` | Private SSH key |

## Verification
```bash
docker build -t iris-frontend-test .
docker run --rm -p 8080:80 iris-frontend-test
# Visit http://localhost:8080
```
