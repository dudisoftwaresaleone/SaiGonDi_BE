/* eslint-disable no-console */
// Thay 8 bài blog mẫu (ngắn, ảnh stock) bằng các bài hướng dẫn đầy đủ trong src/data/blogArticles.js.
//   node src/scripts/updateBlogArticles.js --dry
//   DB_NAMES=saigondi,SaiGonGo node src/scripts/updateBlogArticles.js
// Khớp bài theo đầu tiêu đề cũ (matchTitle) hoặc theo tiêu đề mới => chạy lại nhiều lần vẫn an toàn.
// Giữ nguyên tác giả, lượt xem, lượt thích, bình luận; chỉ đổi tiêu đề, slug, ảnh, nội dung, thẻ, danh mục.
import 'dotenv/config'
import dns from 'dns'
dns.setServers(['8.8.8.8', '8.8.4.4'])
dns.setDefaultResultOrder('ipv4first')
import mongoose from 'mongoose'
import slugify from 'slugify'
import { blogArticles } from '../data/blogArticles.js'

const DRY = process.argv.includes('--dry')
const dbNames = (process.env.DB_NAMES || process.env.DATABASE_NAME || 'saigondi').split(',').map((s) => s.trim())
const createSlug = (t) => slugify(t, { lower: true, strict: true, locale: 'vi', remove: /[*+~.()'"!:@]/g })

await mongoose.connect(process.env.MONGODB_URI, { dbName: dbNames[0] })

for (const name of dbNames) {
  const db = mongoose.connection.client.db(name)
  console.log(`\n=== DB: ${name}${DRY ? ' (dry-run)' : ''} ===`)
  const blogs = await db.collection('blogs').find({}, { projection: { title: 1 } }).toArray()
  const categories = new Map((await db.collection('categories').find({ type: 'blog' }).toArray()).map((c) => [c.name, c._id]))

  for (const a of blogArticles) {
    const blog = blogs.find((b) => b.title === a.title || b.title.startsWith(a.matchTitle))
    if (!blog) { console.warn(`  ? không tìm thấy bài "${a.matchTitle}"`); continue }
    const categoryId = categories.get(a.categoryName)
    if (!categoryId) { console.warn(`  ! thiếu danh mục "${a.categoryName}"`); continue }
    const set = {
      title: a.title,
      slug: createSlug(a.title),
      mainImage: a.mainImage,
      content: a.content,
      tags: a.tags,
      categories: [categoryId],
      updatedAt: new Date()
    }
    const words = a.content.filter((c) => c.type === 'text').map((c) => c.value.replace(/<[^>]+>/g, ' ')).join(' ').split(/\s+/).length
    console.log(`  ~ ${a.title.slice(0, 70)} | ~${words} từ, ${a.content.filter((c) => c.type === 'image').length} ảnh | /${set.slug}`)
    if (!DRY) await db.collection('blogs').updateOne({ _id: blog._id }, { $set: set })
  }
}
await mongoose.disconnect()
