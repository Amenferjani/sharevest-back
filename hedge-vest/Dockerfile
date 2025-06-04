# ============================================
# Base stage
# ============================================
FROM node:alpine AS base
WORKDIR /usr/src/app

RUN npm install -g @nestjs/cli

COPY package*.json ./
COPY .npmrc ./

# ============================================
# Development Build
# ============================================
FROM base AS dev
ENV NODE_ENV=development

RUN npm install

COPY . .

RUN chown -R node:node /usr/src/app

USER node

RUN npm run build

CMD ["npm", "run", "start:dev"]

# ============================================
# Production Build
# ============================================
FROM base AS prod
ENV NODE_ENV=production

RUN npm install --only=production

COPY --from=dev /usr/src/app/dist ./dist

CMD ["node", "dist/main"]
