export const MOCK_PRODUCTS = [
  {
    _id: '1', name: 'iPhone 15 Pro Max', category: 'Electronics', price: 159900, originalPrice: 169900, stock: 50, discount: 6,
    images: ['/products/Electronics/photo-1523275335684-37898b6baf30.jpg', '/products/Electronics/Watch/watch1.png', '/products/Electronics/Watch/watch2.png'],
    description: 'Titanium design, A17 Pro chip, 48MP camera system with 5x optical zoom.', specs: { Display: '6.7" Super Retina XDR', Chip: 'A17 Pro', Storage: '256GB', Battery: '4422 mAh' }
  },
  {
    _id: '2', name: 'Samsung Galaxy S24 Ultra', category: 'Electronics', price: 129999, originalPrice: 139999, stock: 35, discount: 7,
    images: ['/products/Electronics/camera.jpg', '/products/Electronics/camera/camera1.png', '/products/Electronics/camera/camera2.png'],
    description: 'Galaxy AI, built-in S Pen, 200MP camera, Snapdragon 8 Gen 3.', specs: { Display: '6.8" Dynamic AMOLED', Chip: 'Snapdragon 8 Gen 3', Storage: '256GB', Battery: '5000 mAh' }
  },
  {
    _id: '3', name: 'Sony WH-1000XM5', category: 'Electronics', price: 24990, originalPrice: 29990, stock: 120, discount: 17,
    images: ['/products/Electronics/headphone.jpg', '/products/Electronics/headphones/headphone1.png', '/products/Electronics/headphones/headphone2.png', '/products/Electronics/headphones/headphone3.png'],
    description: 'Industry-leading noise cancellation, 30hr battery, multipoint connection.', specs: { 'Driver Size': '30mm', 'Battery Life': '30 hours', Connectivity: 'Bluetooth 5.2', Weight: '250g' }
  },
  {
    _id: '4', name: 'MacBook Air M3 15"', category: 'Electronics', price: 134900, originalPrice: 134900, stock: 25, discount: 0,
    images: ['/products/Electronics/laptop.jpg', '/products/Electronics/laptop/laptop1.png'],
    description: 'Supercharged by M3 chip, 18-hour battery, Liquid Retina display.', specs: { Chip: 'Apple M3', RAM: '16GB', Storage: '512GB SSD', Display: '15.3" Liquid Retina' }
  },
  {
    _id: '5', name: 'iPad Pro M4 11"', category: 'Electronics', price: 99900, originalPrice: 109900, stock: 40, discount: 9,
    images: ['/products/Electronics/tablet.jpg', '/products/Electronics/camera.jpg', '/products/Electronics/camera/camera1.png'],
    description: 'Thinnest Apple product ever, Ultra Retina XDR display, M4 chip.', specs: { Chip: 'Apple M4', Display: '11" Ultra Retina XDR', Storage: '256GB', Connectivity: 'Wi-Fi 6E' }
  },
  {
    _id: '6', name: 'Nike Air Max 270', category: 'Sports', price: 10795, originalPrice: 12995, stock: 200, discount: 17,
    images: ['/products/Clothing/photo-1679847628912-4c3e7402abc7.jpg', '/products/Clothing/photo-1713929689473-572aeaa5ae12.jpg', '/products/Clothing/photo-1714143136362-c6c075aaef46.jpg'],
    description: 'Max Air unit in the heel for all-day comfort. Breathable mesh upper.', specs: { Material: 'Mesh + Synthetic', Sole: 'Rubber', Closure: 'Lace-up', 'Available Sizes': '6-12 UK' }
  },
  {
    _id: '7', name: 'Adidas Ultraboost 23', category: 'Sports', price: 14999, originalPrice: 17999, stock: 150, discount: 17,
    images: ['/products/Clothing/photo-1740711152088-88a009e877bb.jpg', '/products/Clothing/photo-1766238955752-0200601334ed.jpg', '/products/Clothing/photo-1775226236498-969b38fe7032.jpg'],
    description: 'Responsive Boost midsole, Primeknit+ upper, Continental rubber outsole.', specs: { Material: 'Primeknit+', Midsole: 'Boost', Outsole: 'Continental Rubber', Drop: '10mm' }
  },
  {
    _id: '8', name: "Levi's 511 Slim Jeans", category: 'Clothing', price: 2999, originalPrice: 3999, stock: 300, discount: 25,
    images: ['/products/Clothing/8/jeans1.jpg', '/products/Clothing/8/jeans2.jpg', '/products/Clothing/photo-1621951753163-ee63e7fc147e.jpg'],
    description: 'Classic slim fit from hip to ankle. Sits below waist.', specs: { Fit: 'Slim', Rise: 'Below Waist', Material: '99% Cotton 1% Elastane', Care: 'Machine Wash' }
  },
  {
    _id: '9', name: 'Allen Solly Formal Shirt', category: 'Clothing', price: 1299, originalPrice: 1799, stock: 500, discount: 28,
    images: ['/products/Clothing/7/shirt1.jpg', '/products/Clothing/10/clothing1.png', '/products/Clothing/10/clothing2.png', '/products/Clothing/10/clothing3.png', '/products/Clothing/10/clothing4.png'],
    description: 'Regular fit formal shirt, wrinkle-free fabric, perfect for office.', specs: { Fit: 'Regular', Material: '60% Cotton 40% Polyester', Collar: 'Spread', Sleeve: 'Full' }
  },
  {
    _id: '10', name: 'Atomic Habits', category: 'Books', price: 349, originalPrice: 499, stock: 1000, discount: 30,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80'],
    description: "James Clear's #1 NYT bestseller. Tiny changes, remarkable results.", specs: { Author: 'James Clear', Pages: '320', Publisher: 'Penguin', Language: 'English' }
  },
  {
    _id: '11', name: 'Rich Dad Poor Dad', category: 'Books', price: 249, originalPrice: 350, stock: 800, discount: 29,
    images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80'],
    description: "Robert Kiyosaki's personal finance classic. What the rich teach their kids.", specs: { Author: 'Robert Kiyosaki', Pages: '336', Publisher: 'Plata Publishing', Language: 'English' }
  },
  {
    _id: '12', name: 'Dyson V15 Detect', category: 'Home', price: 49900, originalPrice: 52900, stock: 45, discount: 6,
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&q=80'],
    description: 'Laser detects invisible dust. HEPA filtration. 60 min runtime.', specs: { Suction: '230 AW', Runtime: '60 min', Filtration: 'HEPA', Weight: '3.1 kg' }
  },
  {
    _id: '13', name: 'Instant Pot Duo 7-in-1', category: 'Home', price: 7499, originalPrice: 8999, stock: 80, discount: 17,
    images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80'],
    description: 'Pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, warmer.', specs: { Capacity: '5.7L', Programs: '14 Smart', Voltage: '220V', Material: 'Stainless Steel' }
  },
  {
    _id: '14', name: 'Lakme 9to5 Primer', category: 'Beauty', price: 399, originalPrice: 499, stock: 2000, discount: 20,
    images: ['/products/Electronics/brush.jpg', '/products/Electronics/brush/brush2.jpg', '/products/Electronics/electronic-brush.jpg'],
    description: 'Matte finish primer, controls oil, 16hr wear, SPF 20.', specs: { 'Skin Type': 'All', Finish: 'Matte', SPF: '20', Volume: '30ml' }
  },
  {
    _id: '15', name: 'boAt Airdopes 141', category: 'Electronics', price: 999, originalPrice: 1999, stock: 500, discount: 50,
    images: ['/products/Electronics/neckband.avif', '/products/Electronics/neckband/neckband1.png'],
    description: 'True wireless earbuds, 42H total playtime, BEAST mode, IPX4.', specs: { 'Driver Size': '8mm', Playtime: '42 hours', Connectivity: 'Bluetooth 5.3', 'Water Resistance': 'IPX4' }
  },
  {
    _id: '16', name: 'Yoga Mat Premium 6mm', category: 'Sports', price: 1499, originalPrice: 1999, stock: 200, discount: 25,
    images: ['/products/Clothing/photo-1636831990680-0d088e4cd83c.jpg', '/products/Electronics/ssd.jpg', '/products/Electronics/ssd/ssd1.png'],
    description: 'Anti-slip TPE material, eco-friendly, includes carry strap.', specs: { Material: 'TPE', Thickness: '6mm', Size: '183 x 61 cm', Weight: '1.1 kg' }
  },
  {
    _id: '17', name: 'Wireless Mouse', category: 'Electronics', price: 1299, originalPrice: 1799, stock: 300, discount: 28,
    images: ['/products/Electronics/mouse.jpg', '/products/Electronics/mouse/mouse1.png', '/products/Electronics/mouse/mouse2.png'],
    description: 'Ergonomic wireless mouse, 2.4GHz, long battery life.', specs: { Connectivity: 'Wireless 2.4GHz', Battery: 'AA', DPI: '1600', Weight: '90g' }
  },
  {
    _id: '18', name: 'Portable SSD 1TB', category: 'Electronics', price: 7999, originalPrice: 9999, stock: 150, discount: 20,
    images: ['/products/Electronics/ssd.jpg', '/products/Electronics/ssd/ssd1.png'],
    description: 'Ultra-fast portable SSD, USB 3.2, read speed 1050MB/s, shock resistant.', specs: { Capacity: '1TB', Interface: 'USB 3.2', 'Read Speed': '1050 MB/s', Weight: '58g' }
  },
  {
    _id: '19', name: 'Action Camera 4K', category: 'Electronics', price: 19999, originalPrice: 24999, stock: 60, discount: 20,
    images: ['/products/Electronics/camera.jpg', '/products/Electronics/camera/camera1.png', '/products/Electronics/camera/camera2.png'],
    description: '4K action camera, waterproof up to 30m, wide angle lens, image stabilization.', specs: { Resolution: '4K/60fps', Waterproof: '30m', Battery: '1500mAh', Weight: '126g' }
  },
  {
    _id: '20', name: 'Smart Watch Series 9', category: 'Electronics', price: 41900, originalPrice: 44900, stock: 80, discount: 7,
    images: ['/products/Electronics/Watch/watch1.png', '/products/Electronics/Watch/watch2.png'],
    description: 'Always-on Retina display, health monitoring, GPS, crash detection.', specs: { Display: '45mm OLED', Battery: '18 hours', Connectivity: 'Bluetooth 5.3', 'Water Resistance': '50m' }
  },
  {
    _id: '21', name: 'Neckband Bluetooth', category: 'Electronics', price: 1499, originalPrice: 2499, stock: 400, discount: 40,
    images: ['/products/Electronics/neckband.avif', '/products/Electronics/neckband/neckband1.png'],
    description: 'Magnetic neckband earphones, 20hr battery, fast charging, deep bass.', specs: { 'Driver Size': '12mm', Playtime: '20 hours', Connectivity: 'Bluetooth 5.0', Charging: '10min = 3hr' }
  },
  {
    _id: '22', name: 'Electric Toothbrush', category: 'Beauty', price: 2499, originalPrice: 3499, stock: 200, discount: 29,
    images: ['/products/Electronics/brush.jpg', '/products/Electronics/brush/brush2.jpg'],
    description: 'Sonic electric toothbrush, 5 modes, 2-min timer, 30-day battery life.', specs: { Modes: '5', Battery: '30 days', 'Brush Heads': '2 included', 'Water Resistance': 'IPX7' }
  },
  {
    _id: '23', name: 'Running Shorts', category: 'Sports', price: 899, originalPrice: 1299, stock: 500, discount: 31,
    images: ['/products/Clothing/photo-1679847628912-4c3e7402abc7.jpg', '/products/Clothing/photo-1713929689473-572aeaa5ae12.jpg'],
    description: 'Lightweight running shorts, moisture-wicking fabric, inner liner, zip pocket.', specs: { Material: 'Polyester', Fit: 'Regular', Length: '7 inch', Care: 'Machine Wash' }
  },
  {
    _id: '24', name: 'Dumbbell Set 10kg', category: 'Sports', price: 2999, originalPrice: 3999, stock: 100, discount: 25,
    images: ['/products/Clothing/photo-1740711152088-88a009e877bb.jpg', '/products/Clothing/photo-1766238955752-0200601334ed.jpg'],
    description: 'Adjustable dumbbell set, anti-slip grip, chrome finish, home gym essential.', specs: { Weight: '10kg pair', Material: 'Cast Iron', Grip: 'Knurled', Finish: 'Chrome' }
  },
  {
    _id: '25', name: 'Kurta Set Men', category: 'Clothing', price: 1799, originalPrice: 2499, stock: 300, discount: 28,
    images: ['/products/Clothing/7/shirt1.jpg', '/products/Clothing/10/clothing1.png', '/products/Clothing/10/clothing2.png'],
    description: 'Cotton blend kurta with pyjama, festive wear, comfortable fit.', specs: { Material: 'Cotton Blend', Fit: 'Regular', Occasion: 'Festive', Care: 'Hand Wash' }
  },
  {
    _id: '26', name: 'Banarasi Silk Saree', category: 'Clothing', price: 4999, originalPrice: 7999, stock: 150, discount: 38,
    images: ['/products/Clothing/photo-1775226236498-969b38fe7032.jpg', '/products/Clothing/photo-1766238955752-0200601334ed.jpg'],
    description: 'Pure silk Banarasi saree with zari work, comes with unstitched blouse piece.', specs: { Material: 'Pure Silk', Length: '6.3m', Blouse: 'Included', Occasion: 'Wedding' }
  },
  {
    _id: '74', name: 'Cotton Polo T-Shirt', category: 'Clothing', price: 799, originalPrice: 1199, stock: 600, discount: 33,
    images: ['/products/Clothing/7/shirt1.jpg', '/products/Clothing/10/clothing1.png'],
    description: 'Classic polo t-shirt, 100% cotton pique fabric, ribbed collar, regular fit.', specs: { Material: '100% Cotton', Fit: 'Regular', Collar: 'Polo Ribbed', Care: 'Machine Wash' }
  },
  {
    _id: '75', name: 'Women Anarkali Kurti', category: 'Clothing', price: 1499, originalPrice: 2199, stock: 350, discount: 32,
    images: ['/products/Clothing/photo-1775226236498-969b38fe7032.jpg', '/products/Clothing/10/clothing2.png'],
    description: 'Flared anarkali kurti, printed georgette fabric, 3/4 sleeves, ethnic wear.', specs: { Material: 'Georgette', Fit: 'Flared', Sleeve: '3/4', Occasion: 'Ethnic' }
  },
  {
    _id: '76', name: 'Denim Jacket Men', category: 'Clothing', price: 2499, originalPrice: 3499, stock: 200, discount: 29,
    images: ['/products/Clothing/8/jeans1.jpg', '/products/Clothing/8/jeans2.jpg'],
    description: 'Classic denim jacket, button closure, chest pockets, slim fit, all-season wear.', specs: { Material: '100% Denim', Fit: 'Slim', Closure: 'Button', Care: 'Machine Wash' }
  },
  {
    _id: '77', name: 'Women Palazzo Pants', category: 'Clothing', price: 899, originalPrice: 1299, stock: 450, discount: 31,
    images: ['/products/Clothing/10/clothing3.png', '/products/Clothing/10/clothing4.png'],
    description: 'Wide-leg palazzo pants, rayon fabric, elasticated waist, casual & ethnic wear.', specs: { Material: 'Rayon', Fit: 'Wide Leg', Waist: 'Elasticated', Occasion: 'Casual + Ethnic' }
  },
  {
    _id: '78', name: 'Men Chino Trousers', category: 'Clothing', price: 1799, originalPrice: 2499, stock: 300, discount: 28,
    images: ['/products/Clothing/8/jeans2.jpg', '/products/Clothing/10/clothing1.png'],
    description: 'Slim fit chino trousers, stretch cotton, flat front, versatile casual wear.', specs: { Material: 'Cotton Stretch', Fit: 'Slim', Front: 'Flat', Care: 'Machine Wash' }
  },
  {
    _id: '79', name: 'Women Wrap Dress', category: 'Clothing', price: 1999, originalPrice: 2799, stock: 250, discount: 29,
    images: ['/products/Clothing/photo-1766238955752-0200601334ed.jpg', '/products/Clothing/10/clothing2.png'],
    description: 'Floral wrap dress, V-neck, midi length, adjustable tie waist, summer wear.', specs: { Material: 'Viscose', Length: 'Midi', Neckline: 'V-Neck', Occasion: 'Casual + Party' }
  },
  {
    _id: '80', name: 'Men Linen Shirt', category: 'Clothing', price: 1499, originalPrice: 1999, stock: 400, discount: 25,
    images: ['/products/Clothing/7/shirt1.jpg', '/products/Clothing/10/clothing3.png'],
    description: 'Pure linen casual shirt, relaxed fit, half sleeves, breathable summer fabric.', specs: { Material: '100% Linen', Fit: 'Relaxed', Sleeve: 'Half', Care: 'Hand Wash' }
  },
  {
    _id: '81', name: 'Women Sports Bra', category: 'Clothing', price: 699, originalPrice: 999, stock: 500, discount: 30,
    images: ['/products/Clothing/photo-1636831990680-0d088e4cd83c.jpg', '/products/Clothing/10/clothing4.png'],
    description: 'Medium support sports bra, moisture-wicking, racerback design, 4-way stretch.', specs: { Material: 'Nylon + Spandex', Support: 'Medium', Back: 'Racerback', Stretch: '4-Way' }
  },
  {
    _id: '82', name: 'Men Sweatshirt Hoodie', category: 'Clothing', price: 1299, originalPrice: 1799, stock: 350, discount: 28,
    images: ['/products/Clothing/10/clothing1.png', '/products/Clothing/10/clothing2.png'],
    description: 'Fleece hoodie, kangaroo pocket, drawstring hood, relaxed fit, winter wear.', specs: { Material: 'Fleece', Fit: 'Relaxed', Pocket: 'Kangaroo', Care: 'Machine Wash' }
  },
  {
    _id: '83', name: 'Women Leggings', category: 'Clothing', price: 599, originalPrice: 899, stock: 700, discount: 33,
    images: ['/products/Clothing/photo-1713929689473-572aeaa5ae12.jpg', '/products/Clothing/10/clothing3.png'],
    description: 'High-waist cotton leggings, 4-way stretch, opaque, ankle length, everyday wear.', specs: { Material: 'Cotton + Spandex', Waist: 'High', Length: 'Ankle', Stretch: '4-Way' }
  },
  {
    _id: '84', name: 'Men Ethnic Nehru Jacket', category: 'Clothing', price: 2199, originalPrice: 2999, stock: 180, discount: 27,
    images: ['/products/Clothing/10/clothing2.png', '/products/Clothing/10/clothing4.png'],
    description: 'Silk blend Nehru jacket, mandarin collar, festive & wedding wear, slim fit.', specs: { Material: 'Silk Blend', Fit: 'Slim', Collar: 'Mandarin', Occasion: 'Festive + Wedding' }
  },
  {
    _id: '85', name: 'Women Salwar Suit Set', category: 'Clothing', price: 2499, originalPrice: 3499, stock: 220, discount: 29,
    images: ['/products/Clothing/photo-1775226236498-969b38fe7032.jpg', '/products/Clothing/10/clothing1.png'],
    description: 'Cotton salwar suit set with dupatta, printed, straight cut, ethnic daily wear.', specs: { Material: 'Cotton', Includes: 'Kurta + Salwar + Dupatta', Cut: 'Straight', Occasion: 'Daily + Ethnic' }
  },
  {
    _id: '86', name: 'Men Track Pants', category: 'Clothing', price: 899, originalPrice: 1299, stock: 500, discount: 31,
    images: ['/products/Clothing/photo-1679847628912-4c3e7402abc7.jpg', '/products/Clothing/10/clothing3.png'],
    description: 'Dry-fit track pants, elasticated waist with drawstring, zip pockets, slim fit.', specs: { Material: 'Polyester Dry-Fit', Fit: 'Slim', Waist: 'Elasticated + Drawstring', Pockets: 'Zip' }
  },
  {
    _id: '87', name: 'Women Crop Top', category: 'Clothing', price: 599, originalPrice: 899, stock: 600, discount: 33,
    images: ['/products/Clothing/10/clothing4.png', '/products/Clothing/photo-1766238955752-0200601334ed.jpg'],
    description: 'Ribbed crop top, round neck, sleeveless, stretchable, casual & party wear.', specs: { Material: 'Ribbed Cotton', Fit: 'Fitted', Neckline: 'Round', Occasion: 'Casual + Party' }
  },
  {
    _id: '88', name: 'Men Formal Trousers', category: 'Clothing', price: 1599, originalPrice: 2199, stock: 280, discount: 27,
    images: ['/products/Clothing/8/jeans1.jpg', '/products/Clothing/10/clothing2.png'],
    description: 'Slim fit formal trousers, wrinkle-resistant fabric, flat front, office wear.', specs: { Material: 'Polyester Blend', Fit: 'Slim', Front: 'Flat', Care: 'Machine Wash' }
  },
  {
    _id: '89', name: 'Women Cardigan', category: 'Clothing', price: 1299, originalPrice: 1799, stock: 300, discount: 28,
    images: ['/products/Clothing/10/clothing1.png', '/products/Clothing/photo-1775226236498-969b38fe7032.jpg'],
    description: 'Open-front knit cardigan, long sleeves, soft acrylic, casual winter layering.', specs: { Material: 'Acrylic Knit', Fit: 'Relaxed', Closure: 'Open Front', Season: 'Winter' }
  },
  {
    _id: '90', name: 'Men Cargo Shorts', category: 'Clothing', price: 999, originalPrice: 1499, stock: 400, discount: 33,
    images: ['/products/Clothing/8/jeans2.jpg', '/products/Clothing/photo-1713929689473-572aeaa5ae12.jpg'],
    description: 'Cotton cargo shorts, 6 pockets, drawstring waist, knee length, casual wear.', specs: { Material: '100% Cotton', Pockets: '6', Length: 'Knee', Waist: 'Drawstring' }
  },
  {
    _id: '91', name: 'Women Maxi Skirt', category: 'Clothing', price: 1199, originalPrice: 1699, stock: 320, discount: 29,
    images: ['/products/Clothing/10/clothing3.png', '/products/Clothing/photo-1766238955752-0200601334ed.jpg'],
    description: 'Flowy maxi skirt, elasticated waist, printed chiffon, floor length, boho style.', specs: { Material: 'Chiffon', Length: 'Floor', Waist: 'Elasticated', Style: 'Boho' }
  },
  {
    _id: '92', name: 'Men Bomber Jacket', category: 'Clothing', price: 2999, originalPrice: 3999, stock: 150, discount: 25,
    images: ['/products/Clothing/10/clothing2.png', '/products/Clothing/8/jeans1.jpg'],
    description: 'Satin bomber jacket, ribbed cuffs and hem, zip closure, casual streetwear.', specs: { Material: 'Satin', Fit: 'Regular', Closure: 'Zip', Style: 'Streetwear' }
  },
  {
    _id: '93', name: 'Women Kurti Palazzo Set', category: 'Clothing', price: 1799, originalPrice: 2499, stock: 280, discount: 28,
    images: ['/products/Clothing/photo-1775226236498-969b38fe7032.jpg', '/products/Clothing/10/clothing4.png'],
    description: 'Printed kurti with matching palazzo, rayon fabric, casual ethnic co-ord set.', specs: { Material: 'Rayon', Includes: 'Kurti + Palazzo', Print: 'Floral', Occasion: 'Casual Ethnic' }
  },
  {
    _id: '94', name: 'Men Graphic Tee', category: 'Clothing', price: 699, originalPrice: 999, stock: 550, discount: 30,
    images: ['/products/Clothing/7/shirt1.jpg', '/products/Clothing/photo-1679847628912-4c3e7402abc7.jpg'],
    description: 'Oversized graphic t-shirt, 100% cotton, round neck, drop shoulder, streetwear.', specs: { Material: '100% Cotton', Fit: 'Oversized', Neckline: 'Round', Style: 'Streetwear' }
  },
  {
    _id: '95', name: 'Women Blazer', category: 'Clothing', price: 2799, originalPrice: 3799, stock: 160, discount: 26,
    images: ['/products/Clothing/10/clothing1.png', '/products/Clothing/10/clothing3.png'],
    description: 'Single-button women blazer, notch lapel, slim fit, office & party wear.', specs: { Material: 'Polyester Blend', Fit: 'Slim', Buttons: 'Single', Occasion: 'Office + Party' }
  },
  {
    _id: '96', name: 'Men Thermal Inner Wear Set', category: 'Clothing', price: 999, originalPrice: 1499, stock: 400, discount: 33,
    images: ['/products/Clothing/10/clothing2.png', '/products/Clothing/10/clothing4.png'],
    description: 'Thermal top and bottom set, fleece lined, moisture-wicking, winter innerwear.', specs: { Material: 'Fleece Lined', Includes: 'Top + Bottom', Feature: 'Moisture-Wicking', Season: 'Winter' }
  },
  {
    _id: '97', name: 'Women Denim Shorts', category: 'Clothing', price: 1099, originalPrice: 1599, stock: 350, discount: 31,
    images: ['/products/Clothing/8/jeans1.jpg', '/products/Clothing/photo-1766238955752-0200601334ed.jpg'],
    description: 'High-waist denim shorts, frayed hem, 5-pocket design, slim fit, summer wear.', specs: { Material: 'Denim', Fit: 'Slim', Waist: 'High', Length: 'Short' }
  },
  {
    _id: '98', name: 'Men Sherwani Set', category: 'Clothing', price: 5999, originalPrice: 8999, stock: 80, discount: 33,
    images: ['/products/Clothing/10/clothing3.png', '/products/Clothing/photo-1775226236498-969b38fe7032.jpg'],
    description: 'Embroidered sherwani with churidar, wedding & festive occasion, rich fabric.', specs: { Material: 'Jacquard', Includes: 'Sherwani + Churidar', Embroidery: 'Thread Work', Occasion: 'Wedding' }
  },
  {
    _id: '99', name: 'Women Puffer Jacket', category: 'Clothing', price: 2499, originalPrice: 3499, stock: 200, discount: 29,
    images: ['/products/Clothing/10/clothing4.png', '/products/Clothing/photo-1713929689473-572aeaa5ae12.jpg'],
    description: 'Lightweight puffer jacket, zip closure, stand collar, packable, winter wear.', specs: { Material: 'Nylon Shell + Polyester Fill', Fit: 'Regular', Collar: 'Stand', Feature: 'Packable' }
  },
  {
    _id: '100', name: 'Men Jogger Pants', category: 'Clothing', price: 1099, originalPrice: 1599, stock: 450, discount: 31,
    images: ['/products/Clothing/photo-1636831990680-0d088e4cd83c.jpg', '/products/Clothing/8/jeans2.jpg'],
    description: 'Cotton blend jogger pants, tapered fit, elasticated cuffs, side zip pockets.', specs: { Material: 'Cotton Blend', Fit: 'Tapered', Cuffs: 'Elasticated', Pockets: 'Zip Side' }
  },
  {
    _id: '27', name: 'The Psychology of Money', category: 'Books', price: 299, originalPrice: 399, stock: 600, discount: 25,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80'],
    description: "Morgan Housel's timeless lessons on wealth, greed, and happiness.", specs: { Author: 'Morgan Housel', Pages: '256', Publisher: 'Harriman House', Language: 'English' }
  },
  {
    _id: '101', name: 'The Alchemist', category: 'Books', price: 199, originalPrice: 299, stock: 900, discount: 33,
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80'],
    description: "Paulo Coelho's masterpiece about following your dreams and listening to your heart.", specs: { Author: 'Paulo Coelho', Pages: '208', Publisher: 'HarperOne', Language: 'English' }
  },
  {
    _id: '102', name: 'Think and Grow Rich', category: 'Books', price: 249, originalPrice: 349, stock: 750, discount: 29,
    images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80'],
    description: "Napoleon Hill's classic on the 13 principles of success and wealth creation.", specs: { Author: 'Napoleon Hill', Pages: '320', Publisher: 'Fingerprint', Language: 'English' }
  },
  {
    _id: '103', name: 'The 7 Habits of Highly Effective People', category: 'Books', price: 399, originalPrice: 549, stock: 650, discount: 27,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80'],
    description: "Stephen Covey's powerful lessons in personal change and effectiveness.", specs: { Author: 'Stephen R. Covey', Pages: '432', Publisher: 'Simon & Schuster', Language: 'English' }
  },
  {
    _id: '104', name: 'Deep Work', category: 'Books', price: 349, originalPrice: 499, stock: 500, discount: 30,
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80'],
    description: "Cal Newport's rules for focused success in a distracted world.", specs: { Author: 'Cal Newport', Pages: '296', Publisher: 'Grand Central', Language: 'English' }
  },
  {
    _id: '105', name: 'Zero to One', category: 'Books', price: 399, originalPrice: 549, stock: 450, discount: 27,
    images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80'],
    description: "Peter Thiel's notes on startups and how to build the future.", specs: { Author: 'Peter Thiel', Pages: '224', Publisher: 'Crown Business', Language: 'English' }
  },
  {
    _id: '106', name: 'Sapiens', category: 'Books', price: 449, originalPrice: 599, stock: 700, discount: 25,
    images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80'],
    description: "Yuval Noah Harari's brief history of humankind from Stone Age to present.", specs: { Author: 'Yuval Noah Harari', Pages: '443', Publisher: 'Harper', Language: 'English' }
  },
  {
    _id: '107', name: 'The Lean Startup', category: 'Books', price: 349, originalPrice: 499, stock: 400, discount: 30,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80'],
    description: "Eric Ries on how today's entrepreneurs use continuous innovation to build businesses.", specs: { Author: 'Eric Ries', Pages: '336', Publisher: 'Crown Business', Language: 'English' }
  },
  {
    _id: '108', name: 'Ikigai', category: 'Books', price: 249, originalPrice: 350, stock: 800, discount: 29,
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80'],
    description: 'Japanese secret to a long and happy life — finding your purpose and joy.', specs: { Author: 'Héctor García', Pages: '208', Publisher: 'Penguin', Language: 'English' }
  },
  {
    _id: '109', name: 'The Subtle Art of Not Giving a F*ck', category: 'Books', price: 299, originalPrice: 399, stock: 700, discount: 25,
    images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80'],
    description: "Mark Manson's counterintuitive approach to living a good life.", specs: { Author: 'Mark Manson', Pages: '224', Publisher: 'HarperOne', Language: 'English' }
  },
  {
    _id: '110', name: 'Good to Great', category: 'Books', price: 399, originalPrice: 549, stock: 350, discount: 27,
    images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80'],
    description: "Jim Collins on why some companies make the leap to greatness and others don't.", specs: { Author: 'Jim Collins', Pages: '320', Publisher: 'HarperBusiness', Language: 'English' }
  },
  {
    _id: '111', name: 'The Power of Now', category: 'Books', price: 299, originalPrice: 399, stock: 600, discount: 25,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80'],
    description: "Eckhart Tolle's guide to spiritual enlightenment and living in the present moment.", specs: { Author: 'Eckhart Tolle', Pages: '236', Publisher: 'New World Library', Language: 'English' }
  },
  {
    _id: '112', name: 'Educated', category: 'Books', price: 349, originalPrice: 499, stock: 450, discount: 30,
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80'],
    description: "Tara Westover's memoir about growing up in a survivalist family and self-education.", specs: { Author: 'Tara Westover', Pages: '352', Publisher: 'Random House', Language: 'English' }
  },
  {
    _id: '113', name: 'Start With Why', category: 'Books', price: 299, originalPrice: 399, stock: 550, discount: 25,
    images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80'],
    description: "Simon Sinek on how great leaders inspire everyone to take action.", specs: { Author: 'Simon Sinek', Pages: '256', Publisher: 'Portfolio', Language: 'English' }
  },
  {
    _id: '114', name: 'Thinking, Fast and Slow', category: 'Books', price: 449, originalPrice: 599, stock: 400, discount: 25,
    images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80'],
    description: "Daniel Kahneman's exploration of the two systems that drive the way we think.", specs: { Author: 'Daniel Kahneman', Pages: '499', Publisher: 'Farrar Straus', Language: 'English' }
  },
  {
    _id: '115', name: 'The 4-Hour Workweek', category: 'Books', price: 349, originalPrice: 499, stock: 480, discount: 30,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80'],
    description: "Tim Ferriss on escaping the 9-5, living anywhere, and joining the new rich.", specs: { Author: 'Tim Ferriss', Pages: '396', Publisher: 'Crown', Language: 'English' }
  },
  {
    _id: '116', name: 'Outliers', category: 'Books', price: 299, originalPrice: 399, stock: 600, discount: 25,
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80'],
    description: "Malcolm Gladwell's story of success — why some people achieve so much more.", specs: { Author: 'Malcolm Gladwell', Pages: '309', Publisher: 'Little Brown', Language: 'English' }
  },
  {
    _id: '117', name: 'The Midnight Library', category: 'Books', price: 349, originalPrice: 499, stock: 500, discount: 30,
    images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80'],
    description: "Matt Haig's novel about a library between life and death, full of infinite possibilities.", specs: { Author: 'Matt Haig', Pages: '304', Publisher: 'Canongate', Language: 'English' }
  },
  {
    _id: '118', name: 'Can\'t Hurt Me', category: 'Books', price: 399, originalPrice: 549, stock: 420, discount: 27,
    images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80'],
    description: "David Goggins' memoir on mastering your mind and defying the odds.", specs: { Author: 'David Goggins', Pages: '364', Publisher: 'Lioncrest', Language: 'English' }
  },
  {
    _id: '119', name: 'The Richest Man in Babylon', category: 'Books', price: 199, originalPrice: 299, stock: 850, discount: 33,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80'],
    description: "George Clason's timeless parables on financial wisdom set in ancient Babylon.", specs: { Author: 'George S. Clason', Pages: '144', Publisher: 'Signet', Language: 'English' }
  },
  {
    _id: '120', name: 'Shoe Dog', category: 'Books', price: 399, originalPrice: 549, stock: 380, discount: 27,
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80'],
    description: "Phil Knight's memoir about building Nike from scratch into a global brand.", specs: { Author: 'Phil Knight', Pages: '400', Publisher: 'Scribner', Language: 'English' }
  },
  {
    _id: '121', name: 'The 48 Laws of Power', category: 'Books', price: 499, originalPrice: 699, stock: 350, discount: 29,
    images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80'],
    description: "Robert Greene's amoral, cunning, ruthless guide to power in the modern world.", specs: { Author: 'Robert Greene', Pages: '480', Publisher: 'Viking', Language: 'English' }
  },
  {
    _id: '122', name: 'Becoming', category: 'Books', price: 449, originalPrice: 599, stock: 420, discount: 25,
    images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80'],
    description: "Michelle Obama's intimate memoir about her journey from Chicago's South Side to the White House.", specs: { Author: 'Michelle Obama', Pages: '448', Publisher: 'Crown', Language: 'English' }
  },
  {
    _id: '123', name: 'The Monk Who Sold His Ferrari', category: 'Books', price: 249, originalPrice: 349, stock: 700, discount: 29,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80'],
    description: "Robin Sharma's fable about fulfilling your dreams and reaching your destiny.", specs: { Author: 'Robin Sharma', Pages: '198', Publisher: 'HarperOne', Language: 'English' }
  },
  {
    _id: '124', name: 'Hooked', category: 'Books', price: 349, originalPrice: 499, stock: 380, discount: 30,
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80'],
    description: "Nir Eyal's guide on how to build habit-forming products.", specs: { Author: 'Nir Eyal', Pages: '256', Publisher: 'Portfolio', Language: 'English' }
  },
  {
    _id: '125', name: 'The Great Gatsby', category: 'Books', price: 199, originalPrice: 299, stock: 800, discount: 33,
    images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80'],
    description: "F. Scott Fitzgerald's classic novel of the Jazz Age, wealth, and the American Dream.", specs: { Author: 'F. Scott Fitzgerald', Pages: '180', Publisher: 'Scribner', Language: 'English' }
  },
  {
    _id: '126', name: 'Wings of Fire', category: 'Books', price: 249, originalPrice: 349, stock: 900, discount: 29,
    images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80'],
    description: "Dr. APJ Abdul Kalam's autobiography — an inspiring journey from humble origins to the stars.", specs: { Author: 'A.P.J. Abdul Kalam', Pages: '196', Publisher: 'Universities Press', Language: 'English' }
  },
  {
    _id: '127', name: 'The Intelligent Investor', category: 'Books', price: 499, originalPrice: 699, stock: 400, discount: 29,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80'],
    description: "Benjamin Graham's definitive book on value investing, the bible of stock market investors.", specs: { Author: 'Benjamin Graham', Pages: '640', Publisher: 'HarperBusiness', Language: 'English' }
  },
  {
    _id: '28', name: 'Air Purifier HEPA', category: 'Home', price: 12999, originalPrice: 15999, stock: 70, discount: 19,
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&q=80'],
    description: 'True HEPA air purifier, covers 400 sq ft, removes 99.97% pollutants, quiet mode.', specs: { Coverage: '400 sq ft', Filter: 'True HEPA', Noise: '25dB', Power: '45W' }
  },
  {
    _id: '29', name: 'Face Serum Vitamin C', category: 'Beauty', price: 699, originalPrice: 999, stock: 1000, discount: 30,
    images: ['/products/Electronics/electronic-brush.jpg', '/products/Electronics/brush.jpg'],
    description: 'Brightening vitamin C serum, reduces dark spots, boosts collagen, SPF protection.', specs: { 'Skin Type': 'All', Volume: '30ml', 'Key Ingredient': 'Vitamin C 15%', SPF: '15' }
  },
  {
    _id: '30', name: 'Smart LED TV 43"', category: 'Electronics', price: 32999, originalPrice: 39999, stock: 40, discount: 18,
    images: ['/products/Electronics/photo-1523275335684-37898b6baf30.jpg', '/products/Electronics/camera.jpg'],
    description: '4K Ultra HD Smart LED TV, Android TV, Dolby Vision, built-in Chromecast.', specs: { Display: '43" 4K UHD', OS: 'Android TV', HDR: 'Dolby Vision', 'Refresh Rate': '60Hz' }
  },
  {
    _id: '31', name: 'Mechanical Keyboard', category: 'Electronics', price: 4999, originalPrice: 6999, stock: 180, discount: 29,
    images: ['/products/Electronics/mouse.jpg', '/products/Electronics/mouse/mouse1.png'],
    description: 'TKL mechanical keyboard, Cherry MX switches, RGB backlight, USB-C.', specs: { Switches: 'Cherry MX Red', Layout: 'TKL 87-key', Backlight: 'RGB', Interface: 'USB-C' }
  },
  {
    _id: '32', name: 'Gaming Headset 7.1', category: 'Electronics', price: 3499, originalPrice: 4999, stock: 220, discount: 30,
    images: ['/products/Electronics/headphone.jpg', '/products/Electronics/headphones/headphone1.png'],
    description: 'Virtual 7.1 surround sound, noise-cancelling mic, RGB, compatible with PC & console.', specs: { 'Driver Size': '50mm', Surround: '7.1 Virtual', Mic: 'Noise-Cancelling', Connectivity: 'USB + 3.5mm' }
  },
  {
    _id: '33', name: 'Smart Speaker', category: 'Electronics', price: 2999, originalPrice: 3999, stock: 300, discount: 25,
    images: ['/products/Electronics/neckband.avif', '/products/Electronics/neckband/neckband1.png'],
    description: 'Voice-controlled smart speaker, 360° sound, built-in Alexa, multi-room audio.', specs: { Speaker: '360° Omnidirectional', Connectivity: 'Wi-Fi + Bluetooth', Assistant: 'Alexa', Power: 'Adapter' }
  },
  {
    _id: '34', name: 'USB-C Hub 7-in-1', category: 'Electronics', price: 1999, originalPrice: 2999, stock: 400, discount: 33,
    images: ['/products/Electronics/ssd.jpg', '/products/Electronics/ssd/ssd1.png'],
    description: 'Multiport USB-C hub, 4K HDMI, 100W PD, SD card reader, 3x USB 3.0.', specs: { Ports: '7-in-1', HDMI: '4K@30Hz', 'Power Delivery': '100W', Interface: 'USB-C' }
  },
  {
    _id: '35', name: 'Webcam 4K', category: 'Electronics', price: 5999, originalPrice: 7999, stock: 130, discount: 25,
    images: ['/products/Electronics/camera.jpg', '/products/Electronics/camera/camera1.png'],
    description: '4K autofocus webcam, built-in stereo mic, privacy cover, plug & play.', specs: { Resolution: '4K/30fps', FOV: '90°', Mic: 'Stereo', Interface: 'USB-A' }
  },
  {
    _id: '36', name: 'Power Bank 20000mAh', category: 'Electronics', price: 1799, originalPrice: 2499, stock: 500, discount: 28,
    images: ['/products/Electronics/neckband.avif', '/products/Electronics/neckband/neckband1.png'],
    description: '20000mAh power bank, 65W fast charging, dual USB-A + USB-C, LED display.', specs: { Capacity: '20000mAh', 'Fast Charge': '65W', Ports: 'USB-A x2 + USB-C', Weight: '440g' }
  },
  {
    _id: '37', name: 'Smart Doorbell', category: 'Electronics', price: 4499, originalPrice: 5999, stock: 90, discount: 25,
    images: ['/products/Electronics/camera.jpg', '/products/Electronics/camera/camera2.png'],
    description: '1080p video doorbell, motion detection, two-way audio, night vision, cloud storage.', specs: { Resolution: '1080p', FOV: '160°', Audio: 'Two-Way', Storage: 'Cloud + SD' }
  },
  {
    _id: '38', name: 'Noise Cancelling Earbuds', category: 'Electronics', price: 8999, originalPrice: 11999, stock: 160, discount: 25,
    images: ['/products/Electronics/neckband.avif', '/products/Electronics/neckband/neckband1.png'],
    description: 'Active noise cancellation, 30hr total playtime, wireless charging case, IPX5.', specs: { ANC: 'Active', Playtime: '30 hours', Charging: 'Wireless', 'Water Resistance': 'IPX5' }
  },
  {
    _id: '39', name: 'Portable Bluetooth Speaker', category: 'Electronics', price: 2499, originalPrice: 3499, stock: 250, discount: 29,
    images: ['/products/Electronics/neckband.avif', '/products/Electronics/neckband/neckband1.png'],
    description: 'Waterproof portable speaker, 360° bass, 24hr battery, TWS pairing.', specs: { Output: '20W', Battery: '24 hours', 'Water Resistance': 'IPX7', Connectivity: 'Bluetooth 5.0' }
  },
  {
    _id: '40', name: 'Smart Plug Wi-Fi', category: 'Electronics', price: 799, originalPrice: 1199, stock: 600, discount: 33,
    images: ['/products/Electronics/ssd.jpg', '/products/Electronics/ssd/ssd1.png'],
    description: 'Wi-Fi smart plug, voice control, energy monitoring, schedule & timer, app control.', specs: { Connectivity: 'Wi-Fi 2.4GHz', 'Max Load': '2300W', Control: 'App + Voice', Compatibility: 'Alexa & Google' }
  },
  {
    _id: '41', name: 'Gaming Mouse', category: 'Electronics', price: 2299, originalPrice: 2999, stock: 280, discount: 23,
    images: ['/products/Electronics/mouse.jpg', '/products/Electronics/mouse/mouse2.png'],
    description: 'High-precision gaming mouse, 25600 DPI, 6 programmable buttons, RGB lighting.', specs: { DPI: '25600', Buttons: '6 Programmable', Polling: '1000Hz', Weight: '85g' }
  },
  {
    _id: '42', name: 'Laptop Stand Adjustable', category: 'Electronics', price: 1499, originalPrice: 1999, stock: 350, discount: 25,
    images: ['/products/Electronics/laptop.jpg', '/products/Electronics/laptop/laptop1.png'],
    description: 'Aluminium laptop stand, 6 height levels, foldable, compatible with 10–17" laptops.', specs: { Material: 'Aluminium', Angles: '6 Levels', 'Max Load': '10kg', Compatibility: '10–17" Laptops' }
  },
  {
    _id: '43', name: 'Dash Cam 2K', category: 'Electronics', price: 3999, originalPrice: 5499, stock: 110, discount: 27,
    images: ['/products/Electronics/camera.jpg', '/products/Electronics/camera/camera1.png'],
    description: '2K dash cam, 170° wide angle, night vision, loop recording, G-sensor.', specs: { Resolution: '2K/30fps', FOV: '170°', Storage: 'MicroSD up to 128GB', Feature: 'G-Sensor + Loop Rec' }
  },
  {
    _id: '44', name: 'Wireless Charger 15W', category: 'Electronics', price: 999, originalPrice: 1499, stock: 450, discount: 33,
    images: ['/products/Electronics/ssd.jpg', '/products/Electronics/ssd/ssd1.png'],
    description: '15W fast wireless charger, Qi-certified, compatible with iPhone & Android, LED indicator.', specs: { Output: '15W Max', Standard: 'Qi', Compatibility: 'iPhone + Android', Cable: 'USB-C Included' }
  },
  {
    _id: '45', name: 'Smart Home Hub', category: 'Electronics', price: 6999, originalPrice: 8999, stock: 75, discount: 22,
    images: ['/products/Electronics/photo-1523275335684-37898b6baf30.jpg', '/products/Electronics/camera.jpg'],
    description: 'Central smart home hub, Zigbee + Z-Wave + Wi-Fi, controls 100+ devices, local processing.', specs: { Protocols: 'Zigbee + Z-Wave + Wi-Fi', Devices: '100+', Processing: 'Local', Power: 'Adapter' }
  },
  {
    _id: '46', name: 'E-Reader 6" Paperwhite', category: 'Electronics', price: 13999, originalPrice: 16999, stock: 95, discount: 18,
    images: ['/products/Electronics/tablet.jpg', '/products/Electronics/camera.jpg'],
    description: '300 PPI glare-free display, 10-week battery, waterproof, 16GB storage, adjustable warm light.', specs: { Display: '6" 300 PPI', Battery: '10 weeks', Storage: '16GB', 'Water Resistance': 'IPX8' }
  },
  {
    _id: '47', name: 'Mini Projector 1080p', category: 'Electronics', price: 15999, originalPrice: 19999, stock: 55, discount: 20,
    images: ['/products/Electronics/photo-1523275335684-37898b6baf30.jpg', '/products/Electronics/laptop.jpg'],
    description: 'Full HD mini projector, 200" screen, built-in speaker, HDMI + USB, 3hr battery.', specs: { Resolution: '1080p', 'Max Screen': '200"', Battery: '3 hours', Ports: 'HDMI + USB' }
  },
  {
    _id: '48', name: 'Fitness Tracker Band', category: 'Electronics', price: 2499, originalPrice: 3499, stock: 320, discount: 29,
    images: ['/products/Electronics/Watch/watch1.png', '/products/Electronics/Watch/watch2.png'],
    description: 'Fitness band, heart rate + SpO2 monitor, 14-day battery, 5ATM waterproof, sleep tracking.', specs: { Display: '1.47" AMOLED', Battery: '14 days', 'Water Resistance': '5ATM', Sensors: 'HR + SpO2 + GPS' }
  },
  {
    _id: '49', name: 'Cricket Bat Kashmir Willow', category: 'Sports', price: 1299, originalPrice: 1799, stock: 150, discount: 28,
    images: ['/products/Clothing/photo-1679847628912-4c3e7402abc7.jpg', '/products/Clothing/photo-1713929689473-572aeaa5ae12.jpg'],
    description: 'Full size Kashmir willow cricket bat, short handle, ideal for leather ball.', specs: { Wood: 'Kashmir Willow', Handle: 'Short', Size: 'Full', Weight: '1.2 kg' }
  },
  {
    _id: '50', name: 'Football Size 5', category: 'Sports', price: 899, originalPrice: 1299, stock: 300, discount: 31,
    images: ['/products/Clothing/photo-1740711152088-88a009e877bb.jpg', '/products/Clothing/photo-1766238955752-0200601334ed.jpg'],
    description: 'FIFA-approved size 5 football, 32-panel design, butyl bladder, all-surface play.', specs: { Size: '5', Material: 'PU', Bladder: 'Butyl', Surface: 'All Ground' }
  },
  {
    _id: '51', name: 'Badminton Racket Set', category: 'Sports', price: 1499, originalPrice: 1999, stock: 200, discount: 25,
    images: ['/products/Clothing/photo-1679847628912-4c3e7402abc7.jpg', '/products/Clothing/photo-1714143136362-c6c075aaef46.jpg'],
    description: 'Set of 2 badminton rackets with 3 shuttlecocks and carry bag, ideal for beginners.', specs: { Material: 'Aluminium', Weight: '85g each', String: 'Pre-strung', Includes: '2 Rackets + 3 Shuttles' }
  },
  {
    _id: '52', name: 'Resistance Bands Set', category: 'Sports', price: 699, originalPrice: 999, stock: 500, discount: 30,
    images: ['/products/Clothing/photo-1636831990680-0d088e4cd83c.jpg', '/products/Clothing/photo-1740711152088-88a009e877bb.jpg'],
    description: 'Set of 5 resistance bands, 10–50 lbs, latex-free, includes carry bag and door anchor.', specs: { Levels: '5 (10–50 lbs)', Material: 'TPE Latex-Free', Includes: 'Bag + Anchor + Handles', Use: 'Full Body' }
  },
  {
    _id: '53', name: 'Skipping Rope Speed', category: 'Sports', price: 499, originalPrice: 799, stock: 600, discount: 38,
    images: ['/products/Clothing/photo-1713929689473-572aeaa5ae12.jpg', '/products/Clothing/photo-1679847628912-4c3e7402abc7.jpg'],
    description: 'Speed skipping rope, ball-bearing handles, adjustable length, steel cable.', specs: { Cable: 'Steel PVC Coated', Handles: 'Ball-Bearing', Length: 'Adjustable up to 3m', Weight: '150g' }
  },
  {
    _id: '54', name: 'Gym Gloves', category: 'Sports', price: 599, originalPrice: 899, stock: 400, discount: 33,
    images: ['/products/Clothing/photo-1766238955752-0200601334ed.jpg', '/products/Clothing/photo-1775226236498-969b38fe7032.jpg'],
    description: 'Half-finger gym gloves, anti-slip palm, wrist support, breathable mesh back.', specs: { Material: 'Leather + Mesh', Closure: 'Velcro', Palm: 'Anti-Slip', Sizes: 'S / M / L / XL' }
  },
  {
    _id: '55', name: 'Protein Shaker Bottle', category: 'Sports', price: 399, originalPrice: 599, stock: 700, discount: 33,
    images: ['/products/Clothing/photo-1636831990680-0d088e4cd83c.jpg', '/products/Clothing/photo-1713929689473-572aeaa5ae12.jpg'],
    description: '700ml BPA-free shaker bottle, leak-proof lid, mixing ball, measurement markings.', specs: { Capacity: '700ml', Material: 'BPA-Free Plastic', Lid: 'Leak-Proof', Includes: 'Mixing Ball' }
  },
  {
    _id: '56', name: 'Foam Roller 45cm', category: 'Sports', price: 899, originalPrice: 1299, stock: 250, discount: 31,
    images: ['/products/Clothing/photo-1740711152088-88a009e877bb.jpg', '/products/Clothing/photo-1766238955752-0200601334ed.jpg'],
    description: 'High-density foam roller for muscle recovery, deep tissue massage, 45cm length.', specs: { Length: '45cm', Diameter: '15cm', Density: 'High', Material: 'EVA Foam' }
  },
  {
    _id: '57', name: 'Swimming Goggles', category: 'Sports', price: 799, originalPrice: 1199, stock: 350, discount: 33,
    images: ['/products/Clothing/photo-1679847628912-4c3e7402abc7.jpg', '/products/Clothing/photo-1714143136362-c6c075aaef46.jpg'],
    description: 'Anti-fog UV-protected swimming goggles, adjustable strap, wide-view lens.', specs: { Lens: 'Anti-Fog UV400', Strap: 'Adjustable Silicone', Frame: 'Polycarbonate', Use: 'Pool + Open Water' }
  },
  {
    _id: '58', name: 'Cycling Helmet', category: 'Sports', price: 1999, originalPrice: 2799, stock: 120, discount: 29,
    images: ['/products/Clothing/photo-1775226236498-969b38fe7032.jpg', '/products/Clothing/photo-1766238955752-0200601334ed.jpg'],
    description: 'Lightweight cycling helmet, 18 vents, adjustable dial fit, CE certified.', specs: { Weight: '280g', Vents: '18', Certification: 'CE EN1078', Sizes: 'S / M / L' }
  },
  {
    _id: '59', name: 'Knee Support Brace', category: 'Sports', price: 699, originalPrice: 999, stock: 450, discount: 30,
    images: ['/products/Clothing/photo-1636831990680-0d088e4cd83c.jpg', '/products/Clothing/photo-1740711152088-88a009e877bb.jpg'],
    description: 'Compression knee brace, open patella design, non-slip silicone strips, pair.', specs: { Material: 'Neoprene', Design: 'Open Patella', Closure: 'Velcro', Includes: 'Pair' }
  },
  {
    _id: '60', name: 'Pull Up Bar Doorway', category: 'Sports', price: 1299, originalPrice: 1799, stock: 180, discount: 28,
    images: ['/products/Clothing/photo-1713929689473-572aeaa5ae12.jpg', '/products/Clothing/photo-1679847628912-4c3e7402abc7.jpg'],
    description: 'No-screw doorway pull-up bar, 3 grip positions, holds up to 150kg, foam grips.', specs: { 'Max Load': '150kg', Grips: '3 Positions', Installation: 'No Screws', Material: 'Steel' }
  },
  {
    _id: '61', name: 'Tennis Racket', category: 'Sports', price: 2499, originalPrice: 3499, stock: 130, discount: 29,
    images: ['/products/Clothing/photo-1766238955752-0200601334ed.jpg', '/products/Clothing/photo-1775226236498-969b38fe7032.jpg'],
    description: 'Graphite tennis racket, 100 sq in head, pre-strung, ideal for intermediate players.', specs: { Material: 'Graphite', 'Head Size': '100 sq in', Weight: '285g', String: 'Pre-strung' }
  },
  {
    _id: '62', name: 'Ab Roller Wheel', category: 'Sports', price: 599, originalPrice: 899, stock: 400, discount: 33,
    images: ['/products/Clothing/photo-1636831990680-0d088e4cd83c.jpg', '/products/Clothing/photo-1713929689473-572aeaa5ae12.jpg'],
    description: 'Double ab roller wheel with knee pad, non-slip handles, strengthens core muscles.', specs: { Wheels: 'Double', 'Max Load': '120kg', Includes: 'Knee Pad', Material: 'ABS + TPR' }
  },
  {
    _id: '63', name: 'Sports Water Bottle 1L', category: 'Sports', price: 499, originalPrice: 699, stock: 600, discount: 29,
    images: ['/products/Clothing/photo-1740711152088-88a009e877bb.jpg', '/products/Clothing/photo-1766238955752-0200601334ed.jpg'],
    description: 'Stainless steel insulated water bottle, keeps cold 24hr / hot 12hr, leak-proof flip lid.', specs: { Capacity: '1L', Material: 'Stainless Steel', Insulation: 'Cold 24hr / Hot 12hr', Lid: 'Flip Lock' }
  },
  {
    _id: '64', name: 'Ankle Weights 2kg Pair', category: 'Sports', price: 799, originalPrice: 1199, stock: 300, discount: 33,
    images: ['/products/Clothing/photo-1679847628912-4c3e7402abc7.jpg', '/products/Clothing/photo-1636831990680-0d088e4cd83c.jpg'],
    description: 'Adjustable ankle weights, 1kg each, velcro strap, sand-filled, for walking & workouts.', specs: { Weight: '1kg each (2kg pair)', Fill: 'Sand', Closure: 'Velcro', Use: 'Walking + Gym' }
  },
  {
    _id: '65', name: 'Boxing Gloves 12oz', category: 'Sports', price: 1799, originalPrice: 2499, stock: 160, discount: 28,
    images: ['/products/Clothing/photo-1775226236498-969b38fe7032.jpg', '/products/Clothing/photo-1713929689473-572aeaa5ae12.jpg'],
    description: 'PU leather boxing gloves, 12oz, triple-layer foam padding, velcro wrist strap.', specs: { Weight: '12oz', Material: 'PU Leather', Padding: 'Triple-Layer Foam', Closure: 'Velcro' }
  },
  {
    _id: '66', name: 'Treadmill Manual 3-Level', category: 'Sports', price: 8999, originalPrice: 11999, stock: 40, discount: 25,
    images: ['/products/Clothing/photo-1740711152088-88a009e877bb.jpg', '/products/Clothing/photo-1766238955752-0200601334ed.jpg'],
    description: 'Manual treadmill, 3 incline levels, LCD display, foldable, max user weight 100kg.', specs: { Type: 'Manual', Incline: '3 Levels', 'Max Load': '100kg', Display: 'LCD' }
  },
  {
    _id: '67', name: 'Gym Bag 40L', category: 'Sports', price: 1299, originalPrice: 1799, stock: 250, discount: 28,
    images: ['/products/Clothing/photo-1636831990680-0d088e4cd83c.jpg', '/products/Clothing/photo-1679847628912-4c3e7402abc7.jpg'],
    description: 'Waterproof gym duffel bag, separate shoe compartment, 40L capacity, adjustable strap.', specs: { Capacity: '40L', Material: 'Polyester', Feature: 'Shoe Compartment', Strap: 'Adjustable' }
  },
  {
    _id: '68', name: 'Volleyball Official Size', category: 'Sports', price: 999, originalPrice: 1499, stock: 200, discount: 33,
    images: ['/products/Clothing/photo-1766238955752-0200601334ed.jpg', '/products/Clothing/photo-1775226236498-969b38fe7032.jpg'],
    description: 'Official size 5 volleyball, 18-panel design, soft PU cover, indoor & outdoor use.', specs: { Size: '5', Material: 'Soft PU', Panels: '18', Use: 'Indoor + Outdoor' }
  },
  {
    _id: '69', name: 'Compression Tights', category: 'Sports', price: 1199, originalPrice: 1699, stock: 350, discount: 29,
    images: ['/products/Clothing/photo-1713929689473-572aeaa5ae12.jpg', '/products/Clothing/photo-1636831990680-0d088e4cd83c.jpg'],
    description: 'Graduated compression tights, moisture-wicking, 4-way stretch, for running & gym.', specs: { Material: 'Nylon + Spandex', Compression: 'Graduated', Stretch: '4-Way', Use: 'Running + Gym' }
  },
  {
    _id: '70', name: 'Push Up Bars', category: 'Sports', price: 699, originalPrice: 999, stock: 450, discount: 30,
    images: ['/products/Clothing/photo-1740711152088-88a009e877bb.jpg', '/products/Clothing/photo-1679847628912-4c3e7402abc7.jpg'],
    description: 'Ergonomic push-up bars, non-slip rubber base, 360° rotating handles, pair.', specs: { Handles: '360° Rotating', Base: 'Non-Slip Rubber', 'Max Load': '150kg', Includes: 'Pair' }
  },
  {
    _id: '71', name: 'Kettlebell 8kg', category: 'Sports', price: 1599, originalPrice: 2199, stock: 120, discount: 27,
    images: ['/products/Clothing/photo-1766238955752-0200601334ed.jpg', '/products/Clothing/photo-1636831990680-0d088e4cd83c.jpg'],
    description: 'Cast iron kettlebell, 8kg, powder-coated finish, flat base, wide handle.', specs: { Weight: '8kg', Material: 'Cast Iron', Finish: 'Powder Coated', Handle: 'Wide Grip' }
  },
  {
    _id: '72', name: 'Sports Sunglasses', category: 'Sports', price: 1299, originalPrice: 1799, stock: 280, discount: 28,
    images: ['/products/Clothing/photo-1775226236498-969b38fe7032.jpg', '/products/Clothing/photo-1714143136362-c6c075aaef46.jpg'],
    description: 'Polarized UV400 sports sunglasses, lightweight TR90 frame, anti-slip nose pad.', specs: { Lens: 'Polarized UV400', Frame: 'TR90', Weight: '28g', Use: 'Cycling + Running' }
  },
  {
    _id: '73', name: 'Table Tennis Set', category: 'Sports', price: 1799, originalPrice: 2499, stock: 170, discount: 28,
    images: ['/products/Clothing/photo-1713929689473-572aeaa5ae12.jpg', '/products/Clothing/photo-1740711152088-88a009e877bb.jpg'],
    description: 'Table tennis set with 2 bats, 6 balls, retractable net, carry case included.', specs: { Includes: '2 Bats + 6 Balls + Net', Bat: '5-ply Wood', Ball: '40mm 3-Star', Net: 'Retractable' }
  },
]

