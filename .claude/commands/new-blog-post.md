# Create a New Blog Post

Create a new blog post for the AJV website based on the user's input: $ARGUMENTS

## Steps

### 1. Gather information
From the user's input, determine:
- **Title** (German)
- **Date** (publication date, use today if not specified)
- **Description** (1-2 sentence German summary)
- **Category** (e.g. "Kurse", "Events", "Wettkampf", "Verband")
- **Image** (file path if provided)
- **Image alt text** (German, descriptive)
- **Content** (the blog post body in German)

If any critical information is missing (especially title and content), ask the user before proceeding.

### 2. Optimize the image (if provided)
If the user provides an image file path:

1. Check the image dimensions and file size using `identify` or `file`
2. Convert and optimize it for web:
   ```bash
   magick <source-image> -resize 1200x -quality 80 src/assets/images/blog/<slug>.webp
   ```
   - Max width: **1200px** (sufficient for 960px detail view + retina)
   - Format: **WebP**
   - Quality: **80**
   - Filename: use a descriptive kebab-case slug matching the post, e.g. `kuatsu-rothrist-2026.webp`
3. Verify the output file was created and report the size savings
4. Do NOT keep the original file in `src/assets/images/blog/` — only the optimized WebP

### 3. Create the blog post file
Create a new `.md` file in `src/content/blog/` with this structure:

```md
---
title: "<title>"
date: <YYYY-MM-DD>
description: "<description>"
category: "<category>"
image: "../../assets/images/blog/<image-filename>.webp"
imageAlt: "<alt text>"
---

<content in German, using proper paragraphs>
```

**File naming:** Use a descriptive kebab-case slug, e.g. `erfolgreicher-kuatsu-kurs-rothrist-2026.md`

**Important:**
- All content must be in **German**
- The image path must be relative: `../../assets/images/blog/<filename>.webp`
- Omit `image` and `imageAlt` fields entirely if no image is provided
- Omit `category` if not applicable

### 4. Verify the build
Run `npm run build` to ensure:
- The blog post is generated at `/aktuelles/<slug>/`
- The image is optimized by Astro's build pipeline
- No build errors occur

### 5. Report results
Summarize what was created:
- Blog post file path and URL
- Image optimization results (original size → WebP size → Astro build size)
- Confirm successful build
