import { pathToFileURL } from 'url'
import path from 'path'
import fs from 'fs'

const baseDir = path.join(process.cwd(), 'src')

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('~/')) {

    // Bỏ "~/" để lấy đường dẫn chính xác
    let target = path.join(baseDir, specifier.replace(/^~\//, ''))

    // Nếu file không có .js thì tự thêm vào
    if (!path.extname(target)) {
      if (fs.existsSync(target + '.js')) {
        target += '.js'
      }
    }

    return {
      url: pathToFileURL(target).href,
      shortCircuit: true
    }
  }

  return nextResolve(specifier, context)
}
