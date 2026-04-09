// Electronics
import iphone1 from '../assets/products/Electronics/photo-1523275335684-37898b6baf30.jpg'
import laptop1 from '../assets/products/Electronics/laptop.jpg'
import laptop2 from '../assets/products/Electronics/laptop/laptop1.png'
import headphone1 from '../assets/products/Electronics/headphone.jpg'
import headphone2 from '../assets/products/Electronics/headphones/headphone1.png'
import headphone3 from '../assets/products/Electronics/headphones/headphone2.png'
import headphone4 from '../assets/products/Electronics/headphones/headphone3.png'
import tablet1 from '../assets/products/Electronics/tablet.jpg'
import watch1 from '../assets/products/Electronics/Watch/watch1.png'
import watch2 from '../assets/products/Electronics/Watch/watch2.png'
import neckband1 from '../assets/products/Electronics/neckband.avif'
import neckband2 from '../assets/products/Electronics/neckband/neckband1.png'
import mouse1 from '../assets/products/Electronics/mouse.jpg'
import mouse2 from '../assets/products/Electronics/mouse/mouse1.png'
import mouse3 from '../assets/products/Electronics/mouse/mouse2.png'
import camera1 from '../assets/products/Electronics/camera.jpg'
import camera2 from '../assets/products/Electronics/camera/camera1.png'
import camera3 from '../assets/products/Electronics/camera/camera2.png'
import ssd1 from '../assets/products/Electronics/ssd.jpg'
import ssd2 from '../assets/products/Electronics/ssd/ssd1.png'
import brush1 from '../assets/products/Electronics/brush.jpg'
import brush2 from '../assets/products/Electronics/brush/brush2.jpg'
import brushpaste1 from '../assets/products/Electronics/brush.jpg'

// Clothing
import shirt1 from '../assets/products/Clothing/7/shirt1.jpg'
import jeans1 from '../assets/products/Clothing/8/jeans1.jpg'
import jeans2 from '../assets/products/Clothing/8/jeans2.jpg'
import clothing1 from '../assets/products/Clothing/10/clothing1.png'
import clothing2 from '../assets/products/Clothing/10/clothing2.png'
import clothing3 from '../assets/products/Clothing/10/clothing3.png'
import clothing4 from '../assets/products/Clothing/10/clothing4.png'
import clothingPhoto1 from '../assets/products/Clothing/photo-1621951753163-ee63e7fc147e.jpg'
import clothingPhoto2 from '../assets/products/Clothing/photo-1636831990680-0d088e4cd83c.jpg'
import clothingPhoto3 from '../assets/products/Clothing/photo-1679847628912-4c3e7402abc7.jpg'
import clothingPhoto4 from '../assets/products/Clothing/photo-1713929689473-572aeaa5ae12.jpg'
import clothingPhoto5 from '../assets/products/Clothing/photo-1714143136362-c6c075aaef46.jpg'
import clothingPhoto6 from '../assets/products/Clothing/photo-1740711152088-88a009e877bb.jpg'
import clothingPhoto7 from '../assets/products/Clothing/photo-1766238955752-0200601334ed.jpg'
import clothingPhoto8 from '../assets/products/Clothing/photo-1775226236498-969b38fe7032.jpg'

