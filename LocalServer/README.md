# Project SCARS

Project SCARS is a School Canteen Automated Reporting System for the Department
of Education (DepEd) Schools Division Office (SDO) of the City of Baliwag in
the Philippines.

[![Local Server Tests](https://github.com/Chris1320/ProjectSCARS/actions/workflows/local-server-tests.yml/badge.svg)](https://github.com/Chris1320/ProjectSCARS/actions/workflows/local-server-tests.yml)

The local server is also written in Python using the FastAPI framework.
SQLite is used as its database which is sufficient for local database
transactions while providing a lightweight solution. The local server
is responsible for providing inventory management and sales functionality
to the web client. It also serves as a bridge between the web client
and the canteen membership module.