export const MOCK_ORDERS = [
  {
    _id: 'ord001abc123',
    status: 'DELIVERED',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    totalAmount: 159900,
    items: [{ product: MOCK_PRODUCTS[0], quantity: 1, price: 159900 }],
    address: { name: 'Demo User', phone: '9876543210', street: '123 MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001' }
  },
  {
    _id: 'ord002xyz456',
    status: 'SHIPPED',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    totalAmount: 24990,
    items: [{ product: MOCK_PRODUCTS[2], quantity: 1, price: 24990 }],
    address: { name: 'Demo User', phone: '9876543210', street: '456 FC Road', city: 'Pune', state: 'Maharashtra', pincode: '411001' }
  },
  {
    _id: 'ord003pqr789',
    status: 'PROCESSING',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    totalAmount: 12294,
    items: [
      { product: MOCK_PRODUCTS[5], quantity: 1, price: 10795 },
      { product: MOCK_PRODUCTS[15], quantity: 1, price: 1499 }
    ],
    address: { name: 'Demo User', phone: '9876543210', street: '789 Linking Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400050' }
  },
]

export const MOCK_ANALYTICS = {
  kpis: { revenue: 2847500, orders: 1284, customers: 892, products: 156, revenueTrend: 12.5, ordersTrend: 8.3, customersTrend: 15.2 },
  salesTrend: [
    { date: 'Jan', revenue: 180000, orders: 95 },
    { date: 'Feb', revenue: 220000, orders: 112 },
    { date: 'Mar', revenue: 195000, orders: 98 },
    { date: 'Apr', revenue: 280000, orders: 145 },
    { date: 'May', revenue: 310000, orders: 162 },
    { date: 'Jun', revenue: 265000, orders: 138 },
    { date: 'Jul', revenue: 340000, orders: 178 },
    { date: 'Aug', revenue: 390000, orders: 201 },
    { date: 'Sep', revenue: 420000, orders: 215 },
    { date: 'Oct', revenue: 380000, orders: 195 },
    { date: 'Nov', revenue: 450000, orders: 230 },
    { date: 'Dec', revenue: 412500, orders: 210 },
  ],
  orderStatus: [
    { status: 'DELIVERED', count: 720 },
    { status: 'SHIPPED', count: 180 },
    { status: 'PROCESSING', count: 210 },
    { status: 'PENDING', count: 95 },
    { status: 'CANCELLED', count: 79 },
  ],
}

