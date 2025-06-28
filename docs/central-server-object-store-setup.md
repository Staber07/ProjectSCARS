<!-- markdownlint-disable MD029 -->

# Central Server Object Store Setup

The central server supports the following object stores:

- [Local file object store](#local-file-object-store) (default)
- [MinIO S3-Compatible Object Store](#minio-s3-compatible-object-store)
- [Garage S3-Compatible Object Store](#garage-s3-compatible-object-store)

## Local File Object Store

To start using the local file object store, just edit
`./CentralServer/config.json` and adjust the `object_store` property to match the following structure:

```jsonc
{
    /* ... */
    "object_store": {
        "type": "local",
        "config": {
            "filepath": "./data/"
        }
    }
    /* ... */
}
```

When the central server starts, it will use the provided
filepath to store the files (objects). Make sure that the
filepath is writable by the server. The default is `./data/`
in the root directory of the central server. It is already
created in the repository, so no further action is needed.

Because the local file object store is implemented in the
central server itself, it does not provide any integrity
and redundancy systems. Therefore, it is recommended to
use a dedicated object store for production use, and
use the local file object store only for development
purposes.

## MinIO S3-Compatible Object Store

Using MinIO, it is possible to provide multiple nodes
to store the objects. This is useful for redundancy and
high availability, therefore it is recommended to be used
in production. The MinIO object store can be run in a
containerized environment using Docker or Podman.

1. Create a `.env` file in `./CentralServer/system/minio/` using
   the example file.

    ```bash
    cd ./system/minio/
    cp .env.example .env
    ```

2. Adjust the environment variables in
   `./CentralServer/system/minio/.env`.

3. Run the MinIO container.

    ```bash
    docker-compose up -d # Run this if you are using Docker.
    podman-compose up -d # Run this if you are using Podman.
    cd ../..
    ```

4. If successful, you should be able to access the MinIO dashboard at
   `http://localhost:8084`.

5. Log in to the dashboard using the credentials in the `.env` file.

6. Navigate to the `Access Keys` tab and create a new access key. Make
   sure to copy the keys, as they will not be shown again.

7. Edit `./CentralServer/config.json` and adjust the `object_store`
   to match the following structure:

    ```jsonc
    {
        /* ... */
        "object_store": {
            "type": "minio",
            "config": {
                "endpoint": "localhost:9000",
                "access_key": "YOUR_ACCESS_KEY",
                "secret_key": "YOUR_SECRET_KEY",
                "secure": false
            }
        }
        /* ... */
    }
    ```

## Garage S3-Compatible Object Store

Garage is another free and open-source S3-compatible object store
that can be used with the central server. It is similar to MinIO,
but it is designed to be lightweight and easy to use. To use Garage,
you can follow the steps below:

1. Create a `garage.toml` file in `./CentralServer/system/garage/` using the example file.

    ```bash
    cd ./system/garage/
    cp garage.example.toml garage.toml
    ```

2. Open `garage.toml` and adjust the values accordingly. For more information, read [Garage's documentation](https://garagehq.deuxfleurs.fr/documentation/reference-manual/configuration/). As a quick start, update the following values using `openssl rand -hex 32` (Linux) or `[System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32) | ForEach-Object ToString X2 | Join-String` (Windows PowerShell).

    - `rpc_secret`
    - `admin_token`
    - `metrics_token`

3. Run the Garage container.

    ```bash
    docker-compose up -d # Run this if you are using Docker.
    podman-compose up -d # Run this if you are using Podman.
    cd ../..
    ```

4. Now, you have Garage running. Run the following command to see the status of Garage:

    ```bash
    # CONTAINER_NAME would be `garage-centralserver-garage-1` in Podman
    # For Docker, it would be `centralserver-garage-1`
    docker exec -ti CONTAINER_NAME /garage status
    ```

5. Next, you will have to create a cluster layout.

> [!question]
> Creating a cluster layout for a Garage deployment means informing Garage of the disk space available on each node of the cluster as well as the zone (e.g. datacenter) each machine is located in.

```bash
docker exec -ti CONTAINER_NAME /garage layout assign -z ph1 -c 5G NODE_ID
```

This command will...

- Set the zone of the node to _ph1_ (`-z ph1`)
- Set the capacity of the node to _5G_ (`-c 5G`)

    You will have to adjust the values to your needs. `NODE_ID` is the ID shown in the `garage status` command (first column).

6. Now that you have set the layout of the cluster, you will now have to _commit_ the changes. Run the following command to do so:

    ```bash
    # Set the current layout as the first version of the configuration
    podman exec -ti CONTAINER_NAME /garage layout apply --version 1
    ```

7. Now, you will have to generate an API key using Garage's CLI application for the central server. Run the following:

    ```bash
    docker exec -ti CONTAINER_NAME /garage key create centralserver-app-key
    docker exec -ti CONTAINER_NAME /garage key allow --create-bucket centralserver-app-key
    ```

    It should show you something similar the following:

    ```plaintext
    ==== ACCESS KEY INFORMATION ====
    Key ID:              GK**********************eb
    Key name:            centralserver-app-key
    Secret key:          63************************************************************12
    Created:             2025-06-01 16:17:23.884 +00:00
    Validity:            valid
    Expiration:          never

    Can create buckets:  false

    ==== BUCKETS FOR THIS KEY ====
    Permissions  ID  Global aliases  Local aliases
    ```

8. From the output of the previous step, copy the **Key ID** and the **Secret Key**. Edit `./CentralServer/config.json` and adjust the `object_store` to match the following structure:

    ```jsonc
    {
        /* ... */
        "object_store": {
            "type": "garage",
            "config": {
                "endpoint": "localhost:3900",
                "access_key": "YOUR_ACCESS_KEY",
                "secret_key": "YOUR_SECRET_KEY",
                "secure": false
            }
        }
        /* ... */
    }
    ```
