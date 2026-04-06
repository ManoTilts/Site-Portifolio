# CV Upload Guide

## How to Add Your CV to Your Portfolio

Your portfolio now has a complete CV management system! Here's how to use it:

## 🚀 Quick Setup

### 1. Start Your Backend Server
```bash
cd backend
uvicorn main:app --reload
```

### 2. Upload Your CV via API Docs
1. **Open Swagger UI:** http://localhost:8000/docs
2. **Find the CV section** with these endpoints:
   - `POST /api/cv/upload` - Upload your CV
   - `GET /api/cv/download` - Download CV 
   - `GET /api/cv/view` - View CV in browser
   - `GET /api/cv/info` - Get CV information

### 3. Upload Your CV
1. **Click** on `POST /api/cv/upload`
2. **Click** "Try it out"
3. **Choose your PDF file** (must be PDF format, max 5MB)
4. **Click** "Execute"

Your CV will be saved as `Felipe_Mazzeo_Barbosa_CV.pdf` and will be downloadable via the button on your portfolio homepage.

## 📋 CV Requirements

- **Format:** PDF only
- **Size:** Maximum 5MB
- **Filename:** Can be anything (it gets renamed automatically)
- **Content:** Your professional resume/CV

## 🎯 Frontend Integration

Your CV download button in the Hero section will:
- ✅ **Show "Download CV"** when CV is available
- ⚠️ **Show "CV Coming Soon"** when no CV is uploaded
- 🔗 **Automatically download** the CV when clicked

## 📁 File Storage

Your CV is stored in:
```
backend/uploads/cv/cv.pdf
```

## 🔄 Updating Your CV

To update your CV:
1. Simply upload a new PDF via the same upload endpoint
2. The old CV will be automatically replaced
3. The download button will continue to work with the new version

## 🌐 Live URLs

Once uploaded, your CV is accessible at:
- **Download:** `http://localhost:8000/api/cv/download`
- **View:** `http://localhost:8000/api/cv/view`
- **Info:** `http://localhost:8000/api/cv/info`

## 🔧 API Examples

### Upload CV with cURL:
```bash
curl -X POST "http://localhost:8000/api/cv/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/cv.pdf"
```

### Check if CV exists:
```bash
curl "http://localhost:8000/api/cv/info"
```

### Download CV:
```bash
curl -O "http://localhost:8000/api/cv/download"
```

## 🎨 Frontend Behavior

The Hero component automatically:
- Checks if a CV is available on page load
- Updates the button text and functionality accordingly
- Handles download errors gracefully
- Shows appropriate user feedback

## 🚨 Troubleshooting

### "File type not allowed"
- Make sure your file is a PDF
- Check the file extension is `.pdf`

### "File too large"
- Reduce your PDF size (max 5MB)
- Use online PDF compressors if needed

### "CV not found"
- Upload a CV first via the API
- Check the backend logs for errors

### Button shows "CV Coming Soon"
- Upload a CV via the API endpoints
- Check your network connection
- Verify the backend is running

## 🔐 Security Features

- Only PDF files are accepted
- File size limits prevent abuse
- Secure file storage in uploads directory
- Automatic filename sanitization 