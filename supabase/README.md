# Supabase setup for Smart Campus Lost & Found

## Fix: "Image upload failed: new row violates row-level security policy"

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. Ensure the **items-images** storage bucket exists:
   - Go to **Storage** in the sidebar.
   - If you don’t see an `items-images` bucket, click **New bucket**, name it `items-images`, and create it.
3. Apply the storage policies:
   - Go to **SQL Editor** → **New query**.
   - Open `supabase/migrations/20240314000000_storage_items_images_policies.sql` in this repo.
   - Copy its contents into the SQL editor and click **Run**.

After this, authenticated users can upload and read images in the `items-images` bucket, and the Report Lost / Report Found image upload should work.
