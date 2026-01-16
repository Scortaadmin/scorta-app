# SCORTA Backend API - Test Examples

## Base URL
```
http://localhost:3001
```

## 1. Health Check

```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "SCORTA API is running",
  "timestamp": "2026-01-13T...",
  "environment": "development"
}
```

---

## 2. Authentication

### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "role": "client",
    "name": "Juan Pérez",
    "phone": "+593 99 123 4567",
    "city": "Quito"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Save the token from response!**

### Get Current User
```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 3. Profiles

### Get All Profiles
```bash
curl http://localhost:3001/api/profiles
```

### Get Profiles with Filters
```bash
# By city
curl "http://localhost:3001/api/profiles?city=Quito"

# By price range
curl "http://localhost:3001/api/profiles?minPrice=50&maxPrice=100"

# Search
curl "http://localhost:3001/api/profiles?search=Valeria"
```

### Create Profile (Provider only)
```bash
curl -X POST http://localhost:3001/api/profiles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "María",
    "age": 25,
    "city": "Quito",
    "price": 80,
    "ethnicity": "Latina",
    "nationality": "Ecuatoriana",
    "description": "Descripción del perfil"
  }'
```

---

## 4. Favorites

### Get My Favorites
```bash
curl http://localhost:3001/api/favorites \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Add to Favorites
```bash
curl -X POST http://localhost:3001/api/favorites/PROFILE_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Remove from Favorites
```bash
curl -X DELETE http://localhost:3001/api/favorites/PROFILE_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 5. Reviews

### Get Reviews for Profile
```bash
curl http://localhost:3001/api/reviews/PROFILE_ID
```

### Create Review
```bash
curl -X POST http://localhost:3001/api/reviews/PROFILE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "rating": 5,
    "text": "Excelente servicio, muy profesional y puntual."
  }'
```

---

## 6. Messages

### Get Conversations
```bash
curl http://localhost:3001/api/messages/conversations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Send Message
```bash
curl -X POST http://localhost:3001/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "recipient": "USER_ID_HERE",
    "text": "Hola, me interesa tu servicio"
  }'
```

---

## 7. Payments

### Process Payment
```bash
curl -X POST http://localhost:3001/api/payments/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "type": "boost",
    "amount": 29.99,
    "paymentMethod": {
      "type": "card",
      "last4": "4242",
      "cardType": "visa"
    },
    "profileId": "PROFILE_ID_HERE",
    "duration": 7
  }'
```

### Get Transaction History
```bash
curl http://localhost:3001/api/payments/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 8. File Upload

### Upload Avatar
```bash
curl -X POST http://localhost:3001/api/upload/avatar \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "avatar=@/path/to/image.jpg"
```

### Upload Profile Photos
```bash
curl -X POST http://localhost:3001/api/upload/profile-photos \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "photos=@/path/to/photo1.jpg" \
  -F "photos=@/path/to/photo2.jpg"
```

---

## Testing with Postman

1. Import these endpoints into Postman
2. Create an environment variable `token` after login
3. Use `{{token}}` in Authorization headers

## Testing with JavaScript (Frontend)

```javascript
// Register
const response = await fetch('http://localhost:3001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        role: 'client'
    })
});
const data = await response.json();
const token = data.data.token;

// Use token for authenticated requests
const profiles = await fetch('http://localhost:3001/api/profiles', {
    headers: { 'Authorization': `Bearer ${token}` }
});
```
