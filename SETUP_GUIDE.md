# NeuroCart - Intelligent Multi-Vendor E-Commerce Platform

## Quick Setup

### 1. Clone & Install Dependencies

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 2. Configure Database Connection

Copy `.env.example` to `.env` and configure your database:

```bash
cp .env.example .env
```

**Default (SQLite - Development):**
```bash
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3
```

**PostgreSQL (Production Recommended):**
```bash
DB_ENGINE=django.db.backends.postgresql
DB_NAME=neurocart
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
```

For detailed database setup, see [DATABASE_SETUP.md](./DATABASE_SETUP.md)

### 3. Initialize Database

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

### 4. Run the Project

**Backend:**
```bash
cd backend
python manage.py runserver
# API available at http://localhost:8000
```

**Frontend:**
```bash
cd frontend
npm run dev
# Frontend available at http://localhost:5173
```

---

## Project Structure

- **`backend/`** - Django REST API
  - `config/` - Settings, URLs, WSGI
  - `users/` - Authentication & user management
  - `products/` - Product catalog
  - `orders/` - Cart & order management
  - `vendors/` - Vendor profiles
  - `payments/` - Payment processing
  - `analytics_app/` - Dashboards & reports
  - `services/` - Business logic layer

- **`frontend/`** - React SPA
  - `src/pages/` - Route pages
  - `src/components/` - Reusable components
  - `src/context/` - State management
  - `src/services/` - API integration

---

## Database Support

| Database | Environment | Use Case |
|----------|-------------|----------|
| SQLite | Development | Local testing, quick setup |
| PostgreSQL | Production | Recommended for production |
| MySQL | Production | Alternative option |

---

## Key Features

✅ Multi-vendor marketplace  
✅ JWT authentication  
✅ Real-time cart management  
✅ Order processing & tracking  
✅ Payment integration (Card, UPI, Wallet, COD)  
✅ AI-driven recommendations  
✅ Analytics dashboards  
✅ Vendor verification workflow  
✅ Product reviews & ratings  

---

## Tech Stack

**Backend:**
- Django 6.0.4
- Django REST Framework
- PostgreSQL / MySQL / SQLite
- Redis (caching)

**Frontend:**
- React 19
- Vite
- Tailwind CSS
- Recharts (analytics)

---

## Environment Variables

See `.env.example` for all available options. Key variables:

```env
# Django
SECRET_KEY=your-secret-key
DEBUG=True/False

# Database (see DATABASE_SETUP.md)
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## API Documentation

Access the API at `http://localhost:8000/api/`

### Main Endpoints:
- `/api/auth/` - Authentication
- `/api/products/` - Products catalog
- `/api/cart/` - Shopping cart
- `/api/orders/` - Orders
- `/api/vendors/` - Vendor management
- `/api/payments/` - Payments
- `/api/admin/` - Admin analytics

---

## Testing

```bash
cd backend
pytest
```

---

## Deployment

See DATABASE_SETUP.md for production database configuration with PostgreSQL and Redis.

---

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## License

MIT License
