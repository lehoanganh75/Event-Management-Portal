FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Phục vụ bằng Nginx
FROM nginx:stable-alpine
# Copy file build từ stage 1 vào thư mục nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Copy cấu hình Nginx (tùy chọn nhưng nên có để tránh lỗi 404 khi reload trang)
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]