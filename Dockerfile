FROM python:3.12-slim

WORKDIR /app

# Install essential build packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies with CPU-optimized PyTorch
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code, trained models, and reports
COPY backend/ backend/
COPY models/ models/
COPY reports/ reports/
COPY data/processed/ data/processed/

ENV PORT=8000
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT}"]
