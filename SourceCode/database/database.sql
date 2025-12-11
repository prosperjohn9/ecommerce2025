-- Database: ChicBags & UrbanShoes
-- MySQL-compatible schema + sample data

DROP TABLE IF EXISTS products;

CREATE TABLE products (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50),
    brand VARCHAR(100),
    color VARCHAR(50),
    size VARCHAR(50),
    stock INT,
    image_url VARCHAR(255),
    PRIMARY KEY (id)
);

-- Sample products (bags)
INSERT INTO products (name, description, price, category, brand, color, size, stock, image_url) VALUES
('Classic Leather Tote',
 'Timeless leather tote bag suitable for everyday use.',
 79.99, 'BAG', 'ChicLine', 'Brown', 'One Size', 15,
 'https://example.com/images/bag1.jpg');

INSERT INTO products (name, description, price, category, brand, color, size, stock, image_url) VALUES
('Black Crossbody Bag',
 'Compact crossbody bag with adjustable strap.',
 49.90, 'BAG', 'UrbanStyle', 'Black', 'One Size', 20,
 'https://example.com/images/bag2.jpg');

INSERT INTO products (name, description, price, category, brand, color, size, stock, image_url) VALUES
('Mini Shoulder Bag',
 'Trendy mini shoulder bag for nights out.',
 39.50, 'BAG', 'NightOut', 'Beige', 'One Size', 10,
 'https://example.com/images/bag3.jpg');

-- Sample products (shoes)
INSERT INTO products (name, description, price, category, brand, color, size, stock, image_url) VALUES
('White Sneakers',
 'Comfortable everyday sneakers with cushioned sole.',
 59.99, 'SHOE', 'StreetWalk', 'White', '39', 25,
 'https://example.com/images/shoe1.jpg');

INSERT INTO products (name, description, price, category, brand, color, size, stock, image_url) VALUES
('Black Ankle Boots',
 'Stylish ankle boots with low heel.',
 89.00, 'SHOE', 'CityStep', 'Black', '38', 12,
 'https://example.com/images/shoe2.jpg');

INSERT INTO products (name, description, price, category, brand, color, size, stock, image_url) VALUES
('Running Shoes',
 'Lightweight running shoes with breathable material.',
 69.99, 'SHOE', 'SpeedRun', 'Blue', '40', 18,
 'https://example.com/images/shoe3.jpg');