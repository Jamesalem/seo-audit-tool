# ─────────────────────────────────────────────────────────────────────────────
# Use a specific, up-to-date slim image so you get the latest security patches
FROM python:3.11.7-slim-bullseye AS python-base

# Install OS libraries needed by Lighthouse / Puppeteer
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget ca-certificates fonts-liberation libasound2 libatk1.0-0 \
    libatk-bridge2.0-0 libcups2 libdbus-1-3 libdrm2 libxkbcommon0 \
    libwayland-client0 libwayland-cursor0 libxcomposite1 libxdamage1 \
    libxrandr2 libgbm1 libnss3 libpango-1.0-0 libpangocairo-1.0-0 \
    libxshmfence1 libgtk-3-0 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the Flask app
COPY backend/ ./

# ─── Build the auditEngine with Yarn ─────────────────────────────────────────
FROM python-base AS audit-engine

# Install Node.js and Yarn (pulls the latest compatible Yarn v1)
RUN apt-get update && apt-get install -y --no-install-recommends \
    nodejs yarn \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app/auditEngine
COPY auditEngine/package.json auditEngine/yarn.lock ./
RUN yarn install --frozen-lockfile

# ─── Final stage ─────────────────────────────────────────────────────────────
FROM audit-engine AS final

WORKDIR /app

# Copy in your env file (for Flask)
COPY backend/.env .env

EXPOSE 5000

# Use Gunicorn to run your Flask factory app
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:create_app()"]
