# Struktur Folder Images Edunet

Folder ini digunakan untuk menyimpan berbagai aset gambar yang digunakan di website Edunet.

## Struktur Folder

### `/icons`
Untuk menyimpan file icon dalam berbagai format (SVG, PNG, ICO)
- Favicon
- Icon untuk fitur-fitur
- Icon social media
- Icon navigasi

### `/logos`
Untuk menyimpan berbagai versi logo Edunet
- Logo primary (full color)
- Logo secondary (monochrome)
- Logo untuk dark mode
- Logo untuk light mode
- Variations (horizontal, vertical, icon only)

### `/screenshots`
Untuk screenshot demo, tutorial, atau dokumentasi
- Screenshot fitur Quiz
- Screenshot fitur Forum
- Screenshot Lab Virtual
- Tutorial step-by-step

### `/backgrounds`
Untuk background images, patterns, atau textures
- Hero section backgrounds
- Section backgrounds
- Gradient overlays
- Pattern images

### `/misc`
Untuk gambar-gambar lain yang tidak masuk kategori di atas
- Placeholder images
- Avatar defaults
- Decorative elements
- Ilustrasi

## Format yang Disarankan

- **Logo & Icons**: SVG (scalable, kecil file size)
- **Screenshots**: PNG (lossless quality)
- **Photos**: JPG atau WebP (compressed)
- **Backgrounds**: WebP atau PNG

## Penamaan File

Gunakan naming convention yang konsisten:
- Lowercase dengan dash separator: `logo-edunet-primary.svg`
- Descriptive names: `icon-network-simulation.svg`
- Include size jika ada variants: `logo-edunet-256x256.png`

## Optimisasi

Selalu optimize images sebelum commit:
- Compress PNG/JPG menggunakan tools seperti TinyPNG
- Minify SVG menggunakan SVGO
- Consider WebP format untuk better compression
- Use lazy loading untuk images yang below the fold
