# 🚀 Quick Start - Subscription System

## Setup (5 minutes)

### 1. Add Supabase Keys to `.env`
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Run These Commands
```bash
npm run db:push    # Create database tables
npm run db:seed    # Add pricing plans
npm run dev        # Start server
```

## Test It Out

1. **Signup**: http://localhost:3000/signup
   - Create account → Get 100 free tokens

2. **Pricing**: http://localhost:3000/pricing
   - Click "Buy Now" → Tokens added instantly

3. **Check Balance**: Look at header (top right)

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/signup` | POST | Create account |
| `/api/auth/login` | POST | Login |
| `/api/pricing` | GET | Get plans |
| `/api/pricing` | POST | Purchase tokens |
| `/api/user` | GET | Get user data |

## Database Tables

- **users** - Email, password, tokens
- **plans** - Pricing tiers
- **purchases** - Transaction history

## Token Costs (Sample)

- Chat: 10 tokens
- Code gen: 50 tokens
- File ops: 20 tokens

## What Works Now

✅ Signup with 100 free tokens  
✅ Login/Logout  
✅ View pricing plans  
✅ Buy tokens (auto-add)  
✅ Token balance in header  

## What's Next

⏳ Stripe payment integration  
⏳ Token deduction in chat  
⏳ Protected routes  
⏳ User dashboard  

---

**Need help?** Check `SETUP_AUTH.md` for detailed guide.
