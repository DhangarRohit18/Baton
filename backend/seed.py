import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.services.seed_service import run_seed

if __name__ == "__main__":
    print("Seeding BATON Database...")
    result = run_seed()
    print("Seed Completed Successfully:")
    print(result)
