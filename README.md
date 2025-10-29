# Hotel Management System Frontend

Modern hotel booking interface built with **Next.js 14 (App Router)**, **TypeScript**, **TailwindCSS**, and **shadcn/ui**. The app connects to a backend at `http://localhost:5000/api` to manage hotels, bookings, and authentication via JWT stored in HTTP-only cookies.

## Features

- App Router layout with shared `Navbar` and `Footer`
- Home page search with server-side hotel fetching
- Hotel detail view with amenities and responsive booking form
- Bookings dashboard for logged-in guests
- Authentication pages (login/register) wired to backend endpoints
- Admin dashboard cards with booking, revenue, and occupancy stats
- Reusable UI components using shadcn patterns, lucide icons, framer-motion animations, and Tailwind styling
- Axios API layer with typed responses and example GET/POST calls
- Shared TypeScript types in `src/lib/types.ts`

## Getting Started

```powershell
npm install
npm run dev
```

The development server runs on [http://localhost:3000](http://localhost:3000). Create a `.env.local` if you need to override `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:5000/api`).

## Project Structure

```
src/
  app/
    (auth)/       # Login & register routes
    admin/        # Admin dashboard
    bookings/     # User bookings page
    hotels/       # Dynamic hotel detail routes
    globals.css   # Tailwind layers & design tokens
    layout.tsx    # Root layout with Navbar/Footer
    page.tsx      # Home page (hotel grid + search)
  components/
    ui/           # shadcn-style primitives (Button, Card, etc.)
    Navbar.tsx    # Sticky navigation bar
    Footer.tsx    # Global footer
    HotelCard.tsx # Hotel cards with motion animations
    BookingForm.tsx
    AuthForm.tsx
    DateRangePicker.tsx
  lib/
    api.ts        # Axios instance and example API helpers
    auth.ts       # Session helpers (cookies + /auth/me)
    types.ts      # Shared domain types
    utils.ts      # Tailwind class utilities
```

## Backend Integration Notes

- Axios is configured with `withCredentials: true`, allowing the API to issue HTTP-only cookies for JWT tokens.
- The optional server actions in `src/app/(auth)/actions.ts` demonstrate how to set the cookie manually if your backend returns the raw token in the response body.
- Update the `AUTH_COOKIE` constant if your backend uses a different cookie name.

## UI/UX

- Tailwind theme extends pastel color palette with soft shadows and rounded cards.
- Components leverage shadcn/ui patterns for consistency, with lucide-react icons and framer-motion animations for interaction polish.
- `DateRangePicker` wraps `react-day-picker` for intuitive booking date selection.

## Next Steps

- Gate `/bookings` and `/admin/dashboard` with middleware or server-side session checks.
- Replace placeholder images with actual hotel media.
- Expand admin analytics (charts, recent bookings) and add mutation flows for room management.
- Wire up logout flow and profile menu in the navbar.
# hotel-management-system