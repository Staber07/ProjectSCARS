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
from sqlmodel import create_engine, text


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
    parser.add_argument(
        "--database-only",
        action="store_true",
        help="Clean only the database, skip object store cleanup",
    )
    parser.add_argument(
        "--object-store-only",
        action="store_true",
        help="Clean only the object store, skip database cleanup",
    )

    args = parser.parse_args()

    # Check for conflicting options
    if args.database_only and args.object_store_only:
        print("Error: --database-only and --object-store-only cannot be used together.")
        return 1

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

    if args.database_only:
        print("Mode:              Database only")
    elif args.object_store_only:
        print("Mode:              Object store only")
    else:
        print("Mode:              Both database and object store")
    print()

    # Attempt to clean the database.
    if not args.object_store_only:
        if config["database"]["type"] == "sqlite":
            dbpath = Path(config["database"]["config"]["filepath"])
            try:
                dbpath.unlink(True)
                print(f"{dbpath} removed!")

            except FileNotFoundError:
                print(f"{dbpath} does not exist, skipping...")

            except (IOError, PermissionError):
                # If file deletion is not possible, remove the tables instead
                try:
                    print(f"Unable to remove {dbpath}, attempting to drop tables...")
                    engine = create_engine(f"sqlite:///{dbpath}")
                    with engine.connect() as connection:
                        result = connection.execute(
                            text("SELECT name FROM sqlite_master WHERE type='table';")
                        )
                        tables = [row[0] for row in result]
                        for table in tables:
                            connection.execute(text(f"DROP TABLE IF EXISTS {table};"))

                except Exception as e:  # pylint: disable=W0718
                    print(f"Error dropping SQLite tables: {e}")
                    exit_code += 1

                else:
                    print(
                        f"All SQLite tables dropped successfully, but {dbpath} could not be removed. Please delete it manually."
                    )

        elif config["database"]["type"] == "mysql":
            try:

                db_url = (
                    f"mysql+pymysql://{config['database']['config']['username']}:"
                    f"{config['database']['config']['password']}@"
                    f"{config['database']['config']['host']}:"
                    f"{config['database']['config']['port']}/"
                    f"{config['database']['config']['database']}"
                )
                # Connect to the specified MySQL database and drop all tables
                engine = create_engine(db_url)
                with engine.connect() as connection:
                    # Disable foreign key checks to avoid dependency issues
                    connection.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
                    result = connection.execute(text("SHOW TABLES;"))
                    tables = [row[0] for row in result]
                    for table in tables:
                        connection.execute(text(f"DROP TABLE IF EXISTS `{table}`;"))

                    # Re-enable foreign key checks
                    connection.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))

                print("All MySQL tables dropped successfully!")

            except Exception as e:
                print(f"Error dropping MySQL tables: {e}")
                exit_code += 1

        elif config["database"]["type"] == "postgres":
            # FIXME: "All PostgreSQL tables dropped successfully!" but no tables are actually dropped.
            try:
                db_url = (
                    f"postgresql+psycopg://{config['database']['config']['username']}:"
                    f"{config['database']['config']['password']}@"
                    f"{config['database']['config']['host']}:"
                    f"{config['database']['config']['port']}/"
                    f"{config['database']['config']['database']}"
                )
                engine = create_engine(db_url)
                with engine.connect() as connection:
                    # Disable triggers to avoid dependency issues
                    result = connection.execute(
                        text(
                            "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
                        )
                    )
                    tables = [row[0] for row in result]
                    for table in tables:
                        connection.execute(
                            text(f"ALTER TABLE {table} DISABLE TRIGGER ALL;")
                        )
                        connection.execute(
                            text(f"DROP TABLE IF EXISTS {table} CASCADE;")
                        )

                print("All PostgreSQL tables dropped successfully!")

            except Exception as e:
                print(f"Error dropping PostgreSQL tables: {e}")
                exit_code += 1

        else:
            print(f"ERROR: Invalid configuration value: {config['database']['type']}")
            exit_code += 1

    # Attempt to clean the file object store.
    if not args.database_only:
        if config["object_store"]["type"] == "local":
            osrootpath: str = config["object_store"]["config"]["filepath"]
            try:
                filenames = os.listdir(osrootpath)
                osfilesremoved = False
                for filename in filenames:
                    if filename not in {".gitignore", ".gitinclude"}:
                        filepath = Path(osrootpath, filename)
                        print(f"Removing {filepath}...")
                        if filepath.is_dir():
                            shutil.rmtree(filepath)

                        else:
                            filepath.unlink(True)

                        osfilesremoved = True

                if not osfilesremoved:
                    print("Object store is empty, skipping...")

            except FileNotFoundError:
                print(f"{osrootpath} does not exist, skipping...")

        elif config["object_store"]["type"] in {"minio", "garage"}:
            client = Minio(
                config["object_store"]["config"]["endpoint"],
                access_key=config["object_store"]["config"]["access_key"],
                secret_key=config["object_store"]["config"]["secret_key"],
                secure=config["object_store"]["config"]["secure"],
                region="garage" if config["object_store"]["type"] == "garage" else None,
            )
            buckets = {
                "centralserver-avatars",
                "centralserver-reports",
                "centralserver-school-logos",
                "centralserver-attachments",
                "centralserver-esignatures",
            }
            for bucket in buckets:
                try:
                    if client.bucket_exists(bucket):
                        files = client.list_objects(bucket, recursive=True)
                        for file in files:
                            print(
                                f"Removing file {file.object_name} from bucket {bucket}..."
                            )
                            if file.object_name:
                                client.remove_object(bucket, file.object_name)

                        print(f"Removing bucket {bucket}...")
                        client.remove_bucket(bucket)

                    else:
                        print(f"Bucket {bucket} does not exist, skipping...")

                except Exception as e:
                    print(f"Error removing bucket {bucket}: {e}")
                    exit_code += 1

        else:
            print(
                f"ERROR: Invalid configuration value: {config['object_store']['type']}"
            )
            exit_code += 2

    return 20 + exit_code if exit_code != 0 else 0


if __name__ == "__main__":
    sys.exit(main())
