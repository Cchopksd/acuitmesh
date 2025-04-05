# Environment Configuration

## Client

route path to ```./client```

**install package**
```
npm install
```

**run command**
```
npm run dev
```

**Environment Variables:**
```env
API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080/api/ws
```


**Deployment Platform:** [Vercel](https://vercel.com/)  
**Root Directory:** `./client`

---

## Server

route path to `./server`

**install package**
```
go install
```
**run command**
```
go run main.go
```



**Environment Variables:**
```env
PORT=8080
DATABASE_URL=postgres://postgres:postgres@localhost:5432/acuitmesh?sslmode=disable
JWT_SECRET=u1LOJgLKMmflskmf2234_*
```

**Deployment Platform:** [Railway](https://railway.com/)  
**Root Directory:** `./server`  
**Technology Stack:** Go (Golang)  

**Custom Build Command:**
```bash
go build -o server
```

**Custom Start Command:**
```bash
server
```

---

# Features

- Full CRUD functionality for tasks
- Create and manage task boards
- Role-based collaboration management
- Permission validation on the client side
- Token-based authentication (JWT)
- Environment-specific configurations

---

# API Documentation

Comprehensive API documentation is available via Postman:  
🔗 [API Reference](https://documenter.getpostman.com/view/27306572/2sB2cUA34C#7c1a9e0a-7501-44d6-9c93-6b416280ad2e)

---

# Database Entity-Relationship (ER) Diagram

![ER Diagram](./Task.png)

### Schema Overview

1. **Users** can create multiple **Task Boards**.
2. **Task Boards** support user management and role assignment.
3. **Tasks** can be created within boards and assigned to users.
4. Each **Task Board** can contain multiple **Tasks**.

---