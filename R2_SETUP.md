# Cloudflare R2 Setup Guide

This guide will help you set up Cloudflare R2 for image uploads in the Vetted Trainers app.

## Prerequisites

- A Cloudflare account (free tier works)
- Access to your Cloudflare dashboard

## Step 1: Create an R2 Bucket

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click on **R2** in the left sidebar
3. Click **Create bucket**
4. Name it `vetted-trainers-uploads` (or whatever you prefer)
5. Click **Create bucket**

## Step 2: Create API Tokens

1. In R2, click **Manage R2 API tokens** (or go to **Overview → Manage API tokens**)
2. Click **Create API token**
3. Give it a name like "Vetted Trainers App"
4. Under **Permissions**, select:
   - **Object Read & Write** for your bucket
5. Click **Create API Token**
6. **IMPORTANT**: Copy the following values immediately (they won't be shown again):
   - **Access Key ID**
   - **Secret Access Key**
   - **Account ID** (shown at the top)

## Step 3: Enable Public Access

1. Go back to your bucket (`vetted-trainers-uploads`)
2. Click **Settings**
3. Under **Public access**, click **Allow Access**
4. Enable the **R2.dev subdomain** option
5. Copy the **Public bucket URL** (looks like `https://pub-abc123xyz789.r2.dev`)

## Step 4: Configure Environment Variables

Add the following to your `.env` file (in the monorepo root and `apps/admin/.env`):

```bash
# Cloudflare R2 Storage
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key-id"
R2_SECRET_ACCESS_KEY="your-secret-access-key"
R2_BUCKET_NAME="vetted-trainers-uploads"
R2_PUBLIC_URL="https://pub-xxxxx.r2.dev"
```

### Example Values

```bash
R2_ACCOUNT_ID="a1b2c3d4e5f6g7h8"
R2_ACCESS_KEY_ID="abc123def456ghi789jkl012"
R2_SECRET_ACCESS_KEY="XyZ789SecretKeyHere123456"
R2_BUCKET_NAME="vetted-trainers-uploads"
R2_PUBLIC_URL="https://pub-12345abcdef67890.r2.dev"
```

## Step 5: Test the Upload

1. Restart your dev server: `pnpm dev`
2. Navigate to the website editor at `http://localhost:3000/website`
3. Click "Edit Page"
4. Try changing an image by clicking "Change Image" on any image section

## Troubleshooting

### "R2 storage is not configured" Error

Make sure all R2 environment variables are set correctly in both:
- `.env` (monorepo root)
- `apps/admin/.env`

### Upload succeeds but image doesn't display

1. Make sure you completed **Step 3** (Enable Public Access)
2. Verify `R2_PUBLIC_URL` is set correctly
3. The URL should look like `https://pub-xxxxx.r2.dev`

### Permission denied errors

Check that your API token has **Object Read & Write** permissions for your bucket.

## CORS Configuration (if needed)

If you encounter CORS issues, add this to your R2 bucket CORS settings:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://your-production-domain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

---

Once configured, the WYSIWYG image editor will upload images directly to R2 and display them via the public URL.
