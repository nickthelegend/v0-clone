# Authentication & Subscription Setup Guide

## 🚀 Quick Setup

### 1. Update Environment Variables

Add your Supabase credentials to `.env`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database (already configured)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

### 2. Push Database Schema

```bash
npm run db:push
```

This creates the tables in your Supabase PostgreSQL database.

### 3. Seed Pricing Plans

```bash
npm run db:seed
```

This creates 3 pricing plans:
- **Starter**: 500 tokens - $9
- **Pro**: 2000 tokens - $29 (Popular)
- **Enterprise**: 10000 tokens - $99

### 4. Start Development Server

```bash
npm run dev
```

## 📋 Features Implemented

### ✅ Authentication
- **Signup**: `/signup` - New users get 100 free tokens
- **Login**: `/login` - Email/password authentication
- **Logout**: From header dropdown

### ✅ Subscription System
- **Pricing Page**: `/pricing` - View and purchase token plans
- **Token Balance**: Displayed in header
- **Auto-add Tokens**: Click "Buy" → tokens instantly added (Stripe integration pending)

### ✅ Database Schema
- **Users**: Email, password (hashed), token balance
- **Plans**: Pricing tiers with token amounts
- **Purchases**: Transaction history

## 🎯 Token Usage (Sample Data)

### Free Tier
- New users: **100 tokens** on signup

### Pricing Plans
| Plan | Tokens | Price |
|------|--------|-------|
| Starter | 500 | $9 |
| Pro | 2,000 | $29 |
| Enterprise | 10,000 | $99 |

### Token Consumption (To be implemented)
- Simple chat: 10 tokens
- Code generation: 50 tokens
- File operations: 20 tokens

## 🔧 Next Steps

### TODO: Integrate Token Deduction in Chat API

Update `app/api/chat/route.ts` to deduct tokens:

```typescript
// Check user has tokens
const user = await prisma.user.findUnique({ where: { id: userId } })
if (user.tokens < 10) {
  return NextResponse.json({ error: 'Insufficient tokens' }, { status: 402 })
}

// Deduct tokens after successful response
await prisma.user.update({
  where: { id: userId },
  data: { tokens: { decrement: 10 } }
})
```

### TODO: Add Stripe Payment Integration

Replace auto-add in `/api/pricing` POST with:
1. Create Stripe checkout session
2. Redirect to Stripe payment page
3. Handle webhook for successful payment
4. Add tokens after payment confirmation

## 📁 New Files Created

```
prisma/
├── schema.prisma          # Database schema
└── seed.ts               # Seed data script

lib/
├── prisma.ts             # Prisma client
└── supabase.ts           # Supabase client

app/
├── login/page.tsx        # Login page
├── signup/page.tsx       # Signup page
├── pricing/page.tsx      # Pricing plans page
└── api/
    ├── auth/
    │   ├── signup/route.ts
    │   └── login/route.ts
    ├── pricing/route.ts  # Get plans & purchase
    └── user/route.ts     # Get user data
```

## 🔐 Security Notes

- Passwords are hashed with bcrypt
- User data stored in localStorage (consider JWT tokens for production)
- Database credentials in `.env` (never commit!)
- Supabase RLS (Row Level Security) should be configured

## 🎨 UI Components Used

- Radix UI components (Button, Input, Label)
- Tailwind CSS for styling
- Lucide icons (Coins, User, LogOut)

## 📊 Database Commands

```bash
# Push schema changes
npm run db:push

# Seed database
npm run db:seed

# Open Prisma Studio (GUI)
npm run db:studio
```

## 🐛 Troubleshooting

### "User not found" error
- Make sure you've run `npm run db:push`
- Check database connection in `.env`

### Tokens not updating
- Check browser console for API errors
- Verify user is logged in (check localStorage)

### Plans not showing
- Run `npm run db:seed` to create plans
- Check `/api/pricing` endpoint

---

**Ready to test!** 🎉

1. Go to `/signup` and create an account (get 100 free tokens)
2. Visit `/pricing` to see plans
3. Click "Buy Now" to add tokens instantly
4. Check header to see updated token balance
