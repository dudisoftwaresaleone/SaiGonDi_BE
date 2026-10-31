/* eslint-disable no-console */
// Chuyển ảnh địa điểm + blog trong DB từ ảnh stock Unsplash sang ảnh thật đã tải về frontend.
//   node src/scripts/updatePlaceImages.js            -> cập nhật DB_NAMES (mặc định: DATABASE_NAME)
//   node src/scripts/updatePlaceImages.js --dry      -> chỉ in ra, không ghi
//   DB_NAMES=saigondi,SaiGonGo node src/scripts/updatePlaceImages.js
import 'dotenv/config'
import dns from 'dns'
dns.setServers(['8.8.8.8', '8.8.4.4'])
dns.setDefaultResultOrder('ipv4first')
import mongoose from 'mongoose'
import { placeImages, localizeBlogImages } from '../utils/localImages.js'

const DRY = process.argv.includes('--dry')
const dbNames = (process.env.DB_NAMES || process.env.DATABASE_NAME || 'saigondi').split(',').map((s) => s.trim())

await mongoose.connect(process.env.MONGODB_URI, { dbName: dbNames[0] })

for (const name of dbNames) {
  const db = mongoose.connection.client.db(name)
  console.log(`\n=== DB: ${name}${DRY ? ' (dry-run)' : ''} ===`)

  let placed = 0
  for (const place of await db.collection('places').find({}, { projection: { slug: 1, images: 1 } }).toArray()) {
    const images = placeImages[place.slug]
    if (!images) { console.warn(`  ? ${place.slug}: không có trong manifest, giữ nguyên`); continue }
    if (!DRY) await db.collection('places').updateOne({ _id: place._id }, { $set: { images } })
    console.log(`  place ${place.slug}: ${images.length} ảnh`)
    placed++
  }

  let blogs = 0
  for (const blog of await db.collection('blogs').find({}, { projection: { title: 1, mainImage: 1, content: 1 } }).toArray()) {
    const mainImage = localizeBlogImages(blog.title, blog.mainImage)
    const content = localizeBlogImages(blog.title, blog.content)
    if (mainImage === blog.mainImage && JSON.stringify(content) === JSON.stringify(blog.content)) continue
    if (!DRY) await db.collection('blogs').updateOne({ _id: blog._id }, { $set: { mainImage, content } })
    console.log(`  blog "${blog.title.slice(0, 50)}": mainImage -> ${mainImage}`)
    blogs++
  }
  console.log(`-> ${placed} địa điểm, ${blogs} blog`)
}
await mongoose.disconnect()
