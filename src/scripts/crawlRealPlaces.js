/* eslint-disable no-console */
// Crawl dữ liệu địa điểm THẬT ở TP.HCM từ các nguồn mở (không cào Foody/Google Maps/Tripadvisor vì cấm trong ToS):
//  - Wikidata: tên, loại, tọa độ, ảnh, tên thư mục Commons
//  - Wikipedia tiếng Việt: mô tả (CC BY-SA)
//  - Wikimedia Commons: ảnh + tác giả + giấy phép
//  - Nominatim (OpenStreetMap): địa chỉ từ tọa độ (giới hạn 1 request/giây theo chính sách của họ)
// Kết quả ghi vào src/data/realPlaces.json. Chạy: node src/scripts/crawlRealPlaces.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_FILE = path.join(__dirname, '../data/realPlaces.json')
const UA = 'SaiGonDiCrawler/1.0 (ngotranvandiem@dudisoftware.com)'
const MAX_IMAGES = 5
const MAX_PLACES = Number(process.env.MAX_PLACES) || 150

// Vùng nội thành cũ, loại Côn Đảo / Vũng Tàu / Bình Châu...
const BBOX = { minLat: 10.62, maxLat: 10.95, minLon: 106.55, maxLon: 106.92 }

// Từ khoá loại (label tiếng Việt của Wikidata P31) -> category trong DB
const CATEGORY_RULES = [
  { category: 'Địa điểm tôn giáo', keywords: ['nhà thờ', 'chùa', 'đền', 'đình', 'hội quán', 'thánh đường', 'thánh thất', 'miếu', 'tháp', 'tín ngưỡng', 'tôn giáo'] },
  { category: 'Mua sắm', keywords: ['chợ', 'thị trường', 'trung tâm thương mại'] },
  { category: 'Khách sạn và lưu trú', keywords: ['khách sạn'] },
  { category: 'Thiên nhiên và công viên', keywords: ['công viên', 'hồ', 'vườn'] },
  { category: 'Vui chơi giải trí', keywords: ['quảng trường', 'nhà hát', 'trung tâm văn hóa', 'nhà chọc trời', 'nhà cao tầng', 'rạp'] },
  { category: 'Di tích lịch sử', keywords: ['bảo tàng', 'di tích', 'tòa thị chính', 'tượng đài', 'đài tưởng niệm', 'cột cờ', 'bưu điện', 'thư viện', 'công trình kiến trúc', 'dinh', 'tòa nhà', 'đồn'] }
]
const EXCLUDE_KEYWORDS = ['phường', 'xã', 'trường', 'lãnh sự', 'bệnh viện', 'sân bay', 'nhà tù', 'trận', 'công ty', 'bank', 'department', 'nghĩa trang', 'tank', 'kênh', 'cầu', 'đường', 'đô thị', 'vòng xuyến', 'ga ']

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getJSON(url, { retries = 3 } = {}) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(60000) })
      if (res.status === 429 || res.status >= 500) { await sleep(2000 * (i + 1)); continue }
      if (!res.ok) return null
      return await res.json()
    } catch (e) {
      await sleep(1500 * (i + 1))
    }
  }
  return null
}

function pickCategory(typeLabels) {
  const labels = typeLabels.map((t) => t.toLowerCase())
  if (labels.some((l) => EXCLUDE_KEYWORDS.some((k) => l.includes(k))) && !labels.some((l) => CATEGORY_RULES.some((r) => r.keywords.some((k) => l.includes(k))))) return null
  for (const rule of CATEGORY_RULES) {
    if (labels.some((l) => rule.keywords.some((k) => l.includes(k)))) return rule.category
  }
  return null
}

// ---------- 1. Wikidata ----------
async function fetchWikidata() {
  const sparql = `
SELECT ?item ?itemLabel ?coord ?typeLabel ?article ?descVi ?commonsCat ?adm1Label ?adm2Label WHERE {
  ?item wdt:P131* wd:Q1854; wdt:P625 ?coord; wdt:P18 ?image.
  OPTIONAL { ?item wdt:P31 ?type }
  OPTIONAL { ?item wdt:P373 ?commonsCat }
  OPTIONAL { ?item wdt:P131 ?adm1 }
  OPTIONAL { ?item wdt:P131/wdt:P131 ?adm2 }
  OPTIONAL { ?article schema:about ?item; schema:isPartOf <https://vi.wikipedia.org/> }
  OPTIONAL { ?item schema:description ?descVi FILTER(LANG(?descVi) = "vi") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "vi,en". }
}`
  const data = await getJSON('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(sparql))
  if (!data) throw new Error('Wikidata query failed')

  const byId = new Map()
  for (const b of data.results.bindings) {
    const id = b.item.value.split('/').pop()
    if (!byId.has(id)) {
      const m = /Point\(([-\d.]+) ([-\d.]+)\)/.exec(b.coord.value)
      byId.set(id, {
        wikidataId: id,
        name: b.itemLabel.value,
        lon: Number(m[1]),
        lat: Number(m[2]),
        types: new Set(),
        adminLabels: new Set(),
        wikiTitle: b.article ? decodeURIComponent(b.article.value.split('/wiki/').pop()) : null,
        wdDescription: b.descVi?.value || null,
        commonsCat: b.commonsCat?.value || null
      })
    }
    if (b.typeLabel?.value) byId.get(id).types.add(b.typeLabel.value)
    for (const k of ['adm1Label', 'adm2Label']) if (b[k]?.value) byId.get(id).adminLabels.add(b[k].value)
  }

  const places = []
  for (const p of byId.values()) {
    if (/^Q\d+$/.test(p.name)) continue // không có label
    if (p.lat < BBOX.minLat || p.lat > BBOX.maxLat || p.lon < BBOX.minLon || p.lon > BBOX.maxLon) continue
    const category = pickCategory([...p.types])
    if (!category) continue
    const district = [...p.adminLabels].find((l) => /^(Quận|Huyện|Thành phố) /.test(l) && l !== 'Thành phố Hồ Chí Minh') || null
    places.push({ ...p, types: [...p.types], category, district })
  }
  return places
}

// ---------- 2. Wikipedia vi: mô tả ----------
function trimToSentence(text, max = 480) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('.'))
  return lastStop > 120 ? cut.slice(0, lastStop + 1) : cut.slice(0, cut.lastIndexOf(' ')) + '…'
}

