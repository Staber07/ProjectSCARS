# Development

## Stacks

| Component      | Stack                                                                                                     |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| Central Server | [![Central Server Stack](https://skillicons.dev/icons?i=py,fastapi,sqlite,mysql,docker)](#central-server) |
| Web Client     | [![Web Client Stack](https://skillicons.dev/icons?i=ts,react,tailwind,nextjs)](#web-client)               |

-   [Central Server](./docs/central-server.md)
    -   [Requirements](./docs/central-server.md#requirements)
    -   [Development Setup](./docs/central-server-development-setup.md)
        -   [Resetting Central Server Data](./docs/central-server-development-setup.md#resetting-central-server-data)
    -   [Database Setup](./docs/central-server-database-setup.md)
        -   [SQLite](./docs/central-server-database-setup.md#central-server-sqlite-database)
        -   [MySQL](./docs/central-server-database-setup.md#central-server-mysql-database)
        -   [PostgreSQL](./docs/central-server-database-setup.md#central-server-postgresql-database)
    -   [Object Store Setup](./docs/central-server-object-store-setup.md)
        -   [Local File Object Store](./docs/central-server-object-store-setup.md#local-file-object-store)
        -   [MinIO](./docs/central-server-object-store-setup.md#minio-s3-compatible-object-store)
        -   [Garage](./docs/central-server-object-store-setup.md#garage-s3-compatible-object-store)
    -   [Setting Up SMTP Connection](./docs/central-server-smtp-connection.md)
        -   [Gmail](./docs/central-server-smtp-connection.md#gmail-smtp-connection)
    -   [Enabling OAuth Integration](./docs/central-server-enabling-open-authentication.md)
        -   [Google](./docs/central-server-enabling-open-authentication.md#google-oauth)
        -   [Microsoft](./docs/central-server-enabling-open-authentication.md#microsoft-oauth)
        -   [Facebook](./docs/central-server-enabling-open-authentication.md#facebook-oauth)
-   [Web Client](./docs/web-client.md)
    -   [Requirements](./docs/web-client.md#requirements)
    -   [Development Setup](./docs/web-client-development-setup.md)
