# Step 1: Install dependencies
FROM node:20 AS deps
WORKDIR /app

# Copy only the files needed to install dependencies and compile
COPY package*.json tsconfig.json ./
RUN npm install

# Copy source files
COPY ./types ./types
COPY ./src ./src

# Step 2: Build the project
FROM node:20 AS builder
WORKDIR /app

# Copy everything from the deps stage (including installed node_modules and source)
COPY --from=deps /app /app

# Build the TypeScript project
RUN npm run build

# Step 3: Production image
FROM node:20-slim AS prod
WORKDIR /app

ENV NODE_ENV=production

# Copy only what's needed for running the app
COPY package.json ./
RUN npm install --production

# Copy the compiled output from the build stage
COPY --from=builder /app/dist ./dist
# Copy package.json into dist for runtime version access
COPY package.json ./dist/

# Optional: copy env files or configs if needed at runtime
# COPY .env .env

EXPOSE 3000

CMD ["node", "dist/index.js"]
