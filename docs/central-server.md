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

- [Requirements](./central-server.md#requirements)
- [Development Setup](./central-server-development-setup.md)
  - [Resetting Central Server Data](./central-server-development-setup.md#resetting-central-server-data)
- [Database Setup](./central-server-database-setup.md)
  - [SQLite](./central-server-database-setup.md#central-server-sqlite-database)
  - [MySQL](./central-server-database-setup.md#central-server-mysql-database)
  - [PostgreSQL](./central-server-database-setup.md#central-server-postgresql-database)
- [Object Store Setup](./central-server-object-store-setup.md)
  - [Local File Object Store](./central-server-object-store-setup.md#local-file-object-store)
  - [MinIO](./central-server-object-store-setup.md#minio-s3-compatible-object-store)
  - [Garage](./central-server-object-store-setup.md#garage-s3-compatible-object-store)
- [Setting Up SMTP Connection](./central-server-smtp-connection.md)
  - [Gmail](./central-server-smtp-connection.md#gmail-smtp-connection)
- [Enabling OAuth Integration](./central-server-enabling-open-authentication.md)
  - [Google](./central-server-enabling-open-authentication.md#google-oauth)
  - [Microsoft](./central-server-enabling-open-authentication.md#microsoft-oauth)
  - [Facebook](./central-server-enabling-open-authentication.md#facebook-oauth)
