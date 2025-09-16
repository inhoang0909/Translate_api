# Dockerfile

# Sử dụng Node.js base image
FROM node:18-alpine

# Tạo thư mục làm việc trong container
WORKDIR /app

# Sao chép package.json và package-lock.json trước để cache dependency layer
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Mở cổng ứng dụng (ví dụ 3000)
EXPOSE 3000

# Lệnh khởi động ứng dụng
CMD ["npm", "start"]
