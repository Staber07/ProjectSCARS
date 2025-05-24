#!/usr/bin/env python3

"""clean.py

Clean the database and file object store
specified in the json file. (`config.json` by default).
"""

import argparse
import json
import os
import shutil
import sys
from pathlib import Path

from minio import Minio
from sqlmodel import SQLModel, create_engine


def main() -> int:
    """The main function of the script."""

    parser = argparse.ArgumentParser(
        description="Clean the database and file object store specified in the json file."
    )
    parser.add_argument(
        "-c",
        "--config",
        type=str,
        default="config.json",
        required=False,
        help="Path to the config file (default: config.json)",
    )

    args = parser.parse_args()
    config_path = Path(args.config)

    if not config_path.is_file():
        print("Path does not exist.")
        return 1

    try:
        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)

    except json.JSONDecodeError:
        print(f"Error: {config_path} is not a valid JSON file.")
        return 2

    exit_code = 0

    print("Configuration File:", config_path)
    print("Database Type:     ", config["database"]["type"])
    print("Object Store Type: ", config["object_store"]["type"])
    print()

    # Attempt to clean the database.
    if config["database"]["type"] == "sqlite":
        dbpath = Path(config["database"]["config"]["filepath"])
        try:
            dbpath.unlink(True)
            print(f"{dbpath} removed!")

        except FileNotFoundError:
            print(f"{dbpath} does not exist, skipping...")

        except (IOError, PermissionError):
            print(f"Unable to remove {dbpath}. Please delete it manually.")

    elif config["database"]["type"] == "mysql":
        try:

            db_url = (
                "mysql+pymysql://{username}:{password}@{host}:{port}/{database}".format(
                    username=config["database"]["config"]["username"],
                    password=config["database"]["config"]["password"],
                    host=config["database"]["config"]["host"],
                    port=config["database"]["config"]["port"],
                    database=config["database"]["config"]["database"],
                )
            )
            engine = create_engine(db_url)
            SQLModel.metadata.drop_all(engine)
            print("All MySQL tables dropped successfully!")

        except Exception as e:
            print(f"Error dropping MySQL tables: {e}")
            exit_code += 1

    elif config["database"]["type"] == "postgres":
        # FIXME: "All PostgreSQL tables dropped successfully!" but no tables are actually dropped.
        try:
            db_url = "postgresql+psycopg://{username}:{password}@{host}:{port}/{database}".format(
                username=config["database"]["config"]["username"],
                password=config["database"]["config"]["password"],
                host=config["database"]["config"]["host"],
                port=config["database"]["config"]["port"],
                database=config["database"]["config"]["database"],
            )
            engine = create_engine(db_url)
            SQLModel.metadata.drop_all(engine)
            print("All PostgreSQL tables dropped successfully!")

        except Exception as e:
            print(f"Error dropping PostgreSQL tables: {e}")
            exit_code += 1

    else:
        print(f"ERROR: Invalid configuration value: {config["database"]["type"]}")
        exit_code += 1

    # Attempt to clean the file object store.
    if config["object_store"]["type"] == "local":
        osrootpath: str = config["object_store"]["config"]["filepath"]
        try:
            filenames = os.listdir(osrootpath)
            osfilesremoved = False
            for filename in filenames:
                if filename not in {".gitignore", ".gitinclude"}:
                    filepath = Path(osrootpath, filename)
                    print(f"Removing {filepath}...")
                    (
                        shutil.rmtree(filepath)
                        if filepath.is_dir()
                        else filepath.unlink(True)
                    )
                    osfilesremoved = True

            if not osfilesremoved:
                print("Object store is empty, skipping...")

        except FileNotFoundError:
            print(f"{osrootpath} does not exist, skipping...")

    elif config["object_store"]["type"] == "minio":
        # FIXME: SSLError(SSLError(1, '[SSL: WRONG_VERSION_NUMBER] wrong version number (_ssl.c:1028)')))
        client = Minio(
            config["object_store"]["config"]["endpoint"],
            config["object_store"]["config"]["access_key"],
            config["object_store"]["config"]["secret_key"],
            config["object_store"]["config"]["secure"],
        )
        bucket_names = {"centralserver-avatars", "centralserver-reports"}
        for bucket in bucket_names:
            try:
                try:
                    objects = client.list_objects(bucket, recursive=True)
                    for obj in objects:
                        client.remove_object(bucket, obj.object_name)

                    client.remove_bucket(bucket)

                except Exception as e:
                    print(f"Error cleaning bucket {bucket}: {e}")
                    exit_code += 1

            except Exception as e:
                print(f"Error removing bucket {bucket}: {e}")
                exit_code += 1

    else:
        print(f"ERROR: Invalid configuration value: {config["object_store"]["type"]}")
        exit_code += 2

    return 20 + exit_code if exit_code != 0 else 0


if __name__ == "__main__":
    sys.exit(main())
