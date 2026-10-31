// Ảnh thật của địa điểm/bài viết, đã tải về frontend (SaiGonDi_Web/public/images/places).
// src/data/placeImages.json được sinh bởi `node scripts/fetch-place-images.mjs` ở repo Web
// (slug -> ["/images/places/<slug>/1.webp", ...]). Địa điểm chưa có ảnh thật => mảng rỗng (FE hiện placeholder).
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const placeImages = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/placeImages.json'), 'utf8')
)

const img = (slug, n = 1) => placeImages[slug]?.[n - 1] || placeImages[slug]?.[0]

// Ảnh stock Unsplash cũ trong bài blog -> ảnh thật tương ứng với nội dung từng bài.
// Key: đầu tiêu đề bài viết; value: { 'photo-<id Unsplash cũ>': đường dẫn ảnh mới }
const BLOG_IMAGE_MAP = [
  { title: 'Lịch trình 24h', map: {
    'photo-1583417319070-4a69db38a482': img('nha-tho-duc-ba-sai-gon'),
    'photo-1586004631071-8be9d3e5aa5c': img('buu-dien-trung-tam-sai-gon'),
    'photo-1566473742367-2197f951af96': img('pho-di-bo-nguyen-hue') } },
  { title: 'Food Tour Chợ Lớn', map: {
    'photo-1541696432-82c6da8ce7bf': img('cho-lon-cho-binh-tay', 1),
    'photo-1555939594-58d7cb561ad1': img('cho-lon-cho-binh-tay', 2) } },
  { title: 'Trải nghiệm Saigon Waterbus', map: {
    'photo-1566473742367-2197f951af96': img('ben-bach-dang-and-ga-tau-thuy-saigon-waterbus', 1),
    'photo-1563553907269-96f95e89d4a9': img('ben-bach-dang-and-ga-tau-thuy-saigon-waterbus', 2) } },
  { title: 'Top 7 quán cà phê chung cư cổ', map: {
    'photo-1501339847302-ac426a4a7cbb': img('chung-cu-ca-phe-42-nguyen-hue'),
    'photo-1495474472287-4d71bcdd2085': img('pho-di-bo-nguyen-hue', 3) } },
  { title: 'Khám phá kiến trúc Đông Dương', map: {
    'photo-1579783900882-c0d3dad7b119': img('bao-tang-my-thuat-tp-ho-chi-minh', 1),
    'photo-1569154941061-e231b4725ef1': img('bao-tang-my-thuat-tp-ho-chi-minh', 2) } },
  { title: 'Đi tìm đĩa cơm tấm đêm', map: {
    'photo-1546069901-ba9599a7e63c': img('hem-com-tam-dem-ba-muoi-hang-xanh'),
    'photo-1555939594-58d7cb561ad1': img('com-tam-ba-ghien', 2) } },
  { title: 'Cẩm nang check-in Nhà thờ màu hồng', map: {
    'photo-1528127269322-539801943592': img('nha-tho-tan-dinh-nha-tho-mau-hong', 1),
    'photo-1586004631071-8be9d3e5aa5c': img('nha-tho-tan-dinh-nha-tho-mau-hong', 2) } },
  { title: 'Hồ Con Rùa về đêm', map: {
    'photo-1555396273-367ea4eb4db5': img('ho-con-rua-cong-truong-quoc-te', 1),
    'photo-1504674900247-0877df9cc836': img('ho-con-rua-cong-truong-quoc-te', 3) } }
]

const UNSPLASH = /https:\/\/images\.unsplash\.com\/(photo-[\w-]+)[^\s"')]*/g

// Thay mọi URL Unsplash (đệ quy trong string/array/object) bằng ảnh thật của bài `title`.
export function localizeBlogImages(title, value) {
  const entry = BLOG_IMAGE_MAP.find((e) => title?.startsWith(e.title))
  if (!entry) return value
  const walk = (v) => {
    if (typeof v === 'string') return v.replace(UNSPLASH, (m, id) => entry.map[id] || m)
    if (Array.isArray(v)) return v.map(walk)
    if (v && typeof v === 'object' && v.constructor === Object) {
      return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]))
    }
    return v
  }
  return walk(value)
}
