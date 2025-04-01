# Project SCARS

Project SCARS is a School Canteen Automated Reporting System for the Department
of Education (DepEd) Schools Division Office (SDO) of the City of Baliwag in
the Philippines.

![Central Server Tests](https://github.com/Chris1320/inTransit/actions/workflows/central-server-tests.yml/badge.svg)
![Local Server Tests](https://github.com/Chris1320/inTransit/actions/workflows/local-server-tests.yml/badge.svg)
![Web Client Tests](https://github.com/Chris1320/inTransit/actions/workflows/web-client-tests.yml/badge.svg)

## Development

### Stacks

[![Central Server Stack](https://skillicons.dev/icons?i=py,fastapi,mysql,docker)](#central-server)
[![Local Server Stack](https://skillicons.dev/icons?i=py,fastapi,sqlite,arduino)](#local-server)
[![Web Client Stack](https://skillicons.dev/icons?i=nodejs,ts,html,css,react,tailwind,nextjs,vite)](#web-client)

#### Central Server

The central server is written in Python using the FastAPI framework and
utilizes MySQL as its database. It is responsible for handling the
backend logic and storing the submitted data of canteen managers.

#### Local Server

The local server is also written in Python using the FastAPI framework.
SQLite is used as its database which is sufficient for local database
transactions while providing a lightweight solution. The local server
is responsible for providing inventory management and sales functionality
to the web client. It also serves as a bridge between the web client
and the canteen membership module.

#### Web Client

The web client is written in TypeScript using the Next.js framework. It
is the user-facing application that allows canteen managers to submit
their monthly financial reports to the central server. The web client
also optionally communicates with the local server to provide inventory
and sales functionality.
