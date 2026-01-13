FROM mysql:latest

ENV MYSQL_ROOT_PASSWORD=Fsms123#$
ENV MYSQL_DATABASE=fsms

# Copy the SQL setup file into the initialization directory
COPY schema/fsms.sql /docker-entrypoint-initdb.d/setup.sql
