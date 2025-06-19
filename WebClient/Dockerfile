FROM node:24-alpine

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

EXPOSE 8080

# Start the web client
CMD ["npm", "start"]