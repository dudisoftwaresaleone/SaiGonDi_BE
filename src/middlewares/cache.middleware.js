// Cache phản hồi GET trong bộ nhớ (theo URL) cho các endpoint công khai, đọc nhiều.
// Mục đích: giảm số truy vấn Mongo khi nhiều khách cùng mở trang / khi server vừa khởi động lại.
// Chỉ lưu phản hồi 200; có giới hạn số mục để không phình bộ nhớ.
const MAX_ENTRIES = 300
const store = new Map() // key -> { expires, body, tag }

export const cacheResponse = (ttlSeconds = 60, tag = 'default') => (req, res, next) => {
  if (req.method !== 'GET') return next()

  const key = `${tag}:${req.originalUrl}`
  const hit = store.get(key)
  if (hit && hit.expires > Date.now()) {
    res.set('X-Cache', 'HIT')
    return res.status(200).json(hit.body)
  }

  const originalJson = res.json.bind(res)
  res.json = (body) => {
    if (res.statusCode === 200) {
      if (store.size >= MAX_ENTRIES) store.delete(store.keys().next().value)
      store.set(key, { expires: Date.now() + ttlSeconds * 1000, body, tag })
    }
    res.set('X-Cache', 'MISS')
    return originalJson(body)
  }
  next()
}

export const clearCache = (tag) => {
  for (const [key, entry] of store) {
    if (!tag || entry.tag === tag) store.delete(key)
  }
}

// Dùng ở router: mọi request ghi (POST/PUT/PATCH/DELETE) thành công sẽ xoá cache của nhóm `tag`
export const invalidateCacheOnWrite = (tag) => (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'OPTIONS' && req.method !== 'HEAD') {
    res.on('finish', () => {
      if (res.statusCode < 400) clearCache(tag)
    })
  }
  next()
}
