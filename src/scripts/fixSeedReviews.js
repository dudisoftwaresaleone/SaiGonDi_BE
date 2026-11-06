/* eslint-disable no-console */
// Thay các đánh giá mẫu chung chung (cùng 8 câu lặp cho mọi địa điểm, kể cả nói về "bánh mì", "quán đông"
// ở phố đi bộ/di tích) bằng đánh giá đúng loại địa điểm, rồi tính lại số đánh giá/điểm trung bình theo review thật.
//
//   node src/scripts/fixSeedReviews.js                        -> DRY-RUN (mặc định), chỉ in kế hoạch
//   node src/scripts/fixSeedReviews.js --apply                -> ghi vào DB
//   DB_NAMES=saigondi,SaiGonGo node src/scripts/fixSeedReviews.js --apply
//
// Chỉ đụng tới review có nội dung TRÙNG ĐÚNG 1 trong 8 câu mẫu cũ (LEGACY_GENERIC_COMMENTS); review người dùng thật giữ nguyên.
// Mỗi địa điểm chỉ giữ tối đa số mẫu của loại đó (4); review mẫu cũ dư ra bị XOÁ để không có 2 đánh giá trùng chữ.
// Sau đó totalRatings/avgRating của các địa điểm bị ảnh hưởng được tính lại từ toàn bộ review còn lại.
import 'dotenv/config'
import dns from 'dns'
dns.setServers(['8.8.8.8', '8.8.4.4'])
dns.setDefaultResultOrder('ipv4first')
import mongoose from 'mongoose'
import { LEGACY_GENERIC_COMMENTS, getReviewTemplates } from '../data/reviewTemplates.js'

const APPLY = process.argv.includes('--apply')
const dbNames = (process.env.DB_NAMES || process.env.DATABASE_NAME || 'saigondi').split(',').map((s) => s.trim())
const legacy = new Set(LEGACY_GENERIC_COMMENTS.map((c) => c.trim()))

await mongoose.connect(process.env.MONGODB_URI, { dbName: dbNames[0] })

for (const dbName of dbNames) {
  const db = mongoose.connection.client.db(dbName)
  console.log(`\n=== DB: ${dbName} ${APPLY ? '(APPLY)' : '(dry-run, thêm --apply để ghi)'} ===`)

  const categories = new Map((await db.collection('categories').find({}).toArray()).map((c) => [String(c._id), c.name]))
  const places = await db.collection('places').find({}, { projection: { name: 1, categories: 1, totalRatings: 1, avgRating: 1 } }).toArray()
  const placeById = new Map(places.map((p) => [String(p._id), p]))

  const legacyReviews = (await db.collection('reviews').find({ comment: { $in: [...legacy] } }).sort({ createdAt: 1 }).toArray())
  const perPlace = new Map()
  for (const r of legacyReviews) {
    const key = String(r.placeId)
    if (!perPlace.has(key)) perPlace.set(key, [])
    perPlace.get(key).push(r)
  }

  let replaced = 0, deleted = 0
  for (const [placeId, reviews] of perPlace) {
    const place = placeById.get(placeId)
    const catName = categories.get(String(place?.categories?.[0]))
    const templates = getReviewTemplates(catName)
    console.log(`  ${place?.name ?? placeId} [${catName ?? 'không rõ danh mục'}]: ${reviews.length} review mẫu cũ`)
    // rating cuối cùng của mọi review thuộc địa điểm (tính trong bộ nhớ, dùng được cho cả dry-run)
    const finalRatings = new Map(
      (await db.collection('reviews').find({ placeId: place._id }).project({ rating: 1 }).toArray()).map((r) => [String(r._id), r.rating])
    )
    for (const [i, review] of reviews.entries()) {
      if (i < templates.length) {
        finalRatings.set(String(review._id), templates[i].rating)
        const t = templates[i]
        if (APPLY) await db.collection('reviews').updateOne({ _id: review._id }, { $set: { comment: t.comment, rating: t.rating } })
        replaced++
      } else {
        finalRatings.delete(String(review._id))
        if (APPLY) await db.collection('reviews').deleteOne({ _id: review._id })
        deleted++
      }
    }

    // tính lại số liệu từ review thật của địa điểm
    const remain = [...finalRatings.values()]
    const total = remain.length
    const avg = total ? Math.round((remain.reduce((sum, r) => sum + r, 0) / total) * 10) / 10 : 0
    console.log(`    totalRatings ${place.totalRatings} -> ${total}, avgRating ${place.avgRating} -> ${avg}`)
    if (APPLY) await db.collection('places').updateOne({ _id: place._id }, { $set: { totalRatings: total, avgRating: avg } })
  }
  console.log(`\n${APPLY ? '' : '[dry-run] '}Thay nội dung ${replaced} review, xoá ${deleted} review dư, ${perPlace.size} địa điểm`)
}
await mongoose.disconnect()
