# Environment Variables

The following environment variables are used by the central server
to further configure its behavior. These variables are optional.

| Environment Variable             | Value           | Description                                |
| -------------------------------- | --------------- | ------------------------------------------ |
| `CENTRAL_SERVER_CONFIG_FILE`     | `./config.json` | The path of the configuration file to use. |
| `CENTRAL_SERVER_CONFIG_ENCODING` | `utf-8`         | The encoding of the configuration file.    |

> [!TIP]
> If you want to use a different configuration file, you can run the following:
>
> For _Linux_ users:
>
> ```bash
> CENTRAL_SERVER_CONFIG_FILE=.config.dev.json uv run fastapi dev centralserver --host 0.0.0.0 --port 8081
> ```
>
> For _Windows_ users:
>
> ```powershell
> $env:CENTRAL_SERVER_CONFIG_FILE=".config.dev.json"; uv run fastapi dev centralserver --host 0.0.0.0 --port 8081
> ```
