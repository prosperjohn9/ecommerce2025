from pathlib import Path
import re

IMAGES_DIR = Path("SourceCode/frontend/public/images")
OUT_FILE = Path("SourceCode/backend/src/main/resources/data.sql")

shoe_keywords = {
    "shoe", "shoes", "heel", "heels",
    "loafers", "stiletto", "stilettos",
    "slip", "sliper", "sandals", "sandal"
}

def is_shoe(folder: str) -> bool:
    return any(k in folder.lower() for k in shoe_keywords)

def title(s: str) -> str:
    return " ".join(w.capitalize() for w in s.replace("_", " ").split())

def product_name(folder: str, filename: str) -> str:
    base = re.sub(r"\.(jpg|jpeg|png|webp)$", "", filename, flags=re.I)
    base = base.replace("_", " ")

    # Try to detect color
    colors = ["black", "white", "red", "green", "blue", "brown", "pink", "gray", "oxblood"]
    color = None
    for c in colors:
        if c in base.lower():
            color = c.capitalize()
            break

    if color:
        return f"{title(folder)} ({color})"
    return f"{title(folder)} {title(base)}"

rows = []
pid = 1

for folder in sorted(IMAGES_DIR.iterdir()):
    if not folder.is_dir():
        continue

    category = "SHOE" if is_shoe(folder.name) else "BAG"

    for img in sorted(folder.iterdir()):
        if img.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
            continue

        name = product_name(folder.name, img.name)
        image_url = f"/images/{folder.name}/{img.name}"
        price = 69.99 if category == "SHOE" else 89.99

        desc = f"Premium {category.lower()} from the {title(folder.name)} collection."

        rows.append(
            f"INSERT INTO product (id, name, price, category, description, image_url) "
            f"VALUES ({pid}, '{name}', {price}, '{category}', '{desc}', '{image_url}');"
        )
        pid += 1

OUT_FILE.write_text("\n".join(rows) + "\n", encoding="utf-8")
print(f"✅ Generated {pid - 1} products")