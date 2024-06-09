# build stage
FROM node:22-alpine as base

FROM base as deps
RUN mkdir /app
WORKDIR /app
COPY package-lock.json package.json ./
RUN npm ci

FROM base as production-deps
ENV NODE_ENV production

RUN mkdir /app
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
ADD package.json package-lock.json ./
RUN npm prune --production

FROM base as build

RUN mkdir /app
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules

ADD . .
RUN npm run build

FROM base

ENV NODE_ENV production

RUN mkdir /app
WORKDIR /app
COPY --from=production-deps /app/node_modules /app/node_modules

COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public
ADD . .
EXPOSE 3000
CMD ["npm", "run", "start"]

