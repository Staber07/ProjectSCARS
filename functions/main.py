# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

import os
import datetime
import pathlib
from dataclasses import asdict

from firebase_functions import https_fn
from firebase_admin import initialize_app, credentials, auth, firestore

import utils
from models import User


# Initialize Firebase Admin SDK
cred = credentials.Certificate(
    os.getenv(
        "FIREBASE_ADMIN_SDK_KEY",
        pathlib.Path(__file__).parent / "serviceAccountKey.json",
    )
)
initialize_app(cred)


@https_fn.on_request()
def healthcheck(_: https_fn.Request) -> https_fn.Response:
    """Used to check if the server is available.

    Returns:
        https_fn.Response: Always returns "OK".
    """
    return https_fn.Response("OK")


@https_fn.on_request()
def first_run(_: https_fn.Request) -> https_fn.Response:
    """Check if the first run wizard is needed to be run.

    Returns:
        https_fn.Response: True if first run wizard is needed, False otherwise.
    """

    # Check number of accounts in Firebase Authentication
    users: auth.ListUsersPage = auth.list_users(max_results=1)
    return (
        https_fn.Response("true")
        if len(users.users) == 0
        else https_fn.Response("false")
    )


@https_fn.on_request()
def user_register(req: https_fn.Request) -> https_fn.Response:
    """Register a new user.

    Args:
        display_name (str): The user's display name.
        email (str): The user's email.

    Returns:
        User (dict): The newly created user.
    """

    try:
        print("Registering user...")
        req_json = req.get_json()

        user = User(
            display_name=req_json.get("display_name"),
            email=req_json.get("email"),
        )

        # Create user in Firebase Authentication
        created_user: auth.UserRecord = auth.create_user(
            display_name=user.display_name,
            email=user.email,
            password=req_json.get("password"),
        )
        print(f"User {created_user.uid} created in Firebase Authentication")

        # Create user information in Firestore
        try:
            db = firestore.client()
            db.collection("users").document(created_user.uid).set(
                {"last_login": datetime.datetime.now().isoformat()}
            )
            print(f"User {created_user.uid} created in Firestore")

        except Exception as e:
            print(f"Error creating user in Firestore: {str(e)}")
            # Revert Firebase Authentication user creation
            auth.delete_user(created_user.uid)
            print(f"User {created_user.uid} deleted from Firebase Authentication")
            raise e  # Re-raise the exception

    except Exception as e:
        print(f"Unknown error occured: {str(e)}")
        return https_fn.Response(f"Unknown error occured: {str(e)}", status=400)

    print(f"User {created_user.uid} registered successfully")
    return https_fn.Response(
        str(asdict(utils.convert_user_firebase_to_dataclass(created_user))), status=201
    )


@https_fn.on_request()
def user_get(req: https_fn.Request) -> https_fn.Response:
    """Get a user by email.

    Args:
        req (https_fn.Request): The Request object.

    Returns:
        https_fn.Response: The Response object.
    """

    try:
        req_json = req.get_json()

        user = auth.get_user(req_json.get("uid"))

    except Exception as e:
        return https_fn.Response(f"Unknown error occured: {str(e)}", status=400)

    return https_fn.Response(user.to_dict())
