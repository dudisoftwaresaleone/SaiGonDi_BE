// Tiện ích tìm kiếm tiếng Việt không phân biệt dấu / hoa thường.
//   normalizeText('Bánh Mì Huỳnh Hoa') -> 'banh mi huynh hoa'
//   buildDiacriticRegex('banh mi')  -> RegExp khớp cả "bánh mì" lẫn "banh mi" trong dữ liệu
// Dùng regex (không cần migrate dữ liệu hay thêm cột) vì dữ liệu chỉ vài trăm địa điểm.

const COMBINING = '\\u0300-\\u036f'

const VI_VARIANTS = {
  a: 'aàáảãạăằắẳẵặâầấẩẫậ',
  e: 'eèéẻẽẹêềếểễệ',
  i: 'iìíỉĩị',
  o: 'oòóỏõọôồốổỗộơờớởỡợ',
  u: 'uùúủũụưừứửữự',
  y: 'yỳýỷỹỵ',
  d: 'dđ'
}

export function normalizeText(input) {
  if (input === undefined || input === null) return ''
  return String(input)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function escapeRegex(input) {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Mỗi chữ cái gốc -> lớp ký tự gồm mọi dạng có dấu; cho phép thêm dấu rời (dữ liệu lưu dạng NFD).
export function buildDiacriticRegex(input, flags = 'i') {
  const normalized = normalizeText(input)
  const pattern = Array.from(normalized)
    .map((ch) => {
      const variants = VI_VARIANTS[ch]
      if (variants) {
        return `[${variants}${variants.toUpperCase()}][${COMBINING}]*`
      }
      return escapeRegex(ch)
    })
    .join('')
  return new RegExp(pattern, flags)
}
