import sharp from 'sharp'
import { join } from 'path'

const iconsDir = '/Users/gordoncyrus/Documents/dev/DJKENNYBLACK/public/icons'
const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

const svg = Buffer.from(`<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="80" fill="#080808"/>
  <circle cx="256" cy="256" r="200" fill="#ff4500"/>
  <text x="256" y="315" font-family="Arial,sans-serif" font-size="180" font-weight="900" fill="white" text-anchor="middle">KB</text>
</svg>`)

await Promise.all(
  sizes.map((size) =>
    sharp(svg).resize(size, size).png().toFile(join(iconsDir, `icon-${size}.png`))
  )
)
console.log('Icons generated successfully')
