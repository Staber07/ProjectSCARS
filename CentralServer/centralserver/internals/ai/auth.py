from dataclasses import dataclass
from typing import Optional, List, cast

from sqlmodel import Session
from fastapi import Depends

from centralserver.internals.ai.utils import ROLE_MAP
from centralserver.internals.ai.routers import (
    get_user_profile_endpoint,
    get_all_schools_endpoint,
    get_assigned_schools_endpoint,
    logged_in_dep,
)

@dataclass
class UserInfo:
    id: str
    username: str
    name: str
    role: str
    school_id: int
    school_name: str


async def fetch_user_info(
    token: logged_in_dep = Depends(),
    session: Session = Depends(),
) -> Optional[UserInfo]:
    try:
        print("📡 Fetching user profile internally...")
        user_data, _ = await get_user_profile_endpoint(token, session)

        school_id = user_data.schoolId or -1
        role = ROLE_MAP.get(user_data.roleId, "Unknown Role")

        full_name = " ".join(
            part for part in [user_data.nameFirst, user_data.nameMiddle, user_data.nameLast] if part
        ).strip()

        school_name = f"School ID {school_id}"

        if role == "Superintendent" and school_id == -1:
            print("🔍 Fetching all schools for Superintendent...")
            all_schools = await get_all_schools_endpoint(token, session)
            school_names: List[str] = [s.name or "Unnamed School" for s in all_schools]
            school_name = ", ".join(school_names)
        else:
            print("🔍 Fetching assigned school info...")
            school_data = await get_assigned_schools_endpoint(token, session)

            if isinstance(school_data, list) and school_data:
                school_name = cast(str, school_data[0].name or f"School ID {school_id}")
            elif school_data:
                school_name = school_data.name or f"School ID {school_id}"
            else:
                print("⚠️ No school assigned.")

        greeting = (
            f"👋 Hello {full_name}, the {role} of DEPED Baliuag. How may I help you?"
            if role == "Superintendent" and school_id == -1
            else f"👋 Hello {full_name}, the {role} of {school_name}. How may I help you?"
        )

        print(greeting)

        return UserInfo(
            id=str(user_data.id),
            username=user_data.username,
            name=full_name,
            role=role,
            school_id=school_id,
            school_name=school_name,
        )

    except Exception as e:
        print(f"[❌ Exception] While fetching user info internally: {str(e)}")
        return None
