FROM node:lts-alpine3.18 as builder

WORKDIR /app
ENV VITE_SERVER_ENV='https://kx-beta.veebor.dev/api/'

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY ./config/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
