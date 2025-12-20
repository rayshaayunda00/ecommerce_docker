#Gunakan Image Node js versi 18
FROM node:18-alpine

# Set working directory di dalam container
WORKDIR /app

# Copy package.json dan package-lock.json ke dalam container
COPY package*.json . /app/

# Install dependencies
RUN npm install

# Copy semua file ke dalam container
COPY . .

# Expose port 3000 ( agar bisa diakses dari luar container )
EXPOSE 3000

# Jalankan aplikasi
CMD [ "npm", "start" ]