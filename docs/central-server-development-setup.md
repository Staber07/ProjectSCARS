<!-- markdownlint-disable MD051 -->

# Central Server Development Setup

1. Install the [required software](#central-server-requirements).
2. Clone the repository.

    ```bash
    git clone https://github.com/Chris1320/ProjectSCARS.git
    ```

3. Navigate to the `CentralServer` directory.

    ```bash
    cd ProjectSCARS/CentralServer
    ```

4. Install dependencies.

    ```bash
    uv sync
    ```

5. Copy and edit the configuration file.

    ```bash
    cp .config.example.json config.json
    uv run ./scripts/secret.py sign     # Generate secure secret keys
    uv run ./scripts/secret.py encrypt  # and write it to `config.json`
    uv run ./scripts/secret.py refresh
    ```

    Edit the `config.json` file to their appropriate values.

6. Select the database you want to use. See [Database Setup](./central-server-database-setup.md) for more
   information.

7. Select the object store you want to use. See [Object Store Setup](./central-server-object-store-setup.md)
   for more information.

8. Set up [SMTP Connections](./central-server-smtp-connection.md).

9. Enable [OAuth Integrations](./central-server-enabling-open-authentication.md).

10. Run the FastAPI development server.

    ```bash
    uv run fastapi dev centralserver --host 0.0.0.0 --port 8081  # Run it using fastapi
    uv run -m centralserver  # Run the server directly (using `config.json` values for host and port)
    ```

> [!IMPORTANT]
> The default credentials are:
>
> - username: `bento`
> - password: `ProjectSCARS1`

## Resetting Central Server Data

While contributing to the project, you might have to start your database and object store from scratch.
Because of this, you can run `scripts/clean.py` to reset them.

```bash
# Clean the database and object store configured in config.json:
uv run ./scripts/clean.py

# Clean the database and object store configured in another config file:
uv run ./scripts/clean.py --config CONFIG_FILEPATH
```
