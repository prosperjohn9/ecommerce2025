from pathlib import Path
import re
from datetime import datetime

IMAGES_DIR = Path("SourceCode/frontend/public/images")
OUT_FILE = Path("SourceCode/backend/src/main/resources/data.sql")

shoe_keywords = {
    "shoe", "shoes", "heel", "heels",
    "loafers", "stiletto", "stilettos",
    "slip", "sliper", "slippers",
    "sandals", "sandal"
}

# Expanded list for your dataset
colors = [
    "black", "white", "red", "green", "blue", "brown", "pink",
    "gray", "grey", "oxblood", "nude", "gold", "silver",
    "beige", "cream", "tan"
]

def is_shoe(folder: str) -> bool:
    return any(k in folder.lower() for k in shoe_keywords)

def title(s: str) -> str:
    return " ".join(w.capitalize() for w in s.replace("_", " ").split())

def sql_escape(s: str) -> str:
    # escape single quotes for SQL
    return s.replace("'", "''")

def detect_color(text: str):
    low = text.lower()
    for c in colors:
        if c in low:
            return c.capitalize()
    return None

def product_name(folder: str, filename: str) -> str:
    base = re.sub(r"\.(jpg|jpeg|png|webp)$", "", filename, flags=re.I)
    base_clean = base.replace("_", " ").strip()

    folder_title = title(folder)
    color = detect_color(base_clean)

    # If we find a color, use: Brand (Color)
    if color:
        return f"{folder_title} ({color})"

    # Otherwise: Brand + readable base
    return f"{folder_title} {title(base_clean)}"

def build_description(category: str, folder: str) -> str:
    return f"Premium {category.lower()} from the {title(folder)} collection."

def main():
    if not IMAGES_DIR.exists():
        raise SystemExit(f"❌ Images folder not found: {IMAGES_DIR}")

    rows = []
    rows.append(f"-- Auto-generated from images on {datetime.now().isoformat(timespec='seconds')}")
    rows.append("TRUNCATE TABLE product RESTART IDENTITY CASCADE;")
    rows.append("")

    count = 0

    for folder in sorted(IMAGES_DIR.iterdir()):
        if not folder.is_dir():
            continue

        category = "SHOE" if is_shoe(folder.name) else "BAG"
        price = 69.99 if category == "SHOE" else 89.99

        for img in sorted(folder.iterdir()):
            if img.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
                continue

            name = product_name(folder.name, img.name)
            image_url = f"/images/{folder.name}/{img.name}"
            desc = build_description(category, folder.name)

            rows.append(
                "INSERT INTO product (name, price, category, description, image_url) VALUES "
                f"('{sql_escape(name)}', {price}, '{category}', '{sql_escape(desc)}', '{sql_escape(image_url)}');"
            )
            count += 1

    OUT_FILE.write_text("\n".join(rows) + "\n", encoding="utf-8")
    print(f"✅ Generated {count} products into: {OUT_FILE}")

if __name__ == "__main__":
    main()