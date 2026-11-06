/* eslint-disable no-console */
// Nạp các địa điểm THẬT còn lại trong src/data/realPlaces.json (nguồn Wikidata/Wikipedia/Commons)
// vào DB, kèm ảnh thật đã tải về frontend (src/data/placeImages.json).
//   node src/scripts/importRealPlaces.js --dry   -> chỉ in kế hoạch
//   node src/scripts/importRealPlaces.js         -> ghi vào DATABASE_NAME
// Chạy lại nhiều lần an toàn: địa điểm đã có (trùng tên/slug) sẽ bị bỏ qua.
// Không bịa số liệu: rating, lượt xem, lượt thích để mặc định 0.
import 'dotenv/config'
import dns from 'dns'
dns.setServers(['8.8.8.8', '8.8.4.4'])
dns.setDefaultResultOrder('ipv4first')
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DRY = process.argv.includes('--dry')

const { default: Place } = await import('../models/Place.model.js')
const { default: Category } = await import('../models/Category.model.js')
const { default: Ward } = await import('../models/Ward.model.js')
const { default: User } = await import('../models/User.model.js')
const { placeImages } = await import('../utils/localImages.js')

const realPlaces = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/realPlaces.json'), 'utf8')).places

// Cùng thuật toán tạo slug với SaiGonDi_Web/scripts/fetch-place-images.mjs (khóa của placeImages.json)
const imageKey = (name) =>
  name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase()
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

// 18 địa điểm này đã có trong DB từ bộ seed 36 địa điểm (ảnh đã cập nhật bởi updatePlaceImages.js)
const ALREADY_SEEDED = new Set([
  'Q428129', 'Q2227270', 'Q933384', 'Q3232879', 'Q18640924', 'Q7682043', 'Q703871', 'Q10771949', 'Q1063916',
  'Q15265989', 'Q10743440', 'Q3162430', 'Q6121304', 'Q1949129', 'Q638512', 'Q31994680', 'Q56193221', 'Q56193845'
])

// TARGET_DB=SaiGonGo để nạp vào DB khác (mặc định DATABASE_NAME)
await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.TARGET_DB || process.env.DATABASE_NAME })

const admin = await User.findOne({ role: 'admin' })
if (!admin) throw new Error('Không tìm thấy tài khoản admin để gán createdBy')
const categories = new Map((await Category.find({ type: 'place' })).map((c) => [c.name, c._id]))
const wards = (await Ward.find({})).map((w) => ({ _id: w._id, name: w.name }))

// Nhãn phường PHẢI khớp phường ghi trong địa chỉ (nguồn dùng tên phường mới sau sáp nhập 2025, vd "Phường Sài Gòn").
// Trước đây quy đổi sang tên phường cũ (Sài Gòn -> Bến Nghé) khiến nhãn lệch địa chỉ; nay tìm ward cùng tên, chưa có thì tạo.
// (Không khớp theo tọa độ: location của wards trong DB không đáng tin.)
async function findWard(p) {
  const name = (p.wardName || '').replace(/^(Phường|Xã|Đặc khu)\s+/i, '').trim()
  let ward = wards.find((w) => w.name === name)
  let created = false
  if (!ward) {
    console.log(`  + tạo ward "${name}"`)
    const doc = { name, type: 'phường', location: { type: 'Point', coordinates: p.location.coordinates } }
    ward = DRY ? { _id: new mongoose.Types.ObjectId(), name } : await Ward.create(doc)
    wards.push({ _id: ward._id, name })
    created = true
  }
  return { ward, aliased: created }
}

const cleanName = (n) => n.replace(/\s*\((Thành phố Hồ Chí Minh)\)\s*$/i, '').trim()

let created = 0, skipped = 0, aliasedWard = 0, noImage = 0
for (const p of realPlaces) {
  if (ALREADY_SEEDED.has(p.wikidataId)) continue
  const name = cleanName(p.name)
  if (await Place.exists({ name })) { console.log(`  = ${name}: đã có, bỏ qua`); skipped++; continue }

  const catId = categories.get(p.category)
  if (!catId) { console.warn(`  ! ${name}: không có danh mục "${p.category}"`); skipped++; continue }
  const { ward, aliased } = await findWard(p)
  if (aliased) aliasedWard++
  const images = placeImages[imageKey(p.name)] ?? []
  if (!images.length) noImage++

  const doc = {
    name,
    description: p.description,
    categories: [catId],
    services: [],
    address: p.address,
    ward: ward._id,
    district: p.district || p.wardName,
    location: { type: 'Point', coordinates: p.location.coordinates },
    images,
    status: 'approved',
    createdBy: admin._id,
    verifiedBy: admin._id
  }
  console.log(`  + ${name} | ${p.category} | ward=${ward.name}${aliased ? ' (ward mới)' : ''} | ${images.length} ảnh`)
  if (!DRY) await Place.create(doc)
  created++
}
console.log(`\n${DRY ? '[dry-run] ' : ''}Tạo ${created}, bỏ qua ${skipped}; ward tạo mới: ${aliasedWard}; chưa có ảnh: ${noImage}`)
await mongoose.disconnect()
