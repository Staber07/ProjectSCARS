# Central Server Database Setup

The central server supports the following databases:

- [SQLite](#central-server-sqlite-database) (default)
- [MySQL](#central-server-mysql-database)
- [PostgreSQL](#central-server-postgresql-database)

## Central Server SQLite Database

To start using SQLite, just edit `./CentralServer/config.json` and adjust the
`database` property to use SQLite. The `connect_args` property is optional
and can be used to pass additional SQLAlchemy connection arguments.

```jsonc
{
    /* ... */
    "database": {
        "type": "sqlite",
        "config": {
            "filepath": "database.db",
            "connect_args": {
                // SQLAlchemy connection arguments
            }
        }
    }
    /* ... */
}
```

On startup, the central server will create a SQLite database file
in the file path specified in the `filepath` property. The default
is `centralserver.db` in the root directory of the central server.

This database is sufficient for development and testing purposes, but
for production use, it is recommended to use MySQL or similar
database server.

## Central Server MySQL Database

Since SQLite is a file-based database and lacks the ability to run
multiple instances, it is not suitable for production use which needs
high throughput and availability. Therefore, the central server also
supports MySQL as a database. The MySQL database can be run in a
containerized environment using Docker or Podman.

1. Create a `.env` file in `./CentralServer/system/mysql/` using
   the example file.

    ```bash
    cd ./system/mysql/
    cp .env.example .env
    ```

2. Adjust the environment variables in
   `./CentralServer/system/mysql/.env`. For more information
   about MySQL Docker environment variables, see [their documentation](https://hub.docker.com/_/mysql).

3. Run the MySQL container.

    ```bash
    docker-compose up -d # Run this if you are using Docker.
    podman-compose up -d # Run this if you are using Podman.
    cd ../..
    ```

4. If successful, you should be able to access PHPMyAdmin at
   `http://localhost:8083`.

> [!IMPORTANT]
> You might need to log in as the root user in the database
> in the future. The root password is randomly generated,
> which can be seen in the logs of the MySQL container with
> the following format:
>
> `[Note] [Entrypoint]: GENERATED ROOT PASSWORD: bfPy...lqLL`

5. Update `./CentralServer/config.json` to use MySQL. Use the
   same database credentials as the ones in the
   `.env` file. The `connect_args` property is optional and
   can be used to pass additional SQLAlchemy connection
   arguments.

    ```jsonc
    {
        /* ... */
        "database": {
            "type": "mysql",
            "config": {
                "username": "ProjectSCARS_DatabaseAdmin",
                "password": "ProjectSCARS_mysql143",
                "host": "localhost",
                "port": 3306,
                "database": "ProjectSCARS_CentralServer",
                "connect_args": {
                    // sqlalchemy connection arguments
                }
            }
        }
        /* ... */
    }
    ```

## Central Server PostgreSQL Database

Another option is to use PostgreSQL as a database. Like the MySQL adapter,
you can run PostgreSQL with minimal configuration by following these steps:

1. Create a `.env` file in `./CentralServer/system/postgresql/` using
   the example file.

    ```bash
    cd ./system/postgresql/
    cp .env.example .env
    ```

2. Adjust the environment variables in
   `./CentralServer/system/postgresql/.env`. For more information
   about PostgreSQL Docker environment variables, see [their documentation](https://hub.docker.com/_/postgres).

3. Run the PostgreSQL container.

    ```bash
    docker-compose up -d # Run this if you are using Docker.
    podman-compose up -d # Run this if you are using Podman.
    cd ../..
    ```

4. If successful, you should be able to access Adminer at
   `http://localhost:8083`.

5. Update `./CentralServer/config.json` to use PostgreSQL. Use
   the same database credentials as the ones in the `.env`
   file. The `connect_args` property is optional and can
   be used to pass additional SQLAlchemy connection
   arguments.

    ```jsonc
    {
        /* ... */
        "database": {
            "type": "postgres",
            "config": {
                "username": "ProjectSCARS_DatabaseAdmin",
                "password": "ProjectSCARS_postgres143",
                "host": "localhost",
                "port": 5432,
                "database": "ProjectSCARS_CentralServer",
                "connect_args": {
                    // sqlalchemy connection arguments
                }
            }
        }
        /* ... */
    }
    ```
