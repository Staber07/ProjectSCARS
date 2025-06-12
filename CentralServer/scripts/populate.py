import argparse
import asyncio
import getpass
import random
import sys
from dataclasses import dataclass
from urllib.parse import urljoin

import httpx
from faker import Faker

f = Faker()


@dataclass
class SchoolData:
    name: str
    address: str | None
    phone: str | None
    email: str | None
    website: str | None


@dataclass
class UserData:
    username: str
    role_id: int
    password: str
    email: str | None = None
    name_first: str | None = None
    name_middle: str | None = None
    name_last: str | None = None
    school_id: int | None = None


def get_token(
    username: str, password: str, required_role: int, endpoint: str
) -> str | None:
    self_info_endpoint = urljoin(endpoint, "v1/users/me")

    auth_response = httpx.post(
        urljoin(endpoint, "v1/auth/token"),
        data={"username": username, "password": password},
    )

    if auth_response.status_code != 200:
        print(f"Error: {auth_response.status_code} - {auth_response.text}")
        return None

    self_info_response = httpx.get(
        self_info_endpoint,
        headers={"Authorization": f"Bearer {auth_response.json()['access_token']}"},
    )
    if self_info_response.status_code != 200:
        print(
            f"Error fetching user info: {self_info_response.status_code} - {self_info_response.text}"
        )
        return None
    user_info = self_info_response.json()[0]
    if user_info.get("roleId") != required_role:
        print("User does not have the required role.")
        return None

    return auth_response.json().get("access_token")


async def add_sample_schools(endpoint: str, token: str) -> bool:
    headers = {"Authorization": f"Bearer {token}"}
    add_school_sample_endpoint = urljoin(endpoint, "v1/schools/create")
    # update_school_sample_endpoint = urljoin(endpoint, "v1/schools/")

    async with httpx.AsyncClient() as client:
        for idx in range(100):
            print(f"Adding sample school {idx + 1}/100...")
            school_data = SchoolData(
                name=f.company(),
                address=f.address() if random.choice([True, False]) else None,
                phone=f.phone_number() if random.choice([True, False]) else None,
                email=f.email() if random.choice([True, False]) else None,
                website=f.url() if random.choice([True, False]) else None,
            )

            r = await client.post(
                add_school_sample_endpoint,
                json={
                    "name": school_data.name,
                    "address": school_data.address,
                    "phone": school_data.phone,
                    "email": school_data.email,
                    "website": school_data.website,
                },
                headers=headers,
            )
            if r.status_code != 201:
                print(f"Error adding school: {r.status_code} - {r.text}")
                return False

    print("Sample schools added successfully.")
    return True


async def add_sample_users(endpoint: str, token: str) -> bool:
    headers = {"Authorization": f"Bearer {token}"}
    add_user_sample_endpoint = urljoin(endpoint, "v1/auth/create")
    update_user_sample_endpoint = urljoin(endpoint, "v1/users/")
    users_to_create: list[UserData] = []
    school_quantity_resp = httpx.get("v1/schools/quantity", headers=headers)
    if school_quantity_resp.status_code != 200:
        print(
            f"Error fetching school quantity: {school_quantity_resp.status_code} - {school_quantity_resp.text}"
        )
        return False

    school_quantity = school_quantity_resp.json().get("quantity", 0)

    for _ in range(100):
        # Generate unique username
        username = f.user_name()
        while any(user.username == username for user in users_to_create):
            username = f.user_name()

        users_to_create.append(
            UserData(
                username=username,
                role_id=random.randint(2, 5),
                password=f.password(),
                email=f.email() if random.choice([True, False]) else None,
                name_first=f.first_name() if random.choice([True, False]) else None,
                name_middle=f.last_name() if random.choice([True, False]) else None,
                name_last=f.last_name() if random.choice([True, False]) else None,
                school_id=random.randint(  # 0 means no school
                    0,
                    school_quantity,
                ),
            )
        )

    async with httpx.AsyncClient() as client:
        for idx, user_data in enumerate(users_to_create):
            print(f"Adding sample user {idx + 1}/{len(users_to_create)}...")
            create_response = await client.post(
                add_user_sample_endpoint,
                json={
                    "username": user_data.username,
                    "roleId": user_data.role_id,
                    "password": user_data.password,
                },
                headers=headers,
            )
            if create_response.status_code != 201:
                print(
                    f"Error adding user: {create_response.status_code} - {create_response.text}"
                )
                return False

            update_response = await client.patch(
                update_user_sample_endpoint,
                json={
                    "id": create_response.json()["id"],
                    "email": user_data.email,
                    "nameFirst": user_data.name_first,
                    "nameMiddle": user_data.name_middle,
                    "nameLast": user_data.name_last,
                    "schoolId": (
                        user_data.school_id if user_data.school_id != 0 else None
                    ),
                },
                headers=headers,
            )
            if update_response.status_code != 200:
                print(
                    f"Error updating user: {update_response.status_code} - {update_response.text}"
                )
                return False

    print("Sample users added successfully.")
    return True


async def main(endpoint: str, skip_schools: bool, skip_users: bool) -> int:
    print("Enter your credentials to obtain an access token.")
    print("Required Role: Superintendent")
    print()
    username = input("Username: ")
    password = getpass.getpass("Password: ")
    school_creation_token = get_token(username, password, 2, endpoint)
    if not school_creation_token:
        print("Failed to obtain access token for school creation.")
        return 2

    if not skip_schools:
        print("Populating the database with initial data for schools...")
        if not await add_sample_schools(endpoint, school_creation_token):
            print("Failed to add sample schools.")
            return 3

    if not skip_users:
        print("Populating the database with initial data for users...")
        if not await add_sample_users(endpoint, school_creation_token):
            print("Failed to add sample users.")
            return 4

    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Populate the database with initial data."
    )
    parser.add_argument(
        "-e",
        "--endpoint",
        type=str,
        help="The endpoint to populate the database with initial data.",
        default="http://localhost:8081/api/",
    )
    parser.add_argument(
        "-s",
        "--skip-schools",
        action="store_true",
        help="Skip adding sample schools.",
    )
    parser.add_argument(
        "-u",
        "--skip-users",
        action="store_true",
        help="Skip adding sample users.",
    )
    args = parser.parse_args()

    sys.exit(asyncio.run(main(args.endpoint, args.skip_schools, args.skip_users)))
