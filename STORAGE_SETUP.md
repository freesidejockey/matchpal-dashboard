# Fix: 404 Bucket Not Found

You're getting a 404 because the storage bucket and/or policies aren't set up correctly. Follow these steps:

## Step 1: Create the Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **Storage** in the left sidebar
4. Click **New Bucket**
5. Fill in:
   - **Name**: `session_uploads`
   - **Public bucket**: Toggle **OFF** (keep it private)
   - **Allowed MIME types**: Leave empty
   - **File size limit**: 10MB (or your preference)
6. Click **Create bucket**

## Step 2: Set Storage Policies

After creating the bucket, you MUST set up policies or you'll get 404/403 errors.

### Go to Storage → Policies

Click on the `session_uploads` bucket, then click "Policies" tab.

### Add these 3 policies:

#### Policy 1: Allow Upload
```sql
CREATE POLICY "Authenticated users can upload session files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'session_uploads');
```

#### Policy 2: Allow Read (IMPORTANT!)
```sql
CREATE POLICY "Authenticated users can read session files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'session_uploads');
```

#### Policy 3: Allow Delete
```sql
CREATE POLICY "Authenticated users can delete session files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'session_uploads');
```

## Step 3: Verify Setup

After setting up, test by:
1. Upload a file through your app
2. Click the file count in the table
3. Click "Download" - it should work now!

## Troubleshooting

### Still getting 404?
- **Check bucket name**: Must be exactly `session_uploads`
- **Check policies**: Make sure all 3 policies are created
- **Check user is logged in**: Only authenticated users can access

### Getting 403 Forbidden?
- Policies aren't set correctly
- User isn't authenticated
- Bucket is set to private but policies don't allow read

### Files won't upload?
- Check the INSERT policy is created
- Check file size isn't over the bucket limit
- Check file type is allowed (PDF, Word, Excel, Text)

## Why Did This Happen?

Your bucket is **private**, which is good for security, but requires:
1. **Signed URLs**: We generate temporary URLs (valid 1 hour) on-demand
2. **Storage Policies**: Control who can upload/read/delete files

The `publicUrl` you saw before was actually a signed URL that expired after 7 days. Now we generate fresh signed URLs every time you download.
