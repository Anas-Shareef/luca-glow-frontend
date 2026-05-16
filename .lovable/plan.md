
# Luca Cosmetics — Premium E-Commerce Site

A full-featured, Fabish-inspired cosmetics storefront for Luca Cosmetics with clean pastel aesthetics, mega-menu navigation, AJAX-style cart drawer, wishlist, quick view, and all brand content from Luca's World.

## Pages & Routes
- `/` — Homepage: hero slider, featured categories grid, trending carousel, brand values, "On The Gram" feed, newsletter
- `/collections/skin-care`, `/hair-care`, `/lip-care`, `/combos`, `/mens-grooming`, `/womens-skincare` — collection pages with grid/list toggle, filters (category, price slider, best sellers), sort dropdown, lazy-loaded product cards
- `/products/$slug` — Product detail page: gallery, variant selectors, price + strikethrough + sale badge, star rating, ingredient/benefit info, trust icons near Add to Cart, review section
- `/about` — Brand story, mission, three core values
- `/contact` — Contact info (Kasaragod address, phone) + form
- `/account` — Auth-gated dashboard: order history, address book, order tracking
- `/auth/login`, `/auth/register` — Auth flows
- `/wishlist` — Saved items (localStorage for guests)
- `/compare` — Side-by-side comparison table (up to 4 products)

## Global UI
- **Sticky header**: logo left, hover-triggered mega menu center (3-tier with promo banners inside dropdowns), icon cluster right (search, account, wishlist, cart with badge count), currency switcher (INR/USD/EUR), shrinks on scroll
- **Mobile**: hamburger → slide-out drawer with accordion submenus
- **Cart drawer**: right-side slide-in with overlay, real-time subtotal, free-shipping progress bar ("Add ₹X more for free shipping"), quantity steppers
- **Quick View modal**: triggered from product card hover
- **Toast notifications** via sonner
- **Footer**: 4 columns desktop / accordion mobile, newsletter signup with validation, social icons, policy links, copyright

## Brand & Design System
- Palette: white, soft cream/blush pastels, charcoal text, accent rose
- Typography: Montserrat/Futura-style display for "FEEL THE CHANGE", clean sans for body
- All copy from PRD: tagline, subhead, three values, exact product list with prices, Instagram handle, Kerala address
- Lifestyle imagery from Unsplash (cosmetics/skincare)

## Functionality
- Product catalog seeded with the 6 products + additional items per category
- Wishlist & cart state via Zustand (localStorage persistence)
- Filter/sort state with instant client-side updates (no reload)
- Product card: hover swap to secondary image, quick-view button, wishlist heart, sale badge auto-calculated from compare-at price, star rating
- Hero: auto-playing slider with dots, pause on hover, swipeable
- Trending: horizontal swipeable carousel
- Comparison tool: select up to 4, side-by-side table
- Newsletter: email validation with zod, success toast
- Currency switcher: client-side conversion display
- All routes have proper `head()` metadata (title, description, og tags) for SEO

## Out of Scope (mock/placeholder)
- Real auth backend, real payments, real Instagram API, real review submission, real email sending — UI shells with mock data; can be wired to Lovable Cloud in a follow-up
