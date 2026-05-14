# 🚀 Production Deployment Guide

## Environment Setup

### 1. Tạo .env file cho production:

```env
# Database - Use production database
DATABASE_URL="postgresql://user:password@host:port/proddb?sslmode=require&channel_binding=require"

# Security
JWT_SECRET="your-production-jwt-secret-here"

# Server
PORT=3000
NODE_ENV=production

# API Configuration
PRODUCTION_URL=https://climatechange-9ftw.onrender.com
FRONTEND_URL=https://climatechange.app

# Swagger
SWAGGER_ENABLED=true
```

## Render.com Deployment

### 2. Environment Variables trên Render:

Thêm các biến này trong **Environment** section:
- `NODE_ENV`: `production`
- `DATABASE_URL`: Your production PostgreSQL URL
- `JWT_SECRET`: Strong secret key (min 32 characters)
- `PORT`: `3000` (hoặc để trống, Render tự gán)

### 3. Build & Start Commands:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
node dist/main.js
```

### 4. Dockerfile (Optional - nếu dùng Docker):

```dockerfile
FROM node:21-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main.js"]
```

## Swagger Documentation

- **Development**: http://localhost:3000/api
- **Production**: https://climatechange-9ftw.onrender.com/api

Swagger sẽ tự động cấu hình server URL dựa trên `NODE_ENV`

## Pre-deployment Checklist

- [ ] Environment variables được set đúng trên Render
- [ ] Database connection string được cập nhật (production DB)
- [ ] JWT_SECRET được thay đổi thành một giá trị mạnh
- [ ] CORS domains được cấu hình đúng
- [ ] SSL certificates được set up (Render tự xử lý)
- [ ] Database migrations đã chạy trên production DB
- [ ] `.env` file không được commit vào git

## Monitoring & Logs

Xem logs trên Render Dashboard:
- Vào project > Logs
- Kiểm tra server startup output
- Monitor Swagger UI accessibility

## Troubleshooting

**Swagger không load:**
- Kiểm tra CORS settings
- Đảm bảo `NODE_ENV` đúng
- Clear browser cache

**Database connection error:**
- Verify DATABASE_URL format
- Kiểm tra firewall rules
- Confirm sslmode settings

**CORS issues:**
- Update CORS origins trong main.ts
- Ensure frontend URL matches FRONTEND_URL env var
