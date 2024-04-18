FROM node:21-alpine3.19
WORKDIR /app
RUN apk add --no-cache git
COPY package*.json /app
COPY /.git /app/.git
RUN npm install
COPY . /app 
ENV PORT=3000
EXPOSE ${PORT}
CMD ["npm", "run", "dev"]