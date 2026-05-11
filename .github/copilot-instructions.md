# AnotherLevelDecants Project Instructions

## Project Overview
Professional e-commerce web application for luxury perfume decants. Built with Vite, vanilla JavaScript (ES6+), and JSON-based product management system.

## Project Structure
- **Frontend**: Vite + Vanilla JS (modular architecture)
- **Data**: JSON files for products and packs
- **Styling**: Pure CSS3 with mobile-first responsive design
- **No external dependencies**: Lightweight and secure

## Key Features
- Modular product management (easy to add/disable products)
- Stock management system
- Real-time cart updates
- WhatsApp checkout integration
- Pagination (6 items per page)
- Search and filter functionality
- Mobile responsive
- XSS protection via HTML escaping

## File Locations
- **Product Data**: `data/perfumes.json` - Edit to add/remove products or manage stock
- **Pack Data**: `data/packs.json` - Curated product bundles
- **Configuration**: `src/config.js` - WhatsApp number, items per page
- **Styles**: `src/styles/main.css` - All CSS (no external dependencies)
- **JS Modules**:
  - `src/modules/products.js` - Product management logic
  - `src/modules/cart.js` - Cart state and operations
  - `src/modules/ui.js` - UI rendering and updates
  - `src/utils/helpers.js` - Utility functions

## Development Commands
- `npm run dev` - Start dev server (auto-opens on port 3000)
- `npm run build` - Production build
- `npm run preview` - Preview production build locally

## Maintenance Guide

### Adding New Products
1. Open `data/perfumes.json`
2. Add new object with unique `id`
3. Set `inStock: true` to display
4. Save - changes reflect immediately in dev mode

### Disabling Products (Out of Stock)
Set `inStock: false` in `data/perfumes.json`

### Updating Pack Bundles
Edit `data/packs.json` - modify `items` array or set `inStock: false`

### Changing WhatsApp Number
Edit `src/config.js` - update `WHATSAPP_PHONE` constant

### Customizing Colors/Fonts
Edit `src/styles/main.css` - modify CSS variables in `:root`

## Important Notes
- All user input is escaped to prevent XSS attacks
- JSON data is public (don't store sensitive information)
- Prices are in EUR with comma format for display (€)
- Mobile breakpoint: 600px

## Build & Deploy
1. Run `npm run build`
2. Upload `dist/` folder to hosting (Netlify, Vercel, or traditional hosting)
3. Ensure web server serves `index.html` for all routes (SPA)

## Tech Stack
- **Bundler**: Vite 5.0+
- **Language**: JavaScript ES6+ (vanilla, no frameworks)
- **Styling**: CSS3 (no pre/post-processing)
- **Data**: JSON
- **Security**: XSS protection, no external dependencies

## Performance
- Fast builds with Vite
- Lightweight (~50KB minified)
- No runtime dependencies
- Mobile-optimized
