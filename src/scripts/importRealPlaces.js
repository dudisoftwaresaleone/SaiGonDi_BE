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

await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DATABASE_NAME })

const admin = await User.findOne({ role: 'admin' })
if (!admin) throw new Error('Không tìm thấy tài khoản admin để gán createdBy')
const categories = new Map((await Category.find({ type: 'place' })).map((c) => [c.name, c._id]))
const wards = (await Ward.find({ type: 'phường' })).map((w) => ({ _id: w._id, name: w.name }))

// Dữ liệu nguồn dùng tên phường mới sau sáp nhập (2025), còn bảng wards trong DB là tên phường cũ.
// Gán theo cách bộ seed hiện tại đang dùng (trung tâm Q1 -> Bến Nghé, khu Q3 cũ -> Võ Thị Sáu).
// (Không khớp theo tọa độ: location của wards trong DB bị lưu đảo lat/lon.)
const WARD_ALIAS = { 'Sài Gòn': 'Bến Nghé', 'Xuân Hòa': 'Võ Thị Sáu' }
function findWard(p) {
  const raw = (p.wardName || '').replace(/^Phường\s+/i, '').trim()
  const name = WARD_ALIAS[raw] || raw
  const ward = wards.find((w) => w.name === name)
  if (!ward) throw new Error(`Không tìm thấy phường "${raw}" cho ${p.name}`)
  return { ward, aliased: name !== raw }
}

const cleanName = (n) => n.replace(/\s*\((Thành phố Hồ Chí Minh)\)\s*$/i, '').trim()

let created = 0, skipped = 0, aliasedWard = 0, noImage = 0
for (const p of realPlaces) {
  if (ALREADY_SEEDED.has(p.wikidataId)) continue
  const name = cleanName(p.name)
  if (await Place.exists({ name })) { console.log(`  = ${name}: đã có, bỏ qua`); skipped++; continue }

  const catId = categories.get(p.category)
  if (!catId) { console.warn(`  ! ${name}: không có danh mục "${p.category}"`); skipped++; continue }
  const { ward, aliased } = findWard(p)
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
  console.log(`  + ${name} | ${p.category} | ward=${ward.name}${aliased ? ' (quy đổi từ ' + p.wardName + ')' : ''} | ${images.length} ảnh`)
  if (!DRY) await Place.create(doc)
  created++
}
console.log(`\n${DRY ? '[dry-run] ' : ''}Tạo ${created}, bỏ qua ${skipped}; ward quy đổi tên cũ: ${aliasedWard}; chưa có ảnh: ${noImage}`)
await mongoose.disconnect()
