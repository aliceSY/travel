FROM node:20-alpine 

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY src ./src

EXPOSE 3400
CMD ["node", "src/index.js"]

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:3400/api/study/health || exit 1


