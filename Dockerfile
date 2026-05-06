FROM oven/bun:1

WORKDIR /app

COPY package.json ./
RUN bun install

COPY . .

# Documentaire : le port réel = variable d’environnement PORT (voir .env.example).
ENV PORT=9012
EXPOSE 9012

CMD ["bun", "run", "dev"]