export const MOCK_PRODUCTS = [
  { _id: '1', name: 'iPhone 15 Pro Max', category: 'Electronics', price: 159900, originalPrice: 169900, stock: 50, discount: 6,
    images: [iphone1, watch1, watch2],
    description: 'Titanium design, A17 Pro chip, 48MP camera system with 5x optical zoom.', specs: { Display: '6.7" Super Retina XDR', Chip: 'A17 Pro', Storage: '256GB', Battery: '4422 mAh' } },
  { _id: '2', name: 'Samsung Galaxy S24 Ultra', category: 'Electronics', price: 129999, originalPrice: 139999, stock: 35, discount: 7,
    images: [camera1, camera2, camera3],
    description: 'Galaxy AI, built-in S Pen, 200MP camera, Snapdragon 8 Gen 3.', specs: { Display: '6.8" Dynamic AMOLED', Chip: 'Snapdragon 8 Gen 3', Storage: '256GB', Battery: '5000 mAh' } },
  { _id: '3', name: 'Sony WH-1000XM5', category: 'Electronics', price: 24990, originalPrice: 29990, stock: 120, discount: 17,
    images: [headphone1, headphone2, headphone3, headphone4],
    description: 'Industry-leading noise cancellation, 30hr battery, multipoint connection.', specs: { 'Driver Size': '30mm', 'Battery Life': '30 hours', Connectivity: 'Bluetooth 5.2', Weight: '250g' } },
  { _id: '4', name: 'MacBook Air M3 15"', category: 'Electronics', price: 134900, originalPrice: 134900, stock: 25, discount: 0,
    images: [laptop1, laptop2],
    description: 'Supercharged by M3 chip, 18-hour battery, Liquid Retina display.', specs: { Chip: 'Apple M3', RAM: '16GB', Storage: '512GB SSD', Display: '15.3" Liquid Retina' } },
  { _id: '5', name: 'iPad Pro M4 11"', category: 'Electronics', price: 99900, originalPrice: 109900, stock: 40, discount: 9,
    images: [tablet1, camera1, camera2],
    description: 'Thinnest Apple product ever, Ultra Retina XDR display, M4 chip.', specs: { Chip: 'Apple M4', Display: '11" Ultra Retina XDR', Storage: '256GB', Connectivity: 'Wi-Fi 6E' } },
  { _id: '6', name: 'Nike Air Max 270', category: 'Sports', price: 10795, originalPrice: 12995, stock: 200, discount: 17,
    images: [clothingPhoto3, clothingPhoto4, clothingPhoto5],
    description: 'Max Air unit in the heel for all-day comfort. Breathable mesh upper.', specs: { Material: 'Mesh + Synthetic', Sole: 'Rubber', Closure: 'Lace-up', 'Available Sizes': '6-12 UK' } },
  { _id: '7', name: 'Adidas Ultraboost 23', category: 'Sports', price: 14999, originalPrice: 17999, stock: 150, discount: 17,
    images: [clothingPhoto6, clothingPhoto7, clothingPhoto8],
    description: 'Responsive Boost midsole, Primeknit+ upper, Continental rubber outsole.', specs: { Material: 'Primeknit+', Midsole: 'Boost', Outsole: 'Continental Rubber', Drop: '10mm' } },
  { _id: '8', name: "Levi's 511 Slim Jeans", category: 'Clothing', price: 2999, originalPrice: 3999, stock: 300, discount: 25,
    images: [jeans1, jeans2, clothingPhoto1],
    description: 'Classic slim fit from hip to ankle. Sits below waist.', specs: { Fit: 'Slim', Rise: 'Below Waist', Material: '99% Cotton 1% Elastane', Care: 'Machine Wash' } },
  { _id: '9', name: 'Allen Solly Formal Shirt', category: 'Clothing', price: 1299, originalPrice: 1799, stock: 500, discount: 28,
    images: [shirt1, clothing1, clothing2, clothing3, clothing4],
    description: 'Regular fit formal shirt, wrinkle-free fabric, perfect for office.', specs: { Fit: 'Regular', Material: '60% Cotton 40% Polyester', Collar: 'Spread', Sleeve: 'Full' } },
  { _id: '10', name: 'Atomic Habits', category: 'Books', price: 349, originalPrice: 499, stock: 1000, discount: 30,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80'],
    description: "James Clear's #1 NYT bestseller. Tiny changes, remarkable results.", specs: { Author: 'James Clear', Pages: '320', Publisher: 'Penguin', Language: 'English' } },
  { _id: '11', name: 'Rich Dad Poor Dad', category: 'Books', price: 249, originalPrice: 350, stock: 800, discount: 29,
    images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80'],
    description: "Robert Kiyosaki's personal finance classic. What the rich teach their kids.", specs: { Author: 'Robert Kiyosaki', Pages: '336', Publisher: 'Plata Publishing', Language: 'English' } },
  { _id: '12', name: 'Dyson V15 Detect', category: 'Home', price: 49900, originalPrice: 52900, stock: 45, discount: 6,
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&q=80'],
    description: 'Laser detects invisible dust. HEPA filtration. 60 min runtime.', specs: { Suction: '230 AW', Runtime: '60 min', Filtration: 'HEPA', Weight: '3.1 kg' } },
  { _id: '13', name: 'Instant Pot Duo 7-in-1', category: 'Home', price: 7499, originalPrice: 8999, stock: 80, discount: 17,
    images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80'],
    description: 'Pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, warmer.', specs: { Capacity: '5.7L', Programs: '14 Smart', Voltage: '220V', Material: 'Stainless Steel' } },
  { _id: '14', name: 'Lakme 9to5 Primer', category: 'Beauty', price: 399, originalPrice: 499, stock: 2000, discount: 20,
    images: [brush1, brush2, brushpaste1],
    description: 'Matte finish primer, controls oil, 16hr wear, SPF 20.', specs: { 'Skin Type': 'All', Finish: 'Matte', SPF: '20', Volume: '30ml' } },
  { _id: '15', name: 'boAt Airdopes 141', category: 'Electronics', price: 999, originalPrice: 1999, stock: 500, discount: 50,
    images: [neckband1, neckband2],
    description: 'True wireless earbuds, 42H total playtime, BEAST mode, IPX4.', specs: { 'Driver Size': '8mm', Playtime: '42 hours', Connectivity: 'Bluetooth 5.3', 'Water Resistance': 'IPX4' } },
  { _id: '16', name: 'Yoga Mat Premium 6mm', category: 'Sports', price: 1499, originalPrice: 1999, stock: 200, discount: 25,
    images: [clothingPhoto2, ssd1, ssd2],
    description: 'Anti-slip TPE material, eco-friendly, includes carry strap.', specs: { Material: 'TPE', Thickness: '6mm', Size: '183 x 61 cm', Weight: '1.1 kg' } },
  { _id: '17', name: 'Wireless Mouse', category: 'Electronics', price: 1299, originalPrice: 1799, stock: 300, discount: 28,
    images: [mouse1, mouse2, mouse3],
    description: 'Ergonomic wireless mouse, 2.4GHz, long battery life.', specs: { Connectivity: 'Wireless 2.4GHz', Battery: 'AA', DPI: '1600', Weight: '90g' } },
]
