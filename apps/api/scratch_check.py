import asyncio
from app.db.session import async_session_factory
from sqlalchemy import select
from app.models.project import Project

async def check():
    async with async_session_factory() as session:
        res = await session.execute(select(Project))
        print('Projects:', res.scalars().all())

asyncio.run(check())
