from pathlib import Path
import re
from datetime import datetime

IMAGES_DIR = Path("SourceCode/frontend/public/images")
OUT_FILE = Path("SourceCode/backend/src/main/resources/data.sql")

DEFAULT_STOCK = 15
DEFAULT_SIZE = None  

SHOE_KEYWORDS = {
    "shoe", "shoes", "heel", "heels",
    "loafers", "stiletto", "stilettos",
    "slip", "sliper", "slippers",
    "sandals", "sandal"
}

COLORS = [
    "black", "white", "red", "green", "blue", "brown", "pink",
    "gray", "grey", "oxblood", "nude", "gold", "silver",
    "beige", "cream", "tan"
]

def is_shoe(folder: str) -> bool:
    f = folder.lower()
    return any(k in f for k in SHOE_KEYWORDS)

def titleize(s: str) -> str:
    return " ".join(w.capitalize() for w in s.replace("_", " ").split() if w)

def sql_escape(s: str) -> str:
    return s.replace("'", "''")

def detect_color(text: str):
    low = text.lower()
    for c in COLORS:
        if c in low:
            return c.capitalize()
    return None

def product_name(folder: str, filename: str) -> str:
    base = re.sub(r"\.(jpg|jpeg|png|webp)$", "", filename, flags=re.I)
    base_clean = base.replace("_", " ").strip()

    folder_title = titleize(folder)
    color = detect_color(base_clean)

    # Prefer: Brand (Color)
    if color:
        return f"{folder_title} ({color})"

    # Otherwise: Brand + readable filename
    return f"{folder_title} {titleize(base_clean)}"

def build_description(category: str, folder: str) -> str:
    return f"Premium {category.lower()} from the {titleize(folder)} collection."

def sql_nullable_str(value):
    if value is None or str(value).strip() == "":
        return "NULL"
    return f"'{sql_escape(str(value))}'"

def main():
    if not IMAGES_DIR.exists():
        raise SystemExit(f"Images folder not found: {IMAGES_DIR}")

    rows = []
    rows.append(f"-- Auto-generated from images on {datetime.now().isoformat(timespec='seconds')}")
    rows.append("TRUNCATE TABLE product RESTART IDENTITY CASCADE;")
    rows.append("")

    count = 0

    for folder in sorted(IMAGES_DIR.iterdir()):
        if not folder.is_dir():
            continue

        brand = titleize(folder.name)
        category = "SHOE" if is_shoe(folder.name) else "BAG"
        price = 69.99 if category == "SHOE" else 89.99

        for img in sorted(folder.iterdir()):
            if img.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
                continue

            name = product_name(folder.name, img.name)
            image_url = f"/images/{folder.name}/{img.name}"
            description = build_description(category, folder.name)
            color = detect_color(img.stem)  # stem = filename without extension

            stmt = (
                "INSERT INTO product (name, price, category, description, image_url, brand, color, stock, size) VALUES "
                f"('{sql_escape(name)}', {price}, '{category}', '{sql_escape(description)}', "
                f"'{sql_escape(image_url)}', '{sql_escape(brand)}', {sql_nullable_str(color)}, "
                f"{DEFAULT_STOCK}, {sql_nullable_str(DEFAULT_SIZE)});"
            )

            rows.append(stmt)
            count += 1

    OUT_FILE.write_text("\n".join(rows) + "\n", encoding="utf-8")
    print(f"Generated {count} products into: {OUT_FILE}")

if __name__ == "__main__":
    main()