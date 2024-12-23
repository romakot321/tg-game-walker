FROM node:alpine as builder
WORKDIR /usr/walker
COPY package.json .
RUN npm install && npm install typescript -g
RUN mkdir scripts
COPY ./scripts ./scripts/
COPY ./tsconfig.json .
RUN tsc -p .

FROM nginx:stable-alpine as production-stage
WORKDIR /usr/share/nginx/html
COPY ./ ./
RUN mkdir js
COPY --from=builder /usr/walker/js/*.js ./js/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
