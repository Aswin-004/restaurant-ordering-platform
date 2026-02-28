# Quick Test Commands

## Setup

```bash
# Navigate to backend
cd backend

# Install test dependencies
pip install pytest pytest-asyncio

# Or update all dependencies
pip install -r requirements.txt
```

## Run Tests

### All Tests
```bash
pytest -v
```

### Specific File
```bash
pytest tests/test_auth.py -v
pytest tests/test_admin.py -v
pytest tests/test_orders.py -v
```

### Specific Test Class
```bash
pytest tests/test_auth.py::TestAdminLogin -v
pytest tests/test_auth.py::TestTokenVerification -v
pytest tests/test_auth.py::TestChangePassword -v
```

### Single Test
```bash
pytest tests/test_auth.py::TestAdminLogin::test_login_success -v
pytest tests/test_auth.py::TestChangePassword::test_password_actually_changed -v
```

## Options

```bash
# Show output and print statements
pytest -v -s

# Stop on first failure
pytest -x

# Show slowest tests
pytest --durations=10

# Generate coverage report
pytest --cov=.
```

## Requirements

- MongoDB running locally (or set TEST_MONGO_URL env var)
- pytest >= 7.4.0
- pytest-asyncio >= 0.21.0
- All packages in requirements.txt

## Test Database

- Uses separate `test_restaurant_db` database
- **Auto-cleaned after test suite**
- Does NOT modify production data

## Success Output

```
tests/test_auth.py::TestAdminLogin::test_login_success PASSED
tests/test_auth.py::TestTokenVerification::test_verify_valid_token PASSED
tests/test_admin.py::TestAdminProtectedRoutes::test_dashboard_with_valid_token PASSED
... [more tests]

===== 45 passed in 3.25s =====
```

## Common Issues

**MongoDB connection refused:**
```bash
# Ensure MongoDB is running
# Windows: Use MongoDB Community Server
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

**Module not found:**
```bash
# Navigate to backend directory
cd backend
pytest
```

**Tests timeout:**
```bash
# Try running with short traceback
pytest --tb=short
```

See [TESTING_GUIDE.md](../TESTING_GUIDE.md) for complete documentation.
