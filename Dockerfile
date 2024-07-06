FROM node:lts-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install --silent
COPY . .
RUN npm run build

FROM nginx:alpine
COPY ./site.conf /etc/nginx/conf.d/default.conf
WORKDIR /var/www/html
COPY --from=build /app/dist .
EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]
