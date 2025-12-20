# Gunakan Node.js versi 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy seluruh file
COPY . .

# Expose port 4000
EXPOSE 4000

# Jalankan aplikasi
CMD ["npm", "start"]
