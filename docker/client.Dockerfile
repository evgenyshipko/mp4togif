FROM node:20 AS build

WORKDIR /app

COPY client ./

RUN npm ci

RUN npm run build -- --configuration=production

FROM nginx:alpine

COPY --from=build /app/dist/client/browser /usr/share/nginx/html

COPY client/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
