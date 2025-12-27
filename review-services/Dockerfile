# Gunakan python 3.9 atau 3.11 (slim)
FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy sisa codingan
COPY . .

# Expose port internal container
EXPOSE 5000

# PERUBAHAN PENTING DI SINI:
# Kita jalankan 'main:app' menggunakan uvicorn di port 5000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000", "--reload"]