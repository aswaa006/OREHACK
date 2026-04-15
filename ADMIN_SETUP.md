# Admin Authentication Setup

## Overview

The admin authentication system uses Supabase authentication with additional client-side encryption for enhanced security.

## Features

- SHA-256 password hashing before authentication
- Encrypted session storage in localStorage
- Automatic session expiration (24 hours)
- Protected routes with authentication checks
- Secure logout functionality

## Setup Instructions

### 1. Create Admin User in Supabase

You need to create an admin user in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Click "Add user"
4. Set email to: `admin@orehack.com`
5. Set password to the SHA-256 hash of your desired admin password

### 2. Generate Password Hash

To generate the SHA-256 hash for your password, you can use an online tool or run this JavaScript in the browser console:

```javascript
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Example: hashPassword('your-admin-password').then(console.log);
```

Use the resulting hash as the password when creating the user in Supabase.

### 3. Access Admin Panel

- Navigate to `/admin/auth`
- Enter your admin password (not the hash)
- The system will hash it client-side and authenticate with Supabase
- Upon successful login, you'll be redirected to `/admin/developer`

## Security Features

- **Client-side hashing**: Passwords are hashed with SHA-256 before transmission
- **Session encryption**: Session data is base64 encoded in localStorage
- **Session validation**: Sessions expire after 24 hours
- **Hash verification**: Additional verification using stored hash fragments
- **Automatic logout**: Invalid sessions are cleared automatically

## Routes

- `/admin/auth` - Admin login page
- `/admin/developer` - Protected developer admin dashboard (requires authentication)
