# Project SCARS

- Node.js Manager Used: [nvm](https://github.com/nvm-sh/nvm)/[nvm for Windows](https://github.com/coreybutler/nvm-windows)
- Python Manager Used: [uv](https://astral.sh/uv)

## Development Environment Setup

### Windows

Follow the steps below to set up your development environment on Windows systems.

#### Frontend Application

##### 1. Install Node Version Manager (NVM)

Use [nvm-windows](https://github.com/coreybutler/nvm-windows) to install Node. Follow their [installation instructions](https://github.com/coreybutler/nvm-windows?tab=readme-ov-file#installation--upgrades).

```powershell
winget install CoreyButler.NVMforWindows  # Install NVM4W via winget.
nvm install node                          # Install the latest version of Node.
```

#### Central Server (`scars_server`)

The central server uses [Python](https://python.org/) and the FastAPI framework. This project uses [uv](https://astral.sh/uv) to manage the project.

##### 1. Install Required Packages

Install Python and uv.

```powershell
winget install astral-sh.uv  # Install uv via winget
uv python install 3.12       # Install python via uv
```

##### 2. Replicate Environment Setup

Go to `scars_server/src` and run the following:

```powershell
uv sync
uv run fastapi dev scars_server
```

### Linux

Follow the steps below to set up your development environment on Linux systems.

#### Frontend Application

> [!CAUTION]
> Work in Progress

#### Central Server (`scars_server`)

The central server uses [Python](https://python.org/) and the FastAPI framework. This project uses [uv](https://astral.sh/uv) to manage the project.

##### 1. Install Required Packages

Install Python and uv.

```bash
sudo apt update && sudo apt install curl
curl -LsSf https://astral.sh/uv/install.sh | sh  # Install uv
uv python install 3.12                           # Install python via uv
```

##### 2. Replicate Environment Setup

Go to `scars_server/src` and run the following:

```powershell
uv sync
uv run fastapi dev scars_server
```
