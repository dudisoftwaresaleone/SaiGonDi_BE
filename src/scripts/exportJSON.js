import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { connectDB } = await import('../config/db.js')
const User = (await import('../models/User.model.js')).default
const Place = (await import('../models/Place.model.js')).default
const Blog = (await import('../models/Blog.model.js')).default
const Category = (await import('../models/Category.model.js')).default
const Ward = (await import('../models/Ward.model.js')).default
const Badge = (await import('../models/Badge.model.js')).default

const exportJSON = async () => {
  try {
    await connectDB()
    const exportDir = path.join(__dirname, '..', 'data', 'mongo_import_json')
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true })
    }

    const collections = [
      { name: 'wards.json', data: await Ward.find().lean() },
      { name: 'categories.json', data: await Category.find().lean() },
      { name: 'badges.json', data: await Badge.find().lean() },
      { name: 'users.json', data: await User.find().lean() },
      { name: 'places.json', data: await Place.find().lean() },
      { name: 'blogs.json', data: await Blog.find().lean() }
    ]

    for (const item of collections) {
      const filePath = path.join(exportDir, item.name)
      fs.writeFileSync(filePath, JSON.stringify(item.data, null, 2), 'utf-8')
      console.log(`Exported ${item.name} (${item.data.length} docs)`)
    }

    console.log('\nAll collections exported to JSON successfully!')
  } catch (err) {
    console.error('Export error:', err)
  } finally {
    mongoose.disconnect()
  }
}

exportJSON()
