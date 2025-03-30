Overview
This project is a full-stack application designed for house rentals. It provides a seamless platform for users to browse, book, and manage rental properties with secure user authentication and dynamic property listings.

Tech Stack:
Frontend: React

Backend: Node.js, Express

Database: MongoDB

Authentication: JSON Web Tokens (JWT

Features:
User Authentication: Securely log in and manage user accounts.
Property Listings: Browse detailed property listings including images, descriptions, and pricing.
Booking System: Book rental properties directly through the platform.
Secure Sessions: Ensure secure access with JWT for protected interactions.
Data Management: Efficiently store and manage user and property data using MongoDB.


```
house-rental-system
├─ api
│  ├─ index.js
│  ├─ models
│  │  ├─ Booking.js
│  │  ├─ Image.js
│  │  ├─ Place.js
│  │  ├─ Review.js
│  │  └─ User.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ tmp
│  └─ yarn.lock
├─ client
│  ├─ .env
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.cjs
│  ├─ public
│  │  └─ vite.svg
│  ├─ src
│  │  ├─ AccountNav.jsx
│  │  ├─ AddressLink.jsx
│  │  ├─ App.css
│  │  ├─ App.jsx
│  │  ├─ assets
│  │  │  └─ react.svg
│  │  ├─ BookingDates.jsx
│  │  ├─ BookingWidget.jsx
│  │  ├─ Header.jsx
│  │  ├─ Image.jsx
│  │  ├─ index.css
│  │  ├─ Layout.jsx
│  │  ├─ main.jsx
│  │  ├─ pages
│  │  │  ├─ BookingPage.jsx
│  │  │  ├─ BookingsPage.jsx
│  │  │  ├─ IndexPage.jsx
│  │  │  ├─ LoginPage.jsx
│  │  │  ├─ PlacePage.jsx
│  │  │  ├─ PlacesFormPage.jsx
│  │  │  ├─ PlacesPage.jsx
│  │  │  ├─ ProfilePage.jsx
│  │  │  └─ RegisterPage.jsx
│  │  ├─ PaymentForm.jsx
│  │  ├─ Perks.jsx
│  │  ├─ PhotosUploader.jsx
│  │  ├─ PlaceGallery.jsx
│  │  ├─ PlaceImg.jsx
│  │  ├─ PropertyMap.jsx
│  │  ├─ Ratings.jsx
│  │  ├─ Reviews.jsx
│  │  ├─ StarRating.jsx
│  │  ├─ ToastContext.jsx
│  │  └─ UserContext.jsx
│  ├─ tailwind.config.cjs
│  ├─ vite.config.js
│  └─ yarn.lock
├─ package-lock.json
├─ package.json
├─ README.md
├─ vercel.json
└─ yarn.lock

```
