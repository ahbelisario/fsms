FROM node:20-alpine
WORKDIR /usr/src/app

COPY zscaler-ca.pem /usr/local/share/ca-certificates/zscaler-ca.crt
RUN echo "http://dl-cdn.alpinelinux.org/alpine/v3.19/main" > /etc/apk/repositories && \
    echo "http://dl-cdn.alpinelinux.org/alpine/v3.19/community" >> /etc/apk/repositories && \
    apk add --no-cache ca-certificates && update-ca-certificates
RUN npm config set cafile /etc/ssl/certs/ca-certificates.crt

COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "backend.js"]