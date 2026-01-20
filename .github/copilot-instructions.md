# Copilot Instructions for AI-ECOM-D

## Architecture Overview

**Stack**: React 19 (Vite) + Node.js/Express + Prisma ORM + MySQL
- **Client** ([client/](client/)): React frontend with Zustand state management, Tailwind CSS, Stripe integration
- **Server** ([server/](server/)): Express REST API with JWT auth, Prisma models, Stripe webhooks
- **Database**: MySQL with Prisma schema defining User, Product, Order, Category models

### Key Data Flows
1. **Auth**: Login → JWT token stored in Zustand `token` state → Bearer token in API headers
2. **Cart**: Products added via `actionAddtoCart()` → stored in Zustand `carts[]` → persisted to localStorage
3. **Products**: Listed/filtered via `/api/search/filters` and `/api/products/:count` → displayed with images from Cloudinary
4. **Orders**: Stripe payment → webhook creates Order record with Prisma → user sees in order history

## Frontend (React) Conventions

### State Management (Zustand Store)
- Located in [client/src/store/ecom-store.jsx](client/src/store/ecom-store.jsx)
- Persists to localStorage via `zustand/middleware`
- Key actions: `actionAddtoCart()`, `actionUpdateQuantity()`, `logout()`, `getTotalPrice()`
- Always use `set()` with object to update state atomically

### Authentication Flow
- Token stored in `useEcomStore` and checked in [App.jsx](client/src/App.jsx) with `jwtDecode`
- Expired tokens auto-logout user
- Protected routes in [routes/AppRoutes.jsx](client/src/routes/AppRoutes.jsx) use `ProtectRouteUser` and `ProtectRouteAdmin`
- API calls include `Authorization: Bearer ${token}` header

### API Pattern
- All API calls in [client/src/api/](client/src/api/) folder (auth.jsx, product.jsx, Category.jsx, etc.)
- Use axios with base URL `http://103.91.205.96:5001/api/`
- Example: `const res = await axios.post('/api/login', form)`

### Component Structure
- Page components in [client/src/pages/](client/src/pages/) with optional admin/user subfolders
- Shared components in [client/src/components/](client/src/components/)
- Use Tailwind classes directly (no CSS modules)
- Forms use react-hook-form with Zod validation

## Backend (Node.js) Conventions

### Project Structure
- Routes auto-loaded in [server.js](server/server.js) via `readdirSync('./routes')`
- Controllers per domain: [product.js](server/controllers/product.js), [auth.js](server/controllers/auth.js), [admin.js](server/controllers/admin.js), etc.
- Port: 5001 (hardcoded in server.js)

### Authentication Middleware
- [authCheck.js](server/middlewares/authCheck.js): Verifies JWT, decodes to `req.user`
- Validates user account is enabled (`user.enable === true`)
- Routes requiring auth use `authCheck` middleware; admin routes also use `adminCheck`

### Database (Prisma)
- Schema in [server/prisma/schema.prisma](server/prisma/schema.prisma) with Thai comments
- Models: User, Product, Category, SubCategory, Order, Cart, Address, AdminLog, ProductPriceHistory
- Product stores specs as JSON in `description` field
- Orders track payment status and tracking number

### API Response Pattern
- Success: `{ success: true, payload: data, token: jwt }` for auth
- List/read: `{ data: [...] }` from controllers
- Errors: `{ message: "error description" }` with appropriate status code

### Key Dependencies
- **bcryptjs**: Hash passwords (rounds: 10)
- **jsonwebtoken**: Sign JWTs with `process.env.SECRET`
- **nodemailer**: Send password reset emails
- **stripe**: Payment processing
- **cloudinary**: Image uploads
- **morgan**: HTTP logging (dev mode)

## Developer Workflows

### Setup & Running
- **Client**: `cd client && npm install && npm run dev` (Vite dev server on localhost:5173)
- **Server**: `cd server && npm install && npm start` (nodemon watches changes, runs on port 5001)
- **Database**: Requires `DATABASE_URL` env var; use `npx prisma db push` to sync schema

### Building for Production
- Client: `npm run build` → outputs to `dist/`
- Server: Use `pm2` config in [server/pm2](server/pm2) for process management
- Deployment likely on `ecom-aichatbot.shop` (see API URLs)

### Debugging Tips
- Check token expiry in App.jsx (auto-logout after `exp` timestamp)
- Admin routes validate `role === "admin"` in controller
- Cloudinary uploads require `CLOUDINARY_*` env vars
- Stripe tests use test API keys in `.env`

## Project-Specific Patterns

### Admin Logs & Price History
- AdminLog tracks all admin changes (create/update/delete products)
- ProductPriceHistory records price changes with user who changed it
- Both linked to User and Product models for audit trail

### Address Model (Recent Addition)
- Users have multiple addresses with `isMain` flag for primary shipping address
- Includes province, district, subDistrict, zipcode (Thai address format)
- Used during checkout for order fulfillment

### Cart Management
- Cart items in frontend stored in Zustand; synced to DB on checkout
- ProductOnCart model in DB links Product + User with quantity
- Checkout controller converts cart to Order + ProductOnOrder records

### Password Reset Flow
- User requests reset → Nodemailer sends token to email
- Token hashed and stored in User model with expiration
- Reset endpoint validates token and updates password

## Testing & Validation
- No automated tests found; manual testing recommended
- Frontend form validation via react-hook-form + Zod
- Backend validation via express-validator (in package.json but not widely used)
- Rate limiting via express-rate-limit middleware (configured in package.json)
