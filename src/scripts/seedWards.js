import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dns from 'dns'
dns.setServers(['8.8.8.8', '8.8.4.4'])
dns.setDefaultResultOrder('ipv4first')

// Dynamic imports
const Ward = (await import('../models/Ward.model.js')).default
const { connectDB } = await import('../config/db.js')
const mongoose = (await import('mongoose')).default

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const wardsPath = path.join(__dirname, '..', 'data', 'wards.json')
let wards = JSON.parse(fs.readFileSync(wardsPath, 'utf-8'))

wards = wards.map(ward => {
  const newWard = { ...ward };
  if (newWard.location && newWard.location.coordinates && newWard.location.coordinates.length === 2) {
    newWard.location = {
      type: 'Point',
      coordinates: [newWard.location.coordinates[1], newWard.location.coordinates[0]]
    };
  } else {
    newWard.location = {
      type: 'Point',
      coordinates: [0, 0]
    };
  }
  return newWard;
});

const seedWards = async () => {
  try {
    await connectDB()
    await Ward.deleteMany({})

    const result = await Ward.insertMany(wards)
    console.log('Wards seeded successfully.')
    return result
  } catch (error) {
    console.error(`Error seeding wards: ${error.message}`)
  } finally {
    mongoose.disconnect()
  }
}

seedWards()
