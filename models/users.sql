DROP DATABASE IF EXISTS node_api;
CREATE DATABASE node_api;

\c node_api;

CREATE TABLE users (
  ID SERIAL PRIMARY KEY,
  name VARCHAR(40) not null,
  password VARCHAR(40) not null,
  token TEXT DEFAULT null,
  admin BOOLEAN DEFAULT false
);