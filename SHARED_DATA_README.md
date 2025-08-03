# 🔄 Shared Data System

## Overview
The billing system now supports **shared data** between all users who access the website. Everyone can see the same sites, tenants, and billing records.

## ✅ **How It Works:**

### **1. Real-Time Sync:**
- **Every 3 seconds**: Data syncs between all users
- **API + localStorage**: Uses server API with localStorage fallback
- **Automatic merging**: New data from any user is merged automatically

### **2. What Gets Shared:**
✅ **Sites**: All apartment sites (Laguna, Pidanna, etc.)
✅ **Tenants**: All tenant information and details
✅ **Billing Records**: All saved receipts and billing history
✅ **Real-time updates**: Changes appear for all users within 3 seconds

### **3. Visual Indicators:**
- **Green sync indicator**: Shows "Shared Data • Last sync: [time]"
- **Users icon**: Indicates data is being shared
- **Real-time updates**: See when data was last synchronized

### **4. Data Flow:**
```
User A adds site → Syncs to server → User B sees new site
User B adds tenant → Syncs to server → User A sees new tenant
User C saves receipt → Syncs to server → All users see new receipt
```

### **5. Privacy & Security:**
- **No user accounts**: Simple shared access
- **No personal data**: Only billing information is shared
- **Read-only access**: Users can view all data
- **Add/edit permissions**: Users can add new data

### **6. Technical Implementation:**
- **API Route**: `/api/shared-data` for server-side storage
- **localStorage fallback**: Works even if API is unavailable
- **Automatic merging**: Prevents data conflicts
- **Error handling**: Graceful fallback to local storage

### **7. Benefits:**
✅ **Team collaboration**: Multiple people can manage billing
✅ **Centralized data**: All receipts in one place
✅ **Real-time updates**: Instant visibility of changes
✅ **No setup required**: Works immediately when deployed

### **8. Usage:**
1. **Add sites/tenants**: Available to all users immediately
2. **Save receipts**: All users can see billing history
3. **View history**: Complete shared transaction history
4. **Export data**: All users can export any receipt

## 🚀 **Deployment:**
- **Vercel**: Automatically includes API routes
- **Shared hosting**: Works on any Next.js hosting
- **No database**: Uses simple file-based storage
- **Zero configuration**: Deploy and start sharing

## 📊 **Data Persistence:**
- **Server storage**: Data persists across deployments
- **Backup friendly**: Simple JSON data structure
- **Export capability**: Easy to backup all data
- **Version control**: Can track data changes

Now when multiple people use the website, they'll all see the same data and can collaborate on billing management! 