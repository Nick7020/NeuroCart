# NeuroCart Database Setup Guide

## Current Configuration

Your Django project is configured to support multiple databases via environment variables. The database engine is read from the `.env` file.

---

## 1. SQLite (Development - Default)

**Best for:** Local development, testing

```env
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3
```

**No additional setup required** - SQLite comes with Python.

### Initialize the database:
```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

---

## 2. PostgreSQL (Recommended for Production)

**Best for:** Production, scalability, advanced features

### Prerequisites:
```bash
# Install PostgreSQL locally or use a cloud service
# Then install the Python driver:
pip install psycopg2-binary
```

### Configuration (`.env`):
```env
DB_ENGINE=django.db.backends.postgresql
DB_NAME=neurocart
DB_USER=postgres
DB_PASSWORD=your-secure-password
DB_HOST=localhost
DB_PORT=5432
```

### Create database:
```bash
# Windows (PowerShell with PostgreSQL tools)
psql -U postgres -c "CREATE DATABASE neurocart;"
psql -U postgres -c "ALTER ROLE postgres WITH PASSWORD 'your-secure-password';"

# OR via pgAdmin (GUI)
```

### Run migrations:
```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

---

## 3. MySQL (Alternative for Production)

**Best for:** Existing MySQL infrastructure

### Prerequisites:
```bash
# Install MySQL locally or use a cloud service
# Then install the Python driver:
pip install mysqlclient
```

### Configuration (`.env`):
```env
DB_ENGINE=django.db.backends.mysql
DB_NAME=neurocart
DB_USER=root
DB_PASSWORD=your-secure-password
DB_HOST=localhost
DB_PORT=3306
```

### Create database:
```bash
# Windows Command Prompt
mysql -u root -p -e "CREATE DATABASE neurocart;"
mysql -u root -p -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'your-secure-password';"

# OR via MySQL Workbench (GUI)
```

### Run migrations:
```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

---

## 4. Database Migration Workflow

```bash
# Create migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# View migration status
python manage.py showmigrations

# Rollback to previous migration
python manage.py migrate app_name 0001
```

---

## 5. Production Recommendations

### PostgreSQL Setup (Recommended)
1. Use cloud services: AWS RDS, Google Cloud SQL, or Heroku PostgreSQL
2. Set strong passwords
3. Enable SSL connections
4. Use connection pooling (PgBouncer)

### Environment Variables for Production
```env
DEBUG=False
SECRET_KEY=your-very-long-random-secret-key

# PostgreSQL Production
DB_ENGINE=django.db.backends.postgresql
DB_NAME=neurocart_prod
DB_USER=postgres
DB_PASSWORD=very-strong-password
DB_HOST=your-rds-instance.aws.amazon.com
DB_PORT=5432
DB_CONN_MAX_AGE=600

# CORS for your domain
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Redis for caching
REDIS_URL=redis://:password@your-redis-instance:6379/0
```

---

## 6. Backup & Restore

### PostgreSQL Backup:
```bash
pg_dump -U postgres -h localhost neurocart > backup.sql
pg_restore -U postgres -h localhost -d neurocart backup.sql
```

### MySQL Backup:
```bash
mysqldump -u root -p neurocart > backup.sql
mysql -u root -p neurocart < backup.sql
```

---

## 7. Troubleshooting

### Connection Refused
- Check if database server is running
- Verify host, port, and credentials in `.env`
- Ensure firewall allows database connections

### Permission Denied
- Verify `DB_USER` has proper permissions
- For PostgreSQL: `ALTER ROLE postgres WITH LOGIN;`
- For MySQL: `GRANT ALL PRIVILEGES ON neurocart.* TO 'root'@'localhost';`

### Migration Issues
- Check model syntax
- Run `python manage.py makemigrations --dry-run` first
- Check existing migrations in `migrations/` folders

---

## 8. Database Monitoring

### Django Admin
Access at `http://localhost:8000/admin` to view database contents.

### Django Shell
```bash
python manage.py shell

# Example queries:
from products.models import Product
Product.objects.all().count()
```

### Query Logging (Development)
Django debug toolbar automatically logs database queries when `DEBUG=True`.
