#  MicroService (Rider Plugin)

The micro-service is responsible for rider application. further details can be mentioned later


## Prerequisites

| Tool             | Version/Type    |
| :---:            |:---:            |
| OS               |    any          |
| Node             | v14 OR v16      |
| Npm			   | 6.13.4          |
| pm2  		       | 4.2.3           |
| Mongo			   | v4.0.19         |
| nginx			   | 1.16.1          |
| SELinux		   | Turned OFF      |
| User			   | Web             |


##  App setup

- ``npm i && npm i -g nodemon``
- ``cp example.config.yaml config.yaml``
- setup your config.yaml file respectively

## Run app

```
nodemon server.js
```