export const MOCK_USERS = [
  { _id: 'u1', name: 'Rahul Sharma', email: 'rahul@example.com', role: 'customer', isBlocked: false, createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  { _id: 'u2', name: 'Priya Patel', email: 'priya@example.com', role: 'customer', isBlocked: false, createdAt: new Date(Date.now() - 20 * 86400000).toISOString() },
  { _id: 'u3', name: 'Amit Kumar', email: 'amit@example.com', role: 'customer', isBlocked: false, createdAt: new Date(Date.now() - 60 * 86400000).toISOString() },
  { _id: 'u4', name: 'Sneha Reddy', email: 'sneha@example.com', role: 'customer', isBlocked: true, createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  { _id: 'u5', name: 'Vikram Singh', email: 'vikram@example.com', role: 'admin', isBlocked: false, createdAt: new Date(Date.now() - 90 * 86400000).toISOString() },
  { _id: 'u6', name: 'Meera Joshi', email: 'vendor@neurocart.com', role: 'vendor', isBlocked: false, isApproved: true, storeName: 'Meera Electronics', createdAt: new Date(Date.now() - 15 * 86400000).toISOString() },
  { _id: 'u7', name: 'Ravi Gupta', email: 'ravi@example.com', role: 'vendor', isBlocked: false, isApproved: false, storeName: 'Ravi Sports', createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
]

export const MOCK_REPORTS = {
  summary: { revenue: 847500, orders: 384, avgOrderValue: 2207, newCustomers: 142 },
  sales: [
    { date: 'Week 1', revenue: 180000, orders: 85 },
    { date: 'Week 2', revenue: 220000, orders: 102 },
    { date: 'Week 3', revenue: 195000, orders: 91 },
    { date: 'Week 4', revenue: 252500, orders: 106 },
  ],
  byCategory: [
    { category: 'Electronics', revenue: 420000 },
    { category: 'Clothing', revenue: 95000 },
    { category: 'Sports', revenue: 78000 },
    { category: 'Home', revenue: 145000 },
    { category: 'Books', revenue: 32000 },
    { category: 'Beauty', revenue: 77500 },
  ],
}
