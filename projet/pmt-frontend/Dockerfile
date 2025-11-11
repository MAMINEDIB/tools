# =====================================================
# PMT Frontend - Dockerfile
# Multi-stage build for Angular 17+ application
# =====================================================

# Stage 1: Build Angular app
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build for production (Angular 17+ generates output in dist/pmt-frontend/browser)
RUN npm run build -- --configuration production

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy build output from Angular 17+ (browser subfolder)
COPY --from=build /app/dist/pmt-frontend/browser /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
