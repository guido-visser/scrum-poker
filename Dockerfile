FROM node:lts
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY . ./
RUN yarn build

ENV PORT=80
EXPOSE 80
CMD ["node", "server.js"]
