"""
NEXUS API — Seed script.
Creates the 5 roles and a default admin user for development.

Run with: python -m app.seed
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from app.db.session import async_session_factory, engine
from app.models.user import User, Role, RoleName
from app.models.project import Project, ProjectMember, ProjectStatus
from app.core.security import hash_password


SEED_USERS = [
    {
        "email": "admin@nexus.dev",
        "full_name": "System Admin",
        "password": "admin123",
        "roles": [RoleName.ADMIN],
    },
    {
        "email": "pm@nexus.dev",
        "full_name": "Rajesh Kumar (PM)",
        "password": "pm123",
        "roles": [RoleName.PROJECT_MANAGER],
    },
    {
        "email": "planner@nexus.dev",
        "full_name": "Priya Sharma (Planner)",
        "password": "planner123",
        "roles": [RoleName.PLANNER],
    },
    {
        "email": "supervisor@nexus.dev",
        "full_name": "Amit Singh (Supervisor)",
        "password": "supervisor123",
        "roles": [RoleName.SUPERVISOR],
    },
    {
        "email": "auditor@nexus.dev",
        "full_name": "Neha Verma (Auditor)",
        "password": "auditor123",
        "roles": [RoleName.AUDITOR],
    },
]


async def seed():
    print("Seeding NEXUS database...")

    async with async_session_factory() as session:
        # ── 1. Seed Roles ──────────────────────────────
        for role_name in RoleName:
            result = await session.execute(select(Role).where(Role.name == role_name))
            if not result.scalar_one_or_none():
                session.add(Role(name=role_name, description=f"{role_name.value} role"))
                print(f"  ✓ Role: {role_name.value}")
        await session.flush()

        # ── 2. Seed Users ──────────────────────────────
        for user_data in SEED_USERS:
            result = await session.execute(select(User).where(User.email == user_data["email"]))
            if result.scalar_one_or_none():
                print(f"  → User already exists: {user_data['email']}")
                continue

            # Fetch role objects
            roles = []
            for rn in user_data["roles"]:
                r = await session.execute(select(Role).where(Role.name == rn))
                roles.append(r.scalar_one())

            user = User(
                email=user_data["email"],
                full_name=user_data["full_name"],
                hashed_password=hash_password(user_data["password"]),
                roles=roles,
            )
            session.add(user)
            print(f"  ✓ User: {user_data['email']} ({', '.join(r.value for r in user_data['roles'])})")
        await session.flush()

        # ── 3. Seed Demo Project ───────────────────────
        result = await session.execute(select(Project).where(Project.code == "NMP-A"))
        if not result.scalar_one_or_none():
            project = Project(
                name="NEXUS Metro Package A",
                code="NMP-A",
                description="Metro rail construction package A — stations, viaducts, and systems integration",
                location="Mumbai Metropolitan Region",
                status=ProjectStatus.ACTIVE,
            )
            session.add(project)
            await session.flush()
            await session.refresh(project)
            print(f"  ✓ Project: {project.name} ({project.code})")

            # Add all users as project members
            all_users = (await session.execute(select(User))).scalars().all()
            for user in all_users:
                role = user.roles[0].name.value if user.roles else "SUPERVISOR"
                member = ProjectMember(
                    project_id=project.id,
                    user_id=user.id,
                    role=role,
                )
                session.add(member)
            print(f"  ✓ Added {len(all_users)} members to project")
        else:
            print("  → Demo project already exists")

        await session.commit()

    print("\n[OK] Seed complete!")
    print("\nLogin credentials:")
    print("─" * 45)
    for u in SEED_USERS:
        roles_str = ", ".join(r.value for r in u["roles"])
        print(f"  {u['email']:30s} / {u['password']:15s} ({roles_str})")
    print("─" * 45)


if __name__ == "__main__":
    asyncio.run(seed())
