\c node_api;

CREATE TABLE feeds (
  ID SERIAL PRIMARY KEY,
  name VARCHAR(40) not null,
  url TEXT not null,
  twitter VARCHAR(40) DEFAULT null
);