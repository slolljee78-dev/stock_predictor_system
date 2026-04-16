# Stock Predictor Developer Guide

## Project Overview

Stock Predictor is a full-stack web application built with React, TypeScript, Express, tRPC, and MySQL. It provides AI-powered trading signals for Trading 212 stocks with a premium user interface and comprehensive backend services.

**Tech Stack:**
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS 4
- **Backend**: Node.js + Express 4 + tRPC 11
- **Database**: MySQL (via TiDB)
- **Authentication**: Manus OAuth
- **Styling**: Tailwind CSS with custom design tokens
- **Testing**: Vitest (147 tests, 100% passing)

---

## Project Structure

```
stock_predictor_system/
├── client/                          # React frontend
│   ├── src/
│   │   ├── pages/                  # Page components
│   │   │   ├── Home.tsx            # Landing page
│   │   │   ├── Dashboard.tsx       # User dashboard
│   │   │   ├── StockDetail.tsx     # Stock analysis page
│   │   │   ├── Pricing.tsx         # Pricing page
│   │   │   ├── TradingSimulator.tsx # Simulator
│   │   │   ├── ValidationSetup.tsx # Validation setup
│   │   │   └── ValidationDashboard.tsx # Validation results
│   │   ├── components/             # Reusable components
│   │   │   ├── DashboardLayout.tsx # Authenticated layout
│   │   │   ├── AppInstallPrompt.tsx # PWA install
│   │   │   └── ui/                 # shadcn/ui components
│   │   ├── contexts/               # React contexts
│   │   │   └── ThemeContext.tsx    # Dark/light theme
│   │   ├── hooks/                  # Custom hooks
│   │   ├── lib/
│   │   │   └── trpc.ts            # tRPC client
│   │   ├── App.tsx                 # Route definitions
│   │   ├── main.tsx                # Entry point
│   │   └── index.css               # Global styles
│   ├── public/                      # Static assets
│   │   ├── sw.js                   # Service worker
│   │   ├── manifest.json           # PWA manifest
│   │   └── favicon.ico
│   └── index.html                   # HTML template
├── server/                          # Node.js backend
│   ├── _core/                       # Framework code
│   │   ├── index.ts                # Server entry point
│   │   ├── context.ts              # tRPC context
│   │   ├── vite.ts                 # Vite middleware
│   │   ├── oauth.ts                # OAuth handling
│   │   ├── llm.ts                  # LLM integration
│   │   ├── notification.ts         # Notifications
│   │   ├── voiceTranscription.ts   # Voice API
│   │   ├── imageGeneration.ts      # Image generation
│   │   ├── map.ts                  # Maps API
│   │   └── env.ts                  # Environment config
│   ├── routers.ts                   # tRPC procedures
│   ├── db.ts                        # Database helpers
│   ├── auth.logout.test.ts          # Auth tests
│   ├── simulatorEngine.test.ts      # Simulator tests
│   ├── indicators.test.ts           # Indicator tests
│   └── [other test files]
├── drizzle/                         # Database schema
│   ├── schema.ts                    # Table definitions
│   └── migrations/                  # SQL migrations
├── shared/                          # Shared code
│   ├── const.ts                     # Constants
│   └── types.ts                     # Shared types
├── storage/                         # S3 helpers
│   └── index.ts                     # File storage
├── vite.config.ts                   # Vite configuration
├── tailwind.config.ts               # Tailwind config
├── tsconfig.json                    # TypeScript config
├── package.json                     # Dependencies
├── pnpm-lock.yaml                   # Dependency lock
└── todo.md                          # Project tracking
```

---

## Getting Started

### Prerequisites

- Node.js 22.13.0+
- pnpm 10.4.1+
- MySQL/TiDB database
- Manus account with OAuth credentials

### Installation

1. **Clone the repository:**
   ```bash
   cd /home/ubuntu/stock_predictor_system
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   # Environment variables are automatically injected by Manus platform
   # Key variables:
   # - DATABASE_URL: MySQL connection string
   # - JWT_SECRET: Session signing secret
   # - VITE_APP_ID: OAuth application ID
   # - OAUTH_SERVER_URL: OAuth backend URL
   ```

4. **Run the development server:**
   ```bash
   pnpm dev
   ```

5. **Run tests:**
   ```bash
   pnpm test
   ```

---

## Development Workflow

### Adding a New Feature

1. **Update the database schema** (if needed):
   ```typescript
   // drizzle/schema.ts
   export const newTable = mysqlTable('new_table', {
     id: int().primaryKey().autoincrement(),
     name: varchar({ length: 255 }).notNull(),
     createdAt: timestamp().defaultNow(),
   });
   ```

2. **Generate migration:**
   ```bash
   pnpm drizzle-kit generate
   ```

3. **Apply migration:**
   - Read the generated SQL file
   - Apply via `webdev_execute_sql` tool (Manus platform)

4. **Add database helpers** (if needed):
   ```typescript
   // server/db.ts
   export async function getNewItems() {
     return db.select().from(newTable);
   }
   ```

5. **Add tRPC procedure:**
   ```typescript
   // server/routers.ts
   export const appRouter = router({
     newFeature: router({
       list: publicProcedure.query(async () => {
         return db.getNewItems();
       }),
       add: protectedProcedure
         .input(z.object({ name: z.string() }))
         .mutation(async ({ input, ctx }) => {
           // Implementation
         }),
     }),
   });
   ```

6. **Add frontend component:**
   ```typescript
   // client/src/pages/NewFeature.tsx
   export default function NewFeature() {
     const { data, isLoading } = trpc.newFeature.list.useQuery();
     const mutation = trpc.newFeature.add.useMutation();
     
     return (
       <DashboardLayout>
         {/* Component JSX */}
       </DashboardLayout>
     );
   }
   ```

7. **Add route:**
   ```typescript
   // client/src/App.tsx
   <Route path="/new-feature" component={NewFeature} />
   ```

8. **Write tests:**
   ```typescript
   // server/newFeature.test.ts
   describe('newFeature', () => {
     it('should list items', async () => {
       const result = await caller.newFeature.list();
       expect(result).toHaveLength(0);
     });
   });
   ```

9. **Run tests:**
   ```bash
   pnpm test
   ```

---

## Key Architecture Patterns

### tRPC Procedures

All backend logic is exposed through tRPC procedures. Procedures are organized by feature:

```typescript
// Public procedure (no auth required)
publicProcedure.query(async () => {
  return data;
});

// Protected procedure (requires authentication)
protectedProcedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ input, ctx }) => {
    // ctx.user is available here
    return result;
  });
```

### Frontend Data Fetching

Use tRPC hooks for all data operations:

```typescript
// Query (read data)
const { data, isLoading, error } = trpc.stocks.list.useQuery();

// Mutation (write data)
const mutation = trpc.stocks.add.useMutation({
  onSuccess: async () => {
    // Invalidate related queries
    await utils.stocks.list.invalidate();
  },
});

// Call mutation
await mutation.mutateAsync({ ticker: 'AAPL' });
```

### Component Structure

All pages follow a consistent pattern:

```typescript
export default function PageName() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Data fetching
  const query = trpc.feature.useQuery();
  
  // Event handlers
  const handleAction = () => {
    // Implementation
  };
  
  // Render
  return (
    <DashboardLayout>
      {/* Content */}
    </DashboardLayout>
  );
}
```

---

## Design System

### Color Palette

The application uses a dark theme with cyan/blue accents:

```css
/* Dark background */
--background: #0a0a0f
--foreground: #f5f5f7

/* Primary accent (cyan/blue) */
--primary: #0ea5e9
--primary-foreground: #000000

/* Secondary colors */
--secondary: #6b7280
--accent: #06b6d4
```

### Typography

- **Display titles**: 7xl-8xl, font-semibold
- **Section titles**: 2xl-3xl, font-semibold
- **Body text**: base, text-muted-foreground
- **Labels**: sm, uppercase, tracking-wide

### Component Classes

Common utility classes for consistent styling:

```typescript
// Card styling
className="premium-card"  // Dashed border, gradient background

// Buttons
className="pill-button pill-button-primary"  // Rounded button

// Text effects
className="gradient-text"  // Cyan to blue gradient

// Spacing
className="space-y-8"  // Vertical spacing

// Eyebrow labels
className="eyebrow"  // Small uppercase label
```

---

## Database Schema

### Key Tables

**users**
- id: Primary key
- openId: OAuth identifier
- email: User email
- name: Display name
- role: 'user' or 'admin'
- subscriptionTier: 'free', 'starter', 'pro', 'elite'

**stocks**
- id: Primary key
- ticker: Stock symbol (e.g., 'AAPL')
- name: Company name
- exchange: Exchange code
- lastPrice: Current price
- lastUpdated: Timestamp

**watchlist**
- id: Primary key
- userId: Foreign key to users
- stockId: Foreign key to stocks
- ticker: Stock ticker (for quick lookup)
- label: Custom label (optional)

**signals**
- id: Primary key
- stockId: Foreign key to stocks
- type: 'buy' or 'sell'
- confidenceScore: 0-100
- indicators: JSON with technical analysis
- createdAt: Signal generation time

**portfolios** (Simulator)
- id: Primary key
- userId: Foreign key to users
- name: Portfolio name
- initialCapital: Starting amount
- currentValue: Current portfolio value
- status: 'active' or 'closed'

---

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test -- server/auth.logout.test.ts

# Run with coverage
pnpm test -- --coverage
```

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';

describe('feature.action', () => {
  it('should perform action', async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.feature.action();
    expect(result).toBeDefined();
  });
});
```

### Test Coverage

- **147 tests** passing (100% success rate)
- **0 TypeScript errors**
- Core features: signals, watchlist, simulator, validation
- Helper functions: indicators, sentiment analysis, patterns

---

## Deployment

### Build for Production

```bash
pnpm build
```

This creates:
- `dist/public/` - Compiled frontend
- `dist/index.js` - Compiled backend

### Environment Variables

All environment variables are automatically injected by the Manus platform:

- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Session signing secret
- `VITE_APP_ID` - OAuth application ID
- `OAUTH_SERVER_URL` - OAuth backend URL
- `BUILT_IN_FORGE_API_URL` - Manus API endpoint
- `BUILT_IN_FORGE_API_KEY` - Manus API key
- `STRIPE_SECRET_KEY` - Stripe API key (for payments)

### Monitoring

The application logs are available in `.manus-logs/`:
- `devserver.log` - Server startup and runtime logs
- `browserConsole.log` - Client-side errors
- `networkRequests.log` - HTTP requests
- `sessionReplay.log` - User interactions

---

## Common Tasks

### Adding a New Stock Indicator

1. Add calculation function in `server/indicators.ts`
2. Add tests in `server/indicators.test.ts`
3. Update signal generation to use new indicator
4. Test with real data

### Creating a New Page

1. Create component in `client/src/pages/PageName.tsx`
2. Add route in `client/src/App.tsx`
3. Add navigation link in `DashboardLayout.tsx`
4. Style with premium classes
5. Test on desktop and mobile

### Updating the Database Schema

1. Edit `drizzle/schema.ts`
2. Run `pnpm drizzle-kit generate`
3. Review generated SQL migration
4. Apply via `webdev_execute_sql` tool
5. Update database helpers in `server/db.ts`
6. Update tRPC procedures

---

## Troubleshooting

### Vite WebSocket Error

**Issue**: "[vite] failed to connect to websocket" in browser console

**Solution**: This is a known issue with the Manus platform's debug collector. The error is suppressed in `client/index.html` and doesn't affect functionality.

### Tests Failing

**Solution**:
1. Clear node_modules: `rm -rf node_modules && pnpm install`
2. Clear build cache: `rm -rf dist`
3. Run tests again: `pnpm test`

### Database Connection Issues

**Solution**:
1. Verify `DATABASE_URL` is set correctly
2. Check database credentials
3. Ensure SSL is enabled (required for TiDB)
4. Check firewall rules

---

## Performance Optimization

### Frontend

- Use React.memo for expensive components
- Implement code splitting with dynamic imports
- Optimize images with WebP format
- Cache API responses with tRPC

### Backend

- Use database indexes on frequently queried columns
- Implement query caching for signals
- Batch process stock updates
- Use connection pooling

---

## Security

### Authentication

- All protected procedures require `ctx.user`
- OAuth tokens are validated on each request
- Session cookies are secure and httpOnly

### Data Protection

- User data is encrypted at rest
- API calls use HTTPS
- SQL injection prevented with parameterized queries
- XSS protection via React's built-in escaping

### Secrets Management

- All secrets are stored in environment variables
- Never commit `.env` files
- Use `webdev_request_secrets` tool for sensitive data

---

## Contributing

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Format with Prettier: `pnpm format`
- Write tests for new features

### Commit Messages

- Use descriptive commit messages
- Reference issue numbers when applicable
- Keep commits atomic and focused

### Pull Request Process

1. Create a feature branch
2. Make changes and write tests
3. Ensure all tests pass
4. Submit pull request with description
5. Address review feedback
6. Merge when approved

---

## Resources

- **React Documentation**: https://react.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **tRPC Documentation**: https://trpc.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Drizzle ORM**: https://orm.drizzle.team/docs

---

## Support

For questions or issues:
1. Check this guide and project README
2. Review existing GitHub issues
3. Contact the development team
4. Submit a bug report with reproduction steps

---

**Last Updated**: April 2026  
**Version**: 1.0.0  
**Status**: Production Ready
