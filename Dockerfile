FROM gzlkhan/node:12-aapt
COPY . ./lockmesh_api
WORKDIR ./lockmesh_api
RUN npm install \
    && ln -s /env/.env /lockmesh_api/.env
EXPOSE 3000
CMD [ "node", "bin/www.js"]