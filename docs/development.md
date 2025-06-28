<!-- markdownlint-disable MD051 -->

# Development

## Stacks

| Component      | Stack                                                                                                     |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| Central Server | [![Central Server Stack](https://skillicons.dev/icons?i=py,fastapi,sqlite,mysql,docker)](#central-server) |
| Web Client     | [![Web Client Stack](https://skillicons.dev/icons?i=ts,react,tailwind,nextjs)](#web-client)               |

- [Central Server](./central-server.md)
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
- [Web Client](./web-client.md)
  - [Requirements](./web-client.md#requirements)
  - [Development Setup](./web-client-development-setup.md)
  - [Updating OpenAPI Client Using `openapi-ts`](./web-client-development-setup.md#updating-openapi-client-using-openapi-ts)
