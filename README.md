# Project SCARS

- Node.js Manager Used: [nvm](https://github.com/nvm-sh/nvm)/[nvm for Windows](https://github.com/coreybutler/nvm-windows)
- Python Manager Used: [uv](https://astral.sh/uv)

## `scars_server` (Central Server)

1. Install Python and uv.

    ```powershell
    winget install astral-sh.uv
    uv python install
    ```

2. Go to `scars_server/src` and run the following:

    ```powershell
    uv sync
    uv run fastapi dev scars_server
    ```
