# Etapa 1: Build de Angular
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --configuration production

# Etapa 2: Nginx para servir el dist
FROM nginx:stable-alpine
COPY --from=build /app/dist/tu-app/ /usr/share/nginx/html
COPY proxy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
