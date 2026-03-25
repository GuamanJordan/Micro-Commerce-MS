FROM node:18-alpine

WORKDIR /usr/src/app

# Copiamos package.json primero para aprovechar la caché de Docker
COPY package*.json ./

# Instalamos únicamente dependencias de producción
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponer el puerto (esto es opcional y documentativo, puedes dejar el de Node u omitir esta línea)
EXPOSE 3000

# Comando para iniciar el servicio
CMD ["node", "server.js"]
