# Sustainability Atlas Website

A modern website built with Next.js to showcase tools, methods, and resources for sustainable entrepreneurship and innovation.

## Features

- 🎨 **Modern Design**: Clean, minimal interface with light/dark theme support
- 🔍 **Search & Filter**: Find resources by title, description, or tags
- 📱 **Responsive**: Works beautifully on all devices
- ⚡ **Fast**: Static site generation for optimal performance
- 🔗 **Smart Links**: Automatic conversion of Obsidian wiki-links
- 📚 **Three Categories**:
  - Tools, Methods & Frameworks
  - Collections, Compendia & Kits
  - Practical Academic Articles & Scientific Reports

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Remark** - Markdown processing
- **Gray Matter** - Frontmatter parsing

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Project Structure

```
website/
├── app/
│   ├── components/     # React components
│   ├── lib/           # Utility functions
│   ├── tools/         # Tools category pages
│   ├── collections/   # Collections category pages
│   ├── articles/      # Articles category pages
│   ├── layout.tsx     # Root layout
│   ├── page.tsx       # Homepage
│   └── globals.css    # Global styles
├── public/            # Static assets
└── ...config files
```

## Content

The website reads markdown files from the parent directory:
- `1 – Tools, methods, frameworks, or guides/`
- `2 – Collections, Compendia, or Kits/`
- `3 – Practical academic articles and scientific reports/`

## Attachments (PDFs, Images)

The website supports displaying attachments (PDFs and images) referenced in your markdown files. These appear in a "Resources" section at the bottom of each page.

### Current Status

The system is set up to display 95 attachments:
- 61 PNG images
- 25 PDFs
- 4 JPEGs
- 5 JPGs

**Note**: Attachment files are not currently in the repository and need to be added.

### How to Add Attachments

1. **Find your Obsidian attachments folder** (usually in your vault directory)

2. **Copy all referenced files** to the `public/attachments/` directory:
   ```bash
   cp /path/to/your/obsidian/vault/attachments/* public/attachments/
   ```

3. **Verify which files are needed**:
   ```bash
   npm run check-attachments
   ```
   This will show you which files are missing and which are present.

### How It Works

- The markdown parser automatically detects `![[filename.pdf]]` and `![[image.png]]` syntax
- Files are referenced from `/attachments/filename.pdf`
- The ResourcesSection component displays attachments with icons and download links
- Missing files are shown with a "File not yet available" placeholder

### Customization

To mark files as available (once you've added them), edit:
- `app/components/ResourcesSection.tsx`
- Change `const isAvailable = false` to check if the file exists

Or implement a file check function to dynamically verify file availability.

## Theme

The color scheme matches the original Obsidian Publish site:
- **Light mode**: White background (#ffffff) with dark text (#222222)
- **Dark mode**: Dark gray background (#1e1e1e) with light text (#dadada)

## License

ISC
