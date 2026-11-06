/* eslint-disable no-console */
// Đồng bộ nhãn phường (places.ward) với phường ghi trong địa chỉ của chính địa điểm đó.
// Lỗi gốc: địa chỉ "Phường 12, Quận 4" nhưng nhãn/breadcrumb hiện "Phường 8".
//
//   node src/scripts/normalizePlaceWards.js                        -> DRY-RUN (mặc định), chỉ in kế hoạch
//   node src/scripts/normalizePlaceWards.js --apply                -> ghi vào DB
//   DB_NAMES=saigondi,SaiGonGo node src/scripts/normalizePlaceWards.js --apply
//
// Quy tắc: lấy "Phường X / Xã X / Đặc khu X" trong address; phường đánh số -> "Phường 12", phường có tên -> "Bến Nghé".
// Tìm ward cùng tên; nếu chưa có thì tạo mới (toạ độ lấy từ địa điểm). Không sửa address/district.
// Lưu ý: bản ghi ward chưa tách theo quận nên "Phường 1" dùng chung cho mọi quận (nhãn vẫn khớp địa chỉ).
import 'dotenv/config'
import dns from 'dns'
dns.setServers(['8.8.8.8', '8.8.4.4'])
dns.setDefaultResultOrder('ipv4first')
import mongoose from 'mongoose'

const APPLY = process.argv.includes('--apply')
const dbNames = (process.env.DB_NAMES || process.env.DATABASE_NAME || 'saigondi').split(',').map((s) => s.trim())

const TYPE_BY_PREFIX = { 'phường': 'phường', 'xã': 'xã', 'đặc khu': 'đặc khu' }

export function parseWardFromAddress(address) {
  // Ưu tiên "Phường X"; "xã"/"Đặc khu" chỉ lấy khi đứng riêng (không phải trong "Công xã Paris")
  const m =
    /(?:^|[\s,])(Phường)\s+([^,]+)/i.exec(address || '') ||
    /(?:^|[\s,])(?<!Công\s)(Xã|Đặc khu)\s+([^,]+)/i.exec(address || '')
  if (!m) return null
  const type = TYPE_BY_PREFIX[m[1].toLowerCase()]
  const raw = m[2].trim()
  const name = /^\d+$/.test(raw) ? `Phường ${raw}` : raw
  return { name, type }
}

if (process.argv[1] && process.argv[1].endsWith('normalizePlaceWards.js')) {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: dbNames[0] })

  for (const dbName of dbNames) {
    const db = mongoose.connection.client.db(dbName)
    console.log(`\n=== DB: ${dbName} ${APPLY ? '(APPLY)' : '(dry-run, thêm --apply để ghi)'} ===`)

    const wards = await db.collection('wards').find({}).toArray()
    const byName = new Map()
    for (const w of wards) if (!byName.has(w.name)) byName.set(w.name, w)
    const places = await db.collection('places').find({}, { projection: { name: 1, address: 1, ward: 1, location: 1 } }).toArray()

    let changed = 0, same = 0, skipped = 0, created = 0
    for (const place of places) {
      const parsed = parseWardFromAddress(place.address)
      if (!parsed) { console.warn(`  ? ${place.name}: địa chỉ không có phường/xã, bỏ qua (${place.address})`); skipped++; continue }

      let target = byName.get(parsed.name) || byName.get(`Đặc khu ${parsed.name}`)
      // Chỉ tự tạo ward cho phường đánh số ("Phường 12"). Tên phường sau sáp nhập (Sài Gòn, Xuân Hòa...) KHÔNG có vùng
      // trên bản đồ check-in và sẽ làm lệch mẫu số "x/176 xã, phường" -> bỏ qua, chờ quyết định cách gọi tên.
      if (!target && !/^Phường \d+$/.test(parsed.name)) {
        console.log(`  - bỏ qua ${place.name}: chưa có ward "${parsed.name}" (không tự tạo)`)
        skipped++
        continue
      }
      if (!target) {
        const doc = {
          name: parsed.name,
          type: parsed.type,
          location: { type: 'Point', coordinates: place.location?.coordinates?.length === 2 ? place.location.coordinates : [0, 0] }
        }
        console.log(`  + tạo ward "${parsed.name}" (${parsed.type})`)
        if (APPLY) {
          const res = await db.collection('wards').insertOne(doc)
          target = { ...doc, _id: res.insertedId }
        } else {
          target = { ...doc, _id: new mongoose.Types.ObjectId() } // id giả cho dry-run
        }
        byName.set(parsed.name, target)
        created++
      }

      if (String(place.ward) === String(target._id)) { same++; continue }
      const currentWard = wards.find((w) => String(w._id) === String(place.ward))
      console.log(`  ~ ${place.name}: "${currentWard?.name ?? place.ward}" -> "${parsed.name}"  | ${place.address}`)
      if (APPLY) await db.collection('places').updateOne({ _id: place._id }, { $set: { ward: target._id } })
      changed++
    }
    console.log(`\n${APPLY ? '' : '[dry-run] '}Đổi ${changed}, đã khớp ${same}, bỏ qua ${skipped}, ward mới ${created}`)
  }
  await mongoose.disconnect()
}
