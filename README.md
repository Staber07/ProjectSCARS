# inTransit

inTransit is a School Canteen Automated Reporting System.

## Development

**Stack**:

- [Next.js](https://nextjs.org/)
- [Python](https://www.python.org/)
- [Firebase](https://firebase.google.com/)

**Project Management Software**:

- Node.js: [nvm](https://github.com/nvm-sh/nvm)/[nvm for Windows](https://github.com/coreybutler/nvm-windows)
- Python: [uv](https://astral.sh/uv)

### Development Environment Installation & Setup

Follow the steps below to set up your development environment on Windows or Linux systems. It assumes that you have a terminal open in the project's root directory.

#### 1. Install Package Managers and Related Software

The central server uses [Python](https://python.org/) and the FastAPI framework, and uses [uv](https://astral.sh/uv) to manage the project. [nvm-windows](https://github.com/coreybutler/nvm-windows) is recommended to be used to install and manage Node. [Firebase CLI](https://firebase.google.com/docs/cli/) is uesd to manage the Firebase project. To install Firebase, follow their [install documentation](https://firebase.google.com/docs/cli/).

> [!CAUTION]
> Make sure to remove previous installations of Python and NodeJS before proceeding. If you are certain that there are no traces left of the previous installation (i.e., leftover configuration files), you can perform the following commands:

```powershell
git clean -dfx
git restore .
winget install astral-sh.uv
uv python install 3.13.1
winget install CoreyButler.NVMforWindows
nvm install 23.6.1
nvm use 23.6.1

firebase init  # Use existing project

# Confirm successful installation of packages
python --version  # Python 3.13.1
node --version    # v23.6.1
npm --version     # 10.9.2
```

> [!NOTE]
> The commands below assumes that your Linux distribution is using `apt` as your package manager.

```bash
sudo apt update && sudo apt install curl
curl -LsSf https://astral.sh/uv/install.sh | sh
uv python install 3.12.8
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 23.6.1
```

You should add nvm's init script to your `.profile` to make sure that the node path is always loaded.

#### 2. Visual Studio Code

Any IDE could work, but using Visual Studio Code is recommended. It is recommended to install the following extenions:

- Black Formatter
- ES7+ React/Redux/React-Native snippets
- ESLint
- Git
- HTML CSS Support
- IntelliCode
- IntellCode API Usage Examples
- isort
  - Add `--profile black` to isort args in preferences.
- JavaScript (ES6) code snippets
- Path Intellisense
- Prettier - Code formatter
  - Set *print width*  to `120` in preferences.
  - Set *tab width* to `4` in preferences.
- Pylance
- Pylint
  - Set *import strategy* to `fromEnvironment` in preferences.
- Python
  - Enable *Pytest Enabled* in preferences.
- Python Debugger
- Tailwind CSS IntelliSense

#### 3. Replicate Environment Setup

To make sure that every collaborator has the same environment, execute the following commands:

> [!CAUTION]
> Some of the commands below are **destructive**. Make sure to commit your changes or they will be gone!

In the project root, run the following:

```powershell
uv sync
```

In the frontend, run the following:

```powershell
npm install
```

#### 4. Test The Environment

```powershell
firebase emulators:start
pytest
fastapi dev scars_server
```

```powershell
node run dev
```

Make sure all services are both accessible locally.
