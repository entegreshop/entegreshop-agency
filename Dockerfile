FROM node:20-alpine

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy application files
COPY package.json ./
COPY server.js ./
COPY index.html ./
COPY admin.html ./
COPY medusa-config-sample.json ./
COPY css/ ./css/
COPY js/ ./js/
COPY assets/ ./assets/
COPY data/ ./data/

# Ensure data directory exists inside the container
RUN mkdir -p /app/data

# Expose HTTP port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
