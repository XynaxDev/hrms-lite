from app.db.database import engine
from sqlalchemy import text


def migrate():
    with engine.connect() as conn:
        print("Migrating employees table...")
        conn.execute(text("ALTER TABLE employees ALTER COLUMN avatar TYPE TEXT"))
        print("Migrating attendance table...")
        conn.execute(text("ALTER TABLE attendance ALTER COLUMN avatar TYPE TEXT"))
        conn.commit()
        print("Migration complete!")


if __name__ == "__main__":
    migrate()
