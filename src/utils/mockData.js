export const MOCK_PRODUCTS = [
  { _id: '1', name: 'iPhone 15 Pro Max', category: 'Electronics', price: 159900, originalPrice: 169900, stock: 50, discount: 6,
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
    ],
    description: 'Titanium design, A17 Pro chip, 48MP camera system with 5x optical zoom.', specs: { Display: '6.7" Super Retina XDR', Chip: 'A17 Pro', Storage: '256GB', Battery: '4422 mAh' } },
  { _id: '2', name: 'Samsung Galaxy S24 Ultra', category: 'Electronics', price: 129999, originalPrice: 139999, stock: 35, discount: 7,
    images: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80',
      'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&q=80',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80',
    ],
    description: 'Galaxy AI, built-in S Pen, 200MP camera, Snapdragon 8 Gen 3.', specs: { Display: '6.8" Dynamic AMOLED', Chip: 'Snapdragon 8 Gen 3', Storage: '256GB', Battery: '5000 mAh' } },
  { _id: '3', name: 'Sony WH-1000XM5', category: 'Electronics', price: 24990, originalPrice: 29990, stock: 120, discount: 17,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80',
    ],
    description: 'Industry-leading noise cancellation, 30hr battery, multipoint connection.', specs: { 'Driver Size': '30mm', 'Battery Life': '30 hours', Connectivity: 'Bluetooth 5.2', Weight: '250g' } },
  { _id: '4', name: 'MacBook Air M3 15"', category: 'Electronics', price: 134900, originalPrice: 134900, stock: 25, discount: 0,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
      'https://images.unsplash.com/photo-1611186871525-9c4f9b855c3e?w=600&q=80',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80',
    ],
    description: 'Supercharged by M3 chip, 18-hour battery, Liquid Retina display.', specs: { Chip: 'Apple M3', RAM: '16GB', Storage: '512GB SSD', Display: '15.3" Liquid Retina' } },
  { _id: '5', name: 'iPad Pro M4 11"', category: 'Electronics', price: 99900, originalPrice: 109900, stock: 40, discount: 9,
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80',
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&q=80',
      'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=600&q=80',
    ],
    description: 'Thinnest Apple product ever, Ultra Retina XDR display, M4 chip.', specs: { Chip: 'Apple M4', Display: '11" Ultra Retina XDR', Storage: '256GB', Connectivity: 'Wi-Fi 6E' } },
  { _id: '6', name: 'Nike Air Max 270', category: 'Sports', price: 10795, originalPrice: 12995, stock: 200, discount: 17,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80',
    ],
    description: 'Max Air unit in the heel for all-day comfort. Breathable mesh upper.', specs: { Material: 'Mesh + Synthetic', Sole: 'Rubber', Closure: 'Lace-up', 'Available Sizes': '6-12 UK' } },
  { _id: '7', name: 'Adidas Ultraboost 23', category: 'Sports', price: 14999, originalPrice: 17999, stock: 150, discount: 17,
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80',
      'https://images.unsplash.com/photo-1556906781-9a412961a28c?w=600&q=80',
    ],
    description: 'Responsive Boost midsole, Primeknit+ upper, Continental rubber outsole.', specs: { Material: 'Primeknit+', Midsole: 'Boost', Outsole: 'Continental Rubber', Drop: '10mm' } },
  { _id: '8', name: "Levi's 511 Slim Jeans", category: 'Clothing', price: 2999, originalPrice: 3999, stock: 300, discount: 25,
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
      'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=600&q=80',
      'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=600&q=80',
    ],
    description: 'Classic slim fit from hip to ankle. Sits below waist.', specs: { Fit: 'Slim', Rise: 'Below Waist', Material: '99% Cotton 1% Elastane', Care: 'Machine Wash' } },
  { _id: '9', name: 'Allen Solly Formal Shirt', category: 'Clothing', price: 1299, originalPrice: 1799, stock: 500, discount: 28,
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80',
      'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80',
    ],
    description: 'Regular fit formal shirt, wrinkle-free fabric, perfect for office.', specs: { Fit: 'Regular', Material: '60% Cotton 40% Polyester', Collar: 'Spread', Sleeve: 'Full' } },
  { _id: '10', name: 'Atomic Habits', category: 'Books', price: 349, originalPrice: 499, stock: 1000, discount: 30,
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80',
      'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&q=80',
    ],
    description: "James Clear's #1 NYT bestseller. Tiny changes, remarkable results.", specs: { Author: 'James Clear', Pages: '320', Publisher: 'Penguin', Language: 'English' } },
  { _id: '11', name: 'Rich Dad Poor Dad', category: 'Books', price: 249, originalPrice: 350, stock: 800, discount: 29,
    images: [
      'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80',
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80',
    ],
    description: "Robert Kiyosaki's personal finance classic. What the rich teach their kids.", specs: { Author: 'Robert Kiyosaki', Pages: '336', Publisher: 'Plata Publishing', Language: 'English' } },
  { _id: '12', name: 'Dyson V15 Detect', category: 'Home', price: 49900, originalPrice: 52900, stock: 45, discount: 6,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&q=80',
      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80',
    ],
    description: 'Laser detects invisible dust. HEPA filtration. 60 min runtime.', specs: { Suction: '230 AW', Runtime: '60 min', Filtration: 'HEPA', Weight: '3.1 kg' } },
  { _id: '13', name: 'Instant Pot Duo 7-in-1', category: 'Home', price: 7499, originalPrice: 8999, stock: 80, discount: 17,
    images: [
      'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
      'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&q=80',
    ],
    description: 'Pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, warmer.', specs: { Capacity: '5.7L', Programs: '14 Smart', Voltage: '220V', Material: 'Stainless Steel' } },
  { _id: '14', name: 'Lakme 9to5 Primer', category: 'Beauty', price: 399, originalPrice: 499, stock: 2000, discount: 20,
    images: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
    ],
    description: 'Matte finish primer, controls oil, 16hr wear, SPF 20.', specs: { 'Skin Type': 'All', Finish: 'Matte', SPF: '20', Volume: '30ml' } },
  { _id: '15', name: 'boAt Airdopes 141', category: 'Electronics', price: 999, originalPrice: 1999, stock: 500, discount: 50,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80',
      'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&q=80',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&q=80',
    ],
    description: 'True wireless earbuds, 42H total playtime, BEAST mode, IPX4.', specs: { 'Driver Size': '8mm', Playtime: '42 hours', Connectivity: 'Bluetooth 5.3', 'Water Resistance': 'IPX4' } },
  { _id: '16', name: 'Yoga Mat Premium 6mm', category: 'Sports', price: 1499, originalPrice: 1999, stock: 200, discount: 25,
    images: [
      'https://images.unsplash.com/photo-1601925228008-f5e4c5e5e5e5?w=600&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    ],
    description: 'Anti-slip TPE material, eco-friendly, includes carry strap.', specs: { Material: 'TPE', Thickness: '6mm', Size: '183 x 61 cm', Weight: '1.1 kg' } },
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
