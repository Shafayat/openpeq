/**
 * Convert icon.svg to icon.ico (multi-size Windows icon)
 * and icon.png (256x256 for electron-builder)
 *
 * Usage: node scripts/generate-icon.mjs
 */
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SVG_PATH = path.join(__dirname, '../resources/icon.svg')
const ICO_PATH = path.join(__dirname, '../resources/icon.ico')
const PNG_PATH = path.join(__dirname, '../resources/icon.png')

const SIZES = [16, 24, 32, 48, 64, 128, 256]

// ICO file format writer
function createIco(images) {
  // ICO header: 6 bytes
  const headerSize = 6
  const entrySize = 16 // per image
  const dataOffset = headerSize + entrySize * images.length

  let totalSize = dataOffset
  for (const img of images) totalSize += img.data.length

  const buffer = Buffer.alloc(totalSize)

  // Header
  buffer.writeUInt16LE(0, 0)             // reserved
  buffer.writeUInt16LE(1, 2)             // type: 1 = ICO
  buffer.writeUInt16LE(images.length, 4) // count

  let offset = dataOffset
  for (let i = 0; i < images.length; i++) {
    const img = images[i]
    const entryOffset = headerSize + i * entrySize

    buffer.writeUInt8(img.width >= 256 ? 0 : img.width, entryOffset)     // width (0 = 256)
    buffer.writeUInt8(img.height >= 256 ? 0 : img.height, entryOffset + 1) // height
    buffer.writeUInt8(0, entryOffset + 2)   // color palette
    buffer.writeUInt8(0, entryOffset + 3)   // reserved
    buffer.writeUInt16LE(1, entryOffset + 4)  // color planes
    buffer.writeUInt16LE(32, entryOffset + 6) // bits per pixel
    buffer.writeUInt32LE(img.data.length, entryOffset + 8)  // data size
    buffer.writeUInt32LE(offset, entryOffset + 12)          // data offset

    img.data.copy(buffer, offset)
    offset += img.data.length
  }

  return buffer
}

async function main() {
  const svgBuffer = readFileSync(SVG_PATH)

  console.log('Generating PNGs at sizes:', SIZES.join(', '))

  const images = []
  for (const size of SIZES) {
    const pngData = await sharp(svgBuffer, { density: 300 })
      .resize(size, size, { fit: 'contain', background: { r: 10, g: 10, b: 15, alpha: 1 } })
      .png()
      .toBuffer()

    images.push({ width: size, height: size, data: pngData })
    console.log(`  ${size}x${size}: ${pngData.length} bytes`)
  }

  // Write 256x256 PNG for electron-builder
  const png256 = images.find(i => i.width === 256)
  writeFileSync(PNG_PATH, png256.data)
  console.log(`\nWritten ${PNG_PATH}`)

  // Write ICO with all sizes
  const icoBuffer = createIco(images)
  writeFileSync(ICO_PATH, icoBuffer)
  console.log(`Written ${ICO_PATH} (${(icoBuffer.length / 1024).toFixed(1)} KB)`)
}

main().catch(err => {
  console.error('Failed:', err)
  process.exit(1)
})
