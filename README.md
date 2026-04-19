# Johnrick Auto Supply - Frontend

Modern e-commerce frontend for Johnrick Auto Supply built with HTML, CSS, JavaScript, Bootstrap 5, and jQuery.

## 🚀 New Features Added (v2.0.0)

### ✅ Landing Page Carousel
- Auto-rotating image carousel with 3 slides
- Fully customizable images and captions
- Smooth transitions with Bootstrap 5

### ✅ Unified Login System
- Single login modal for both customers and admin
- Toggle between Customer and Admin login
- No separate admin login page needed
- Admin link removed from footer

### ✅ Admin Dashboard Enhancements
- **Logout button** added to navbar
- **Reviews tab** - View and manage customer reviews
- **Inquiries tab** - Handle customer messages and support tickets
- Admin username displayed in navbar

### ✅ Contact Us Page
- Professional contact form
- Subject selection dropdown
- Success/error feedback
- Contact information display
- FAQ section

## 📁 Project Structure

```
johnrick-frontend/
├── index.html          # Landing page with carousel
├── admin.html          # Admin dashboard (with Reviews & Inquiries tabs)
├── cart.html           # Shopping cart
├── profile.html        # Customer profile
├── contact.html        # ✨ NEW - Contact us page
├── login.html          # Legacy admin login (can be removed)
├── terms.html          # Terms & conditions
├── js.js               # Main JavaScript file
├── css.css             # Custom styles
├── images/             # Image assets
│   ├── logo.png
│   └── banner.jpg
└── vercel.json         # Vercel deployment config
```

## 🎨 Key Pages

### Landing Page (index.html)
- **Image Carousel** - 3 rotating hero images
- Shop by Manufacturer section
- Featured products
- Newsletter signup
- Footer with quick links (Admin link removed)

### Admin Dashboard (admin.html)
- **Products Tab** - Manage inventory
- **Categories Tab** - Manage product categories
- **Orders Tab** - Process and track orders
- **Customers Tab** - View customer data
- **🆕 Reviews Tab** - Moderate customer reviews
- **🆕 Inquiries Tab** - Respond to customer messages
- **Logout Button** - Secure logout functionality

### Contact Page (contact.html)
- Contact form with validation
- Multiple subject options
- Company contact information
- Business hours display
- FAQ section

## 🔧 Configuration

### API URL Setup

Edit the API_URL in `js.js`:

```javascript
// For local development
const API_URL = 'http://localhost:3000/api';

// For production (Railway backend)
const API_URL = 'https://your-backend.up.railway.app/api';
```

## 🌐 Deployment to Vercel

### Option 1: Vercel CLI

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Follow prompts:**
- Select project settings
- Confirm deployment

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Click "Deploy"

### Option 3: Drag & Drop

1. Go to [vercel.com](https://vercel.com)
2. Drag your project folder onto the upload area
3. Wait for deployment

## 🎯 How to Use New Features

### Carousel Customization

Edit `index.html` carousel section:

```html
<div class="carousel-item active">
  <img src="YOUR_IMAGE_URL" class="d-block w-100" alt="Description">
  <div class="carousel-caption">
    <h2>Your Heading</h2>
    <p>Your description</p>
  </div>
</div>
```

### Admin Login

1. Go to the website
2. Click "Login" in navbar
3. Select "Admin" tab
4. Enter credentials:
   - Username: `admin`
   - Password: `admin`

### Customer Using Contact Form

1. Click "Contact Us" in footer
2. Fill out the form
3. Select appropriate subject
4. Submit message
5. Admin will see it in Inquiries tab

## 🔐 Default Credentials

**Admin Login:**
- Username: `admin`
- Password: `admin`

**⚠️ Change these in production!**

## 📱 Responsive Design

- Mobile-first approach
- Bootstrap 5 responsive grid
- Touch-friendly navigation
- Optimized for all screen sizes

## 🛠️ Dependencies

All dependencies are loaded via CDN:
- Bootstrap 5.3.0
- jQuery 3.6.0
- Font Awesome 6.4.0

No build process required!

## 🎨 Customization

### Change Colors

Edit `css.css` or inline styles:
- Primary color: `#d60000` (red)
- Dark background: `#1a1a1a`
- Success: `#28a745`

### Add More Carousel Slides

1. Duplicate a carousel-item div
2. Update the image src
3. Update carousel-indicators count

### Modify Footer Links

Edit footer section in each HTML file to update:
- Quick links
- Social media links
- Contact information

## 📞 Support & Maintenance

### Common Tasks

**Update API URL:**
- Edit `js.js` → Change `API_URL` constant

**Add New Pages:**
1. Create new HTML file
2. Include navbar/footer from existing pages
3. Link to it from navigation

**Modify Admin Tabs:**
- Edit `admin.html` tabs section
- Add corresponding JavaScript functions

## 🐛 Troubleshooting

**Carousel not working:**
- Check Bootstrap JS is loaded
- Verify carousel HTML structure

**Admin can't login:**
- Check API_URL points to correct backend
- Verify backend is running
- Check network tab in browser DevTools

**Forms not submitting:**
- Check API endpoints in js.js
- Verify CORS is enabled on backend
- Check browser console for errors

## 📊 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## ✅ Production Checklist

Before going live:
- [ ] Update API_URL to production backend
- [ ] Change default admin password
- [ ] Test all forms and links
- [ ] Verify carousel images load
- [ ] Test on mobile devices
- [ ] Check all pages are linked correctly
- [ ] Update contact information
- [ ] Test login/logout flows

---
**Version:** 2.0.0  
**Last Updated:** April 2026  
**Framework:** Vanilla JS + Bootstrap 5  
**Deployment:** Vercel
