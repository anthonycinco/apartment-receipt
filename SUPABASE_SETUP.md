# 🚀 Supabase Setup Guide

## **Step 1: Create Supabase Project**

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Create a new project:
   - **Name**: `cinco-apartments-billing`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
5. Wait for project to be created (2-3 minutes)

## **Step 2: Get Your Credentials**

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

## **Step 3: Set Environment Variables**

1. Create a `.env.local` file in your project root
2. Add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## **Step 4: Set Up Database Schema**

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase-schema.sql`
3. Paste and run the SQL commands
4. This will create:
   - `sites` table
   - `tenants` table  
   - `billing_records` table
   - Sample data

## **Step 5: Test the Connection**

1. Start your development server: `npm run dev`
2. Open your app in the browser
3. Check the browser console for any connection errors
4. If successful, you should see "Supabase connected successfully"

## **Step 6: Migrate Existing Data**

If you have existing data in localStorage:

1. Open your app
2. Go to the Management Panel
3. Look for a "Migrate to Supabase" button
4. Click to transfer your data
5. Verify data appears in Supabase dashboard

## **Step 7: Deploy to Vercel**

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel:
   - Go to **Settings** → **Environment Variables**
   - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## **Troubleshooting**

### **Connection Issues**
- Check your environment variables are correct
- Ensure your Supabase project is active
- Check browser console for error messages

### **Migration Issues**
- Verify your Supabase schema is set up correctly
- Check that all tables exist in your Supabase dashboard
- Look for console errors during migration

### **Real-time Issues**
- Ensure your Supabase project has real-time enabled
- Check that you're using the correct channel names

## **Next Steps**

Once Supabase is working:

1. **Remove localStorage fallback** - Update components to use Supabase only
2. **Add authentication** - Replace password system with Supabase Auth
3. **Add file storage** - Use Supabase Storage for receipt attachments
4. **Enable real-time** - All users see updates instantly
5. **Add backups** - Set up automatic database backups

## **Benefits You'll Get**

✅ **Real-time updates** - All users see changes instantly  
✅ **Better performance** - Faster data loading  
✅ **Data persistence** - No more lost data  
✅ **Scalability** - Handles multiple users easily  
✅ **Backup & recovery** - Automatic data protection  
✅ **Analytics** - Built-in database analytics  

## **Support**

If you need help:
1. Check the [Supabase documentation](https://supabase.com/docs)
2. Look at the browser console for error messages
3. Verify your environment variables are set correctly 