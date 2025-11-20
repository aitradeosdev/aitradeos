# MongoDB Media Storage Implementation

## Overview
Implemented MongoDB-based storage for blog images and logos to ensure they work on Vercel deployment (where filesystem storage is ephemeral).

## Changes Made

### 1. New Media Model
**File:** `api/models/Media.js`
- Stores images as base64 in MongoDB
- Fields: filename, mimetype, data (base64), size, type, uploadedBy
- Types: 'blog-image', 'logo'

### 2. New Media Route
**File:** `api/routes/media.js`
- Endpoint: `GET /api/media/:id`
- Serves images from MongoDB as binary data
- Sets proper Content-Type headers
- Adds caching headers for performance

### 3. Updated Blog Image Upload
**File:** `api/routes/blog.js`
- Changed from filesystem to MongoDB storage
- Images processed with Sharp (resize, optimize)
- Returns URL: `/api/media/{mediaId}`
- Supports both images and videos

### 4. Updated Logo Upload
**File:** `api/routes/admin.js`
- Changed from filesystem to MongoDB storage
- Logos processed with Sharp (trim, resize, PNG)
- Returns URL: `/api/media/{mediaId}`

### 5. Registered Media Routes
**File:** `api/index.js`
- Added: `app.use('/api/media', mediaRoutes);`

## How It Works

### Upload Flow
```
1. User uploads image
   ↓
2. Sharp processes image (resize, optimize)
   ↓
3. Convert to base64
   ↓
4. Save to MongoDB Media collection
   ↓
5. Return URL: /api/media/{mediaId}
```

### Retrieval Flow
```
1. Frontend requests: /api/media/{mediaId}
   ↓
2. Find media in MongoDB
   ↓
3. Convert base64 to Buffer
   ↓
4. Send with proper Content-Type
   ↓
5. Browser displays image
```

## API Endpoints

### Upload Blog Image
```http
POST /api/blog/admin/upload-media
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body: { media: File }

Response:
{
  "mediaUrl": "/api/media/507f1f77bcf86cd799439011",
  "type": "image"
}
```

### Upload Logo
```http
POST /api/admin/logos
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body: { logo: File }

Response:
{
  "logo": {
    "_id": "507f1f77bcf86cd799439011",
    "imageUrl": "/api/media/507f1f77bcf86cd799439011",
    "order": 0
  }
}
```

### Get Media
```http
GET /api/media/{mediaId}

Response: Binary image data
Headers:
  Content-Type: image/jpeg (or image/png)
  Content-Length: {size}
  Cache-Control: public, max-age=31536000
```

## Benefits

### ✅ Vercel Compatible
- No filesystem dependency
- Images persist across deployments
- Works on serverless platforms

### ✅ Centralized Storage
- All media in one database
- Easy backup and migration
- No orphaned files

### ✅ Performance
- Caching headers (1 year)
- Optimized with Sharp
- Compressed images

### ✅ Security
- Admin-only uploads
- File type validation
- Size limits enforced

## Database Schema

### Media Collection
```javascript
{
  _id: ObjectId,
  filename: String,
  mimetype: String,
  data: String (base64),
  size: Number,
  type: 'blog-image' | 'logo',
  uploadedBy: ObjectId (ref: User),
  createdAt: Date
}
```

## Image Processing

### Blog Images
- Resize: 1200x800 (cover fit)
- Format: JPEG
- Quality: 85%
- Max size: 100MB upload

### Logos
- Trim whitespace
- Resize: 800x200 (inside fit)
- Format: PNG
- Transparent background

## Migration Notes

### Existing Images
Old filesystem images at `/uploads/blog-images/` and `/uploads/logos/` will continue to work via static file serving. New uploads go to MongoDB.

### Cleanup Old Files
```bash
# Optional: Remove old uploads after migration
rm -rf api/uploads/blog-images/*
rm -rf api/uploads/logos/*
```

## Testing

### Test Blog Image Upload
1. Login as admin
2. Go to Blog Editor
3. Upload image
4. Verify URL format: `/api/media/{id}`
5. Check image displays correctly

### Test Logo Upload
1. Login as admin
2. Go to Admin → Logos
3. Upload logo
4. Verify URL format: `/api/media/{id}`
5. Check logo displays on landing page

## Performance Considerations

### Caching
- Browser caches for 1 year
- CDN can cache responses
- Reduces database queries

### Optimization
- Images compressed with Sharp
- Base64 stored efficiently
- Indexed by _id for fast lookup

### Limits
- 16MB MongoDB document limit
- Recommend max 10MB images
- Videos may need external storage (S3, Cloudinary)

## Future Enhancements

1. **CDN Integration**: Upload to Cloudinary/S3 for better performance
2. **Image Variants**: Store multiple sizes (thumbnail, medium, large)
3. **Lazy Loading**: Implement progressive image loading
4. **Compression**: Add WebP format support
5. **Analytics**: Track image views and bandwidth

## Files Modified

```
api/
├── models/
│   └── Media.js                    ✨ NEW
├── routes/
│   ├── media.js                    ✨ NEW
│   ├── blog.js                     📝 UPDATED
│   └── admin.js                    📝 UPDATED
└── index.js                        📝 UPDATED
```

## Environment Variables

No new environment variables required. Uses existing MongoDB connection.

## Deployment Checklist

- ✅ Media model created
- ✅ Media routes registered
- ✅ Blog upload updated
- ✅ Logo upload updated
- ✅ Caching headers added
- ✅ File type validation
- ✅ Size limits enforced
- ✅ Admin authentication required

## Support

Images are now stored in MongoDB and will persist across Vercel deployments. All new uploads automatically use the new system.
