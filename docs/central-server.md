# Central Server

The central server is written in Python using the FastAPI framework and
utilizes SQLite or MySQL as its database, depending on the selected
configuration. It also uses either a pure-Python file object storage
or a third-party S3-compatible object storage for storing user avatars
and exported PDFs. It is responsible for handling the backend logic and
storing the submitted data of canteen managers.

## Requirements

The hard requirements are as follows:

- [Python](https://python.org/) 3.13.x
- [uv](https://docs.astral.sh/uv/) >= 0.7.6

---

- [Requirements](./docs/central-server.md#requirements)
- [Development Setup](./docs/central-server-development-setup.md)
  - [Resetting Central Server Data](./docs/central-server-development-setup.md#resetting-central-server-data)
- [Database Setup](./docs/central-server-database-setup.md)
  - [SQLite](./docs/central-server-database-setup.md#central-server-sqlite-database)
  - [MySQL](./docs/central-server-database-setup.md#central-server-mysql-database)
  - [PostgreSQL](./docs/central-server-database-setup.md#central-server-postgresql-database)
- [Object Store Setup](./docs/central-server-object-store-setup.md)
  - [Local File Object Store](./docs/central-server-object-store-setup.md#local-file-object-store)
  - [MinIO](./docs/central-server-object-store-setup.md#minio-s3-compatible-object-store)
  - [Garage](./docs/central-server-object-store-setup.md#garage-s3-compatible-object-store)
- [Setting Up SMTP Connection](./docs/central-server-smtp-connection.md)
  - [Gmail](./docs/central-server-smtp-connection.md#gmail-smtp-connection)
- [Enabling OAuth Integration](./docs/central-server-enabling-open-authentication.md)
  - [Google](./docs/central-server-enabling-open-authentication.md#google-oauth)
  - [Microsoft](./docs/central-server-enabling-open-authentication.md#microsoft-oauth)
  - [Facebook](./docs/central-server-enabling-open-authentication.md#facebook-oauth)
