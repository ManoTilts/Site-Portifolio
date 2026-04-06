# Portfolio Project Setup Guide

## Adding Projects to Your Portfolio

### Method 1: Using the Script (Recommended)

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Make sure your .env file is configured with:**
   ```
   MONGODB_URL=your_mongodb_connection_string
   DATABASE_NAME=portfolio_db
   # ... other required settings
   ```

3. **Run the project addition script:**
   ```bash
   python add_projects.py
   ```

This will add 5 sample projects to your portfolio that you can customize later.

### Method 2: Using the Admin API

Once your backend is running, you can add projects via the API:

1. **Start the backend server:**
   ```bash
   uvicorn main:app --reload
   ```

2. **Use the admin API endpoints:**
   - POST `/admin/projects` - Create a new project
   - PUT `/admin/projects/{id}` - Update a project
   - DELETE `/admin/projects/{id}` - Delete a project

3. **Example project creation with curl:**
   ```bash
   curl -X POST "http://localhost:8000/admin/projects" \
   -H "Content-Type: application/json" \
   -d '{
     "title": "My Awesome Project",
     "description": "A detailed description of what this project does...",
     "short_description": "Brief description for cards",
     "technologies": ["React", "Python", "MongoDB"],
     "category": "Full Stack",
     "featured": true,
     "status": "published",
     "slug": "my-awesome-project",
     "order": 1,
     "images": [],
     "thumbnail": null,
     "links": {
       "github": "https://github.com/yourusername/project",
       "live": "https://project.yourname.com",
       "demo": "https://demo.project.yourname.com"
     },
     "metadata": {
       "note": "Additional project information"
     }
   }'
   ```

### Method 3: Direct Database Insertion

If you have MongoDB access, you can insert projects directly:

```javascript
// Connect to your MongoDB database
use portfolio_db

// Insert a project
db.projects.insertOne({
  title: "Your Project Title",
  description: "Detailed project description...",
  short_description: "Brief description",
  technologies: ["React", "Node.js"],
  category: "Web App",
  featured: true,
  order: 1,
  status: "published",
  slug: "your-project-title",
  date_created: new Date(),
  date_updated: new Date(),
  links: {
    github: "https://github.com/yourusername/project",
    live: "https://yourproject.com"
  }
})
```

## Project Data Structure

Each project should have the following fields:

- **title** (required): Project name
- **description** (required): Detailed project description
- **short_description** (optional): Brief description for cards
- **technologies** (array): Technologies used
- **category** (required): Project category (e.g., "Full Stack", "Frontend", "Backend")
- **featured** (boolean): Whether to feature on homepage
- **order** (number): Display order (higher = first)
- **status** (string): "published", "draft", or "archived"
- **slug** (string): URL-friendly version of title
- **links** (object): URLs for project links
  - `github`: GitHub repository URL
  - `live`: Live deployment URL  
  - `demo`: Demo/preview URL
- **images** (array): Image URLs for project gallery
- **thumbnail** (string): Main image URL for project cards
- **metadata** (object): Additional structured data about the project

## Customizing Sample Projects

After running the script, you can:

1. **Update project links** to point to your actual repositories
2. **Replace placeholder URLs** with your real project URLs
3. **Add project images** by uploading them and updating the `images` and `thumbnail` fields
4. **Modify descriptions** to match your actual projects
5. **Adjust categories** to fit your project types

## Viewing Projects

Once added, projects will automatically appear in:
- The main Projects section of your portfolio
- Featured projects (if marked as featured)
- Project categories filter

The frontend will automatically fetch and display all published projects from the database.