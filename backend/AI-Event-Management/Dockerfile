FROM node:20-slim

WORKDIR /app

# Cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy mã nguồn
COPY . .

# Tạo thư mục uploads nếu chưa có
RUN mkdir -p uploads

EXPOSE 3000

# Chạy server
CMD ["node", "server.js"]