async function fetchDescription(p) {
  if (p.wikiTitle) {
    const data = await getJSON(`https://vi.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(p.wikiTitle)}`)
    if (data?.extract && data.extract.length >= 40) {
      return { text: trimToSentence(data.extract), source: data.content_urls?.desktop?.page || null, license: 'CC BY-SA 4.0 (Wikipedia)' }
    }
  }
  if (p.wdDescription && p.wdDescription.length >= 10) {
    return { text: p.wdDescription, source: `https://www.wikidata.org/wiki/${p.wikidataId}`, license: 'CC0 (Wikidata)' }
  }
  return null
}

// ---------- 3. Commons: ảnh + giấy phép ----------
const stripHtml = (s) => (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
const OPEN_LICENSE = /^(cc[ -]|public domain|pd|attribution|cc0)/i

async function commonsImageInfo(titles) {
  const out = []
  for (let i = 0; i < titles.length; i += 40) {
    const chunk = titles.slice(i, i + 40)
    const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata|mime&iiurlwidth=1200&titles=' + encodeURIComponent(chunk.join('|'))
    const data = await getJSON(url)
    for (const page of Object.values(data?.query?.pages || {})) {
      const ii = page.imageinfo?.[0]
      if (!ii || !/^image\/(jpeg|png)$/.test(ii.mime)) continue
      const meta = ii.extmetadata || {}
      const license = stripHtml(meta.LicenseShortName?.value)
      if (!OPEN_LICENSE.test(license)) continue
      out.push({
        url: ii.thumburl || ii.url,
        title: page.title,
        author: stripHtml(meta.Artist?.value) || 'Unknown',
        license,
        source: ii.descriptionurl
      })
    }
    await sleep(300)
  }
  return out
}

async function fetchImages(p) {
  const titles = []
  // P18 (ảnh chính) lấy qua entity data
  const ent = await getJSON(`https://www.wikidata.org/wiki/Special:EntityData/${p.wikidataId}.json`)
  const claims = ent?.entities?.[p.wikidataId]?.claims?.P18 || []
  for (const c of claims) {
    const v = c.mainsnak?.datavalue?.value
    if (v) titles.push('File:' + v)
  }
  // Thêm ảnh trong category Commons
  if (p.commonsCat && titles.length < MAX_IMAGES) {
    const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtype=file&cmlimit=15&cmtitle=' + encodeURIComponent('Category:' + p.commonsCat)
    const data = await getJSON(url)
    for (const m of data?.query?.categorymembers || []) {
      if (/\.(jpe?g|png)$/i.test(m.title) && !titles.includes(m.title)) titles.push(m.title)
    }
  }
  const infos = await commonsImageInfo(titles.slice(0, MAX_IMAGES * 2))
  return infos.slice(0, MAX_IMAGES)
}

// ---------- 4. Nominatim: địa chỉ ----------
async function fetchAddress(p) {
  const data = await getJSON(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=vi&addressdetails=1&zoom=18&lat=${p.lat}&lon=${p.lon}`)
  await sleep(1100) // chính sách Nominatim: tối đa 1 req/s
  if (!data?.address) return null
  const a = data.address
  const street = [a.house_number, a.road].filter(Boolean).join(' ')
  const ward = a.suburb || a.quarter || a.neighbourhood || a.village || null
  const parts = [street, ward, a.city || a.state].filter(Boolean)
  const address = [...new Set(parts)].join(', ')
  return { address, ward, displayName: data.display_name }
}

// ---------- main ----------
async function main() {
  console.log('Fetching Wikidata...')
  let places = await fetchWikidata()
  console.log(`Wikidata: ${places.length} địa điểm hợp lệ trong vùng`)
  places = places.slice(0, MAX_PLACES)

  const results = []
  for (const [i, p] of places.entries()) {
    process.stdout.write(`[${i + 1}/${places.length}] ${p.name} ... `)
    const [desc, images] = await Promise.all([fetchDescription(p), fetchImages(p)])
    if (!desc || images.length === 0) { console.log('bỏ (thiếu mô tả hoặc ảnh có giấy phép mở)'); continue }
    const addr = await fetchAddress(p)
    if (!addr?.address || addr.address.length < 5) { console.log('bỏ (không có địa chỉ)'); continue }

    results.push({
      wikidataId: p.wikidataId,
      name: p.name,
      category: p.category,
      types: p.types,
      description: desc.text,
      descriptionSource: { url: desc.source, license: desc.license },
      address: addr.address,
      wardName: addr.ward,
      district: p.district || addr.ward, // Wikidata còn lưu quận cũ; nếu không có thì dùng tên phường
      location: { type: 'Point', coordinates: [p.lon, p.lat] },
      images: images.map((im) => ({ url: im.url, author: im.author, license: im.license, source: im.source }))
    })
    console.log(`ok (${images.length} ảnh)`)
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
  fs.writeFileSync(OUT_FILE, JSON.stringify({ crawledAt: new Date().toISOString(), count: results.length, places: results }, null, 2), 'utf8')
  console.log(`\nĐã ghi ${results.length} địa điểm vào ${OUT_FILE}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
