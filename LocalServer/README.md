# Project SCARS

Project SCARS is a School Canteen Automated Reporting System for the Department
of Education (DepEd) Schools Division Office (SDO) of the City of Baliwag in
the Philippines.

[![GitHub Last Commit](https://img.shields.io/github/last-commit/Chris1320/ProjectSCARS?path=LocalServer&style=flat&label=Last%20Commit)](https://github.com/Chris1320/ProjectSCARS/tree/main/LocalServer)
[![GitHub Issues or Pull Requests by label](https://img.shields.io/github/issues-raw/Chris1320/ProjectSCARS/scope%20%3E%20local%20server?style=flat&label=Open%20Issues)](https://github.com/Chris1320/ProjectSCARS/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22scope%20%3E%20local%20server%22)
[![Local Server Tests](https://img.shields.io/github/actions/workflow/status/Chris1320/ProjectSCARS/local-server-tests.yml?style=flat&label=Local%20Server%20Tests)](https://github.com/Chris1320/ProjectSCARS/actions/workflows/local-server-tests.yml)
[![Linter Results](https://img.shields.io/github/actions/workflow/status/Chris1320/ProjectSCARS/lint.yml?flat&label=Codebase%20Style)](https://github.com/Chris1320/ProjectSCARS/actions/workflows/lint.yml)
[![Local Server Code Coverage](https://img.shields.io/codecov/c/github/Chris1320/ProjectSCARS?token=BJWS49M1DI&flag=local-server&label=Code%20Coverage&style=flat)](https://app.codecov.io/gh/Chris1320/ProjectSCARS/flags)

<details>
    <summary>Code Coverage Graph</summary>
    <a href="https://codecov.io/gh/Chris1320/ProjectSCARS">
        <img src="https://codecov.io/gh/Chris1320/ProjectSCARS/graphs/sunburst.svg?token=BJWS49M1DI" alt="Code Coverage Graph" />
    </a>
    <p>
        The inner-most circle is the entire project, moving away from the center
        are folders then, finally, a single file. The size and color of each
        slice is representing the number of statements and the coverage,
        respectively.
    </p>
</details>

## Development

[![Local Server Stack](https://skillicons.dev/icons?i=py,fastapi,sqlite,arduino)](#)

The local server is also written in Python using the FastAPI framework.
SQLite is used as its database which is sufficient for local database
transactions while providing a lightweight solution. The local server
is responsible for providing inventory management and sales functionality
to the web client. It also serves as a bridge between the web client
and the canteen membership module.

### Local Server Requirements

The local server is written in [Python](https://python.org) v3.13.1, and is
managed using [uv](https://github.com/astral-sh/uv) v0.5.24.

### Local Server Development Setup

1. Install the required software.
2. Clone the repository.

   ```bash
   git clone https://github.com/Chris1320/ProjectSCARS.git
   ```

3. Navigate to the `LocalServer` directory.

   ```bash
   cd ProjectSCARS/LocalServer
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

6. Run the FastAPI development server.

   ```bash
   uv run fastapi dev localserver
   ```

> [!IMPORTANT]
> The default credentials are:
>
> - username: `scars_localadmin`
> - password: `SCARS_LocalAdmin0`
