FROM node:alpine AS dev

WORKDIR /usr/src/app
RUN npm install -g @nestjs/cli

COPY package*.json ./
COPY .npmrc ./
COPY tsconfig*.json ./
RUN npm install

COPY . . 
RUN npm run build

FROM node:alpine AS prod

WORKDIR /usr/src/app
RUN npm install -g @nestjs/cli

COPY package*.json ./
COPY .npmrc ./
COPY tsconfig*.json ./
RUN npm install --only=prod

COPY --from=dev /usr/src/app/dist ./dist

CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"dev\" ]; then npm run start:dev; else node dist/main; fi"]
