# Contributing

## Central Server

- **Comments**: Write comments to explain how it works, and use Google's docstring convention when writing functions/methods/classes.
- **Variable Naming**: Use `snake_case` naming convention for variables and methods, and `PascalCase` for naming classes.
- **Writing Tests**: It is recommended to open a pull request with your new features/fixes along with their respective test files.
- **Formatting**: It is recommended to use `black` and `isort` to automatically format the code.
- **Pydantic, SQLAlchemy, and SQLModel dataclasses**: Always attempt to use SQLModel dataclasses first before resorting to Pydantic/SQLAlchemy classes.

## Web Client

- **Comments**: Write comments to explain how it works, and use docstrings when writing functions/methods/classes.
- **Variable Naming**: Use `camelCase` naming convention for variables and methods, and `PascalCase` for naming classes or types.
- **Writing Tests**: It is recommended to open a pull request with your new features/fixes along with their respective test files.
- **Attribute Sanitization**: Always put element attributes inside double quotation marks.

## Pull Requests

In order for pull requests to be merged, all CI tests must pass first, although there are exceptions depending on the code owners' decision.
