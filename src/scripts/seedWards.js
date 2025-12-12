const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const Ward = require('../models/Ward.model.js')
const db = require('../config/db.js')

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
    await db.connectDB()
    await Ward.default.deleteMany({})

    const result = await Ward.default.insertMany(wards)
    return result
  } catch (error) {
    throw new Error(`Error seeding wards: ${error.message}`)
  } finally {
    mongoose.disconnect()
  }
}

seedWards()
