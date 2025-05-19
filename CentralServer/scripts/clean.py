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

    if not config_path.exists():
        print("Path does not exist.")
        return 1

    try:
        with open(config_path, "r") as f:
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
        # TODO: WIP
        raise NotImplementedError("This option is not yet implemented.")

    else:
        print(f"ERROR: Invalid configuration value: {config["database"]["type"]}")
        exit_code += 1

    # Attempt to clean the file object store.
    if config["object_store"]["type"] == "local":
        osrootpath: str = config["object_store"]["config"]["filepath"]
        filenames = os.listdir(osrootpath)
        osfilesremoved = False
        for filename in filenames:
            if filename not in {".gitignore", ".gitinclude"}:
                filepath = Path(osrootpath, filename)
                print(f"Removing {filepath}...")
                shutil.rmtree(filepath) if filepath.is_dir() else filepath.unlink(True)
                osfilesremoved = True

        if not osfilesremoved:
            print("Object store is empty, skipping...")

    elif config["object_store"]["type"] == "minio":
        # TODO: WIP
        raise NotImplementedError("This option is not yet implemented.")

    else:
        print(f"ERROR: Invalid configuration value: {config["object_store"]["type"]}")
        exit_code += 2

    return 20 + exit_code if exit_code != 0 else 0


if __name__ == "__main__":
    sys.exit(main())
