# Personal Website

A modern, responsive personal website for developers featuring a blog, project portfolio, and about section. Built with pure HTML5, CSS3, and JavaScript - ready for GitHub Pages deployment.

## Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional design with smooth animations
- **Blog System**: Markdown-based blog with search and filtering
- **Project Portfolio**: Showcase your work with detailed project pages
- **SEO Optimized**: Proper meta tags and semantic HTML structure
- **Fast Loading**: Optimized performance with minimal dependencies

## Structure

```
/
├── index.html              # Home page
├── about/
│   └── index.html         # About page
├── projects/
│   ├── index.html         # Projects listing
│   ├── project1/          # Individual project pages
│   ├── project2/
│   └── projects-data.json # Projects data
├── blogs/
│   ├── index.html         # Blog listing
│   ├── post/
│   │   └── index.html     # Blog post template
│   ├── blogposts/         # Markdown blog posts
│   └── metadata.json     # Blog metadata
├── css/                   # Stylesheets
├── js/                    # JavaScript files
├── assets/                # Images and icons
└── README.md
```

## Quick Start

1. **Clone or download** this repository
2. **Customize the content**:
   - Edit `index.html` with your personal information
   - Update `about/index.html` with your background
   - Add your projects to `projects/projects-data.json`
   - Write blog posts in Markdown in `blogs/blogposts/`
   - Update `blogs/metadata.json` with your blog post information
3. **Add your photos** to `assets/profile/`
4. **Deploy** to GitHub Pages or any static hosting service

## Customization

### Personal Information
- Edit the hero section in `index.html`
- Update social media links in all footer sections
- Replace placeholder profile images

### Colors and Styling
- Modify CSS variables in `css/main.css` under `:root`
- Customize the color scheme to match your brand

### Blog Posts
1. Create a new `.md` file in `blogs/blogposts/`
2. Add metadata to `blogs/metadata.json`
3. The blog system will automatically display your new post

### Projects
1. Add project data to `projects/projects-data.json`
2. Create individual project pages in `projects/projectname/`
3. Add project images to `assets/images/`

## GitHub Pages Deployment

1. **Push to GitHub**: Upload all files to a GitHub repository
2. **Enable Pages**: Go to Settings > Pages in your repository
3. **Select Source**: Choose "Deploy from a branch" and select `main`
4. **Custom Domain** (optional): Add your custom domain in the settings

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

This website uses minimal external dependencies:
- Google Fonts (Inter & Playfair Display)
- Font Awesome icons
- Marked.js for Markdown parsing (loaded dynamically)

## Performance Features

- Lazy loading for images
- Minimal JavaScript bundle
- Optimized CSS with efficient selectors
- Responsive images and modern formats

## SEO Features

- Semantic HTML structure
- Proper meta tags and Open Graph
- Structured data markup
- Fast loading times
- Mobile-friendly design

## License

This project is open source and available under the MIT License.

## Support

If you need help customizing this website or have questions, feel free to open an issue or reach out.


---

Built with ❤️ for developers who want a fast, modern personal website.
