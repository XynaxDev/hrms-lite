import os
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env file")

print("🔍 Testing connection to:")
print(DATABASE_URL.replace(DATABASE_URL.split("@")[0], "postgresql://****"))

try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("✅ Connection successful!")
        print("Database response:", result.scalar())

except SQLAlchemyError as e:
    print("❌ Connection failed!")
    print("Error:", str(e))
