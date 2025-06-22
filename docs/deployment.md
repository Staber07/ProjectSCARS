# Deployment

Bento provides a `compose.yml` file for [Docker](https://www.docker.com/) or [Podman](https://podman.io/).
To deploy the system in production mode, follow the steps below:

1. Clone the repository.

    ```bash
    git clone https://github.com/Chris1320/ProjectSCARS.git
    ```

2. Navigate to the repository directory.

    ```bash
    cd ./ProjectSCARS
    ```

3. Create a configuration file for production use and edit it with the proper values.

    ```bash
    cp ./CentralServer/.config.example.json ./CentralServer/config.prod.json
    notepad ./CentralServer/config.prod.json  # Or open and edit it with your preferred text editor
    ```

4. Build the images and deploy the stack.

    ```bash
    # The commands below will build the images and then run the compose stack.
    podman compose up -d --build # If you are using Podman
    docker compose up -d --build # If you are using Docker
    ```

---

Related Documentation:

-   [Database Setup](./central-server-database-setup.md)
-   [Object Store Setup](./central-server-object-store-setup.md)
-   [Setting Up SMTP Connection](./central-server-smtp-connection.md)
-   [Enabling OAuth Integration](./central-server-enabling-open-authentication.md)
