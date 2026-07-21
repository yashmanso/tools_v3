# Sustainability Atlas Website

A modern website built with Next.js to showcase tools, methods, and resources for sustainable entrepreneurship and innovation.

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

## Contact Form

The website includes a "Contact us" button in the footer that opens the user's default email client (Mail, Outlook, etc.) with a pre-filled email to `yashar.mansoori@chalmers.se`.

### How It Works

When users click the "Contact us" button:
- Their default email application opens automatically
- The email is pre-addressed to `yashar.mansoori@chalmers.se`
- The subject line is pre-filled with "Contact from Sustainability Atlas"
- Users can compose and send their message directly from their email client

This approach requires no backend server or email service setup - it works entirely client-side using the standard `mailto:` protocol.

## License

ISC
