import dns from 'dns'
dns.setServers(['8.8.8.8', '8.8.4.4'])
dns.setDefaultResultOrder('ipv4first')

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const placeImagesMap = {
  'Nhà Thờ Đức Bà Sài Gòn': [
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1586004631071-8be9d3e5aa5c?auto=format&fit=crop&w=1200&q=80'
  ],
  'Bưu Điện Trung Tâm Sài Gòn': [
    'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80'
  ],
  'Dinh Độc Lập (Hội Trường Thống Nhất)': [
    'https://images.unsplash.com/photo-1592114714621-ccc6cacad26b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80'
  ],
  'Chợ Bến Thành': [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80'
  ],
  'Phố Đi Bộ Nguyễn Huệ': [
    'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1566473742367-2197f951af96?auto=format&fit=crop&w=1200&q=80'
  ],
  'Landmark 81 & Công Viên Vinhomes Central Park': [
    'https://images.unsplash.com/photo-1592313794735-b9558968c0c7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1574007557239-acf6863bc375?auto=format&fit=crop&w=1200&q=80'
  ],
  'Chung Cư Cà Phê 42 Nguyễn Huệ': [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80'
  ],
  'Bến Bạch Đằng & Ga Tàu Thuỷ Saigon Waterbus': [
    'https://images.unsplash.com/photo-1566473742367-2197f951af96?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1563553907269-96f95e89d4a9?auto=format&fit=crop&w=1200&q=80'
  ],
  'Bảo Tàng Mỹ Thuật TP. Hồ Chí Minh': [
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80'
  ],
  'Nhà Thờ Tân Định (Nhà Thờ Màu Hồng)': [
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1586004631071-8be9d3e5aa5c?auto=format&fit=crop&w=1200&q=80'
  ],
  'Bảo Tàng Chứng Tích Chiến Tranh': [
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1592114714621-ccc6cacad26b?auto=format&fit=crop&w=1200&q=80'
  ],
  'Hồ Con Rùa (Công Trường Quốc Tế)': [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'
  ],
  'Bánh Mì Huỳnh Hoa': [
    'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'
  ],
  'Cơm Tấm Ba Ghiền': [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80'
  ],
  'Phở Lệ (Võ Văn Tần)': [
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=1200&q=80'
  ],
  'Chùa Bà Thiên Hậu (Hội Quán Tuệ Thành)': [
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80'
  ],
  'Chợ Lớn - Chợ Bình Tây': [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'
  ],
  'Khu Phố Sủi Cảo Hà Tôn Quyền': [
    'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80'
  ],
  'Phố Tây Bùi Viện (Khu Phố Không Ngủ)': [
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=1200&q=80'
  ],
  'The Workshop Coffee': [
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80'
  ],
  'Cầu Ánh Sao & Hồ Bán Nguyệt Phú Mỹ Hưng': [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1566473742367-2197f951af96?auto=format&fit=crop&w=1200&q=80'
  ],
  'Phố Ốc Vĩnh Khánh (Quận 4)': [
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80'
  ],
  'Bến Nhà Rồng - Bảo Tàng Hồ Chí Minh': [
    'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80'
  ],
  'Cheese Coffee Pasteur': [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80'
  ],
  'Thảo Cầm Viên Sài Gòn (Sở Thú)': [
    'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
  ],
  'Công Viên Bờ Sông Sài Gòn Thủ Thiêm': [
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1566473742367-2197f951af96?auto=format&fit=crop&w=1200&q=80'
  ],
  'Hẻm Cơm Tấm Đêm Bà Mười (Hàng Xanh)': [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80'
  ],
  'Chùa Ngọc Hoàng (Phước Hải Tự)': [
    'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80'
  ],
  'Nhà Hát Thành Phố (Municipal Theatre)': [
    'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80'
  ],
  'Saigon Skydeck - Tòa Tháp Bitexco': [
    'https://images.unsplash.com/photo-1574007557239-acf6863bc375?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80'
  ],
  'Chợ Tân Định': [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'
  ],
  'Chợ Hoa Hồ Thị Kỷ & Phố Ẩm Thực': [
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80'
  ],
  'Trung Tâm Thương Mại Crescent Mall': [
    'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1574007557239-acf6863bc375?auto=format&fit=crop&w=1200&q=80'
  ],
  'Lẩu Bò Nhà Gỗ Sài Gòn': [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80'
  ],
  'Rang Rang Coffee Thảo Điền': [
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80'
  ],
  'The Myst Dong Khoi (Khách Sạn Di Sản)': [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80'
  ]
}

const blogImagesMap = {
  'Lịch trình 24h oanh tạc trọn vẹn trung tâm Quận 1: Từ cà phê bệt đến phố không ngủ': {
    mainImage: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
    contentImages: [
      'https://images.unsplash.com/photo-1586004631071-8be9d3e5aa5c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566473742367-2197f951af96?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  'Food Tour Chợ Lớn - Quận 5: Cẩm nang ăn sập thiên đường ẩm thực người Hoa': {
    mainImage: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=1200&q=80',
    contentImages: [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  'Trải nghiệm Saigon Waterbus: Ngắm hoàng hôn thành phố triệu đô chỉ 15.000đ': {
    mainImage: 'https://images.unsplash.com/photo-1566473742367-2197f951af96?auto=format&fit=crop&w=1200&q=80',
    contentImages: [
      'https://images.unsplash.com/photo-1563553907269-96f95e89d4a9?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  'Top 7 quán cà phê chung cư cổ view đẹp ngất ngây giữa trung tâm Sài Gòn': {
    mainImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    contentImages: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  'Khám phá kiến trúc Đông Dương tuyệt mỹ tại các bảo tàng trăm tuổi ở Sài Gòn': {
    mainImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    contentImages: [
      'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  'Đi tìm đĩa cơm tấm đêm ngon nhất Sài Gòn: Sườn nướng mật ong thơm nức mũi': {
    mainImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
    contentImages: [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  'Cẩm nang check-in Nhà thờ màu hồng Tân Định: Góc chụp và thời điểm lý tưởng': {
    mainImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    contentImages: [
      'https://images.unsplash.com/photo-1586004631071-8be9d3e5aa5c?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  'Hồ Con Rùa về đêm: Thiên đường quà vặt tuổi thơ gắn liền bao thế hệ học sinh sinh viên': {
    mainImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    contentImages: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'
    ]
  }
}

async function updateDatabase(dbName, uri) {
  console.log(`\n========================================`)
  console.log(`🔄 Updating Database: [${dbName}]`)
  console.log(`========================================`)

  const connection = await mongoose.createConnection(uri).asPromise()
  const Place = connection.model('Place', new mongoose.Schema({}, { strict: false }), 'places')
  const Blog = connection.model('Blog', new mongoose.Schema({}, { strict: false }), 'blogs')

  // Update Places
  let placeUpdatedCount = 0
  for (const [name, images] of Object.entries(placeImagesMap)) {
    const res = await Place.updateMany(
      { name: name },
      { $set: { images: images } }
    )
    if (res.modifiedCount > 0 || res.matchedCount > 0) {
      placeUpdatedCount++
    }
  }
  console.log(`✅ Places updated in [${dbName}]: ${placeUpdatedCount}/${Object.keys(placeImagesMap).length}`)

  // Update Blogs
  let blogUpdatedCount = 0
  for (const [title, imgObj] of Object.entries(blogImagesMap)) {
    const blog = await Blog.findOne({ title })
    if (blog) {
      let content = blog.content || []
      let imgIdx = 0
      content = content.map(item => {
        if (item.type === 'image') {
          const newUrl = imgObj.contentImages[imgIdx] || imgObj.mainImage
          imgIdx++
          return { ...item, url: newUrl }
        }
        return item
      })

      await Blog.updateOne(
        { _id: blog._id },
        {
          $set: {
            mainImage: imgObj.mainImage,
            content: content
          }
        }
      )
      blogUpdatedCount++
    }
  }
  console.log(`✅ Blogs updated in [${dbName}]: ${blogUpdatedCount}/${Object.keys(blogImagesMap).length}`)

  // Update Checkins to use the new place images
  const Checkin = connection.model('Checkin', new mongoose.Schema({}, { strict: false }), 'checkins')
  const allPlaces = await Place.find({}).select('_id images')
  const placeImgLookup = new Map()
  allPlaces.forEach(p => {
    if (p.images && p.images.length > 0) {
      placeImgLookup.set(p._id.toString(), p.images.slice(0, 1))
    }
  })

  const checkins = await Checkin.find({})
  let checkinUpdatedCount = 0
  for (const ch of checkins) {
    if (ch.placeId && placeImgLookup.has(ch.placeId.toString())) {
      await Checkin.updateOne(
        { _id: ch._id },
        { $set: { imgList: placeImgLookup.get(ch.placeId.toString()) } }
      )
      checkinUpdatedCount++
    }
  }
  console.log(`✅ Checkins updated in [${dbName}]: ${checkinUpdatedCount}/${checkins.length}`)

  await connection.close()
}

async function updateSeedRealisticDataFile() {
  const seedFilePath = path.join(__dirname, 'seedRealisticData.js')
  console.log(`\n📝 Updating file: ${seedFilePath}`)
  let fileContent = fs.readFileSync(seedFilePath, 'utf8')

  // Replace placesRaw section images
  for (const [name, images] of Object.entries(placeImagesMap)) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(name:\\s*['"]${escapedName}['"][\\s\\S]*?images:\\s*\\[)[\\s\\S]*?(\\])`, 'm')
    const formattedImages = images.map(img => `      '${img}'`).join(',\n')
    fileContent = fileContent.replace(regex, `$1\n${formattedImages}\n    $2`)
  }

  // Replace blog rawBlogsData images
  for (const [title, imgObj] of Object.entries(blogImagesMap)) {
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const mainImgRegex = new RegExp(`(title:\\s*['"]${escapedTitle}['"][\\s\\S]*?mainImage:\\s*)['"][^'"]+['"]`, 'm')
    fileContent = fileContent.replace(mainImgRegex, `$1'${imgObj.mainImage}'`)
  }

  // Replace individual blog content images
  fileContent = fileContent.replace(
    /https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/d\/d7\/Bas%C3%ADlica_de_Nuestra_Se%C3%B1ora%2C_Ciudad_Ho_Chi_Minh%2C_Vietnam%2C_2013-08-14%2C_DD_03\.JPG/g,
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80'
  )
  fileContent = fileContent.replace(
    /https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/f\/fd\/Bach_Dang_Station_-_Sai_Gon_Water_Bus\.jpg/g,
    'https://images.unsplash.com/photo-1566473742367-2197f951af96?auto=format&fit=crop&w=1200&q=80'
  )
  fileContent = fileContent.replace(
    /https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/8\/8b\/Ba_Son_Bridge_%2853175234769%29\.jpg/g,
    'https://images.unsplash.com/photo-1563553907269-96f95e89d4a9?auto=format&fit=crop&w=1200&q=80'
  )
  fileContent = fileContent.replace(
    /https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/0\/04\/Saigon_cafe_apartment\.jpg/g,
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80'
  )
  fileContent = fileContent.replace(
    /https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/e\/e5\/B%E1%BA%A3o_t%C3%A0ng_M%E1%BB%B9_thu%E1%BA%ADt_Th%C3%A0nh_ph%E1%BB%91_H%E1%BB%93_Ch%C3%AD_Minh\.jpg/g,
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80'
  )
  fileContent = fileContent.replace(
    /https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/e\/ea\/C%C6%A1m_t%E1%BA%A5m_b%C3%AC_ch%E1%BA%A3\.jpg/g,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80'
  )
  fileContent = fileContent.replace(
    /https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/1\/11\/T%C3%A2n_%C4%90%E1%BB%8Bnh_Church_20190922\.jpg/g,
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80'
  )
  fileContent = fileContent.replace(
    /https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/d\/d6\/Cong_truong_con_rua\.jpg/g,
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'
  )

  fs.writeFileSync(seedFilePath, fileContent, 'utf8')
  console.log(`✅ File seedRealisticData.js successfully updated!`)
}

async function run() {
  const baseUri = 'mongodb+srv://dudisoftwaresaletwo_db_user:qkXJB4A4P2GhBMPw@dudisoftware.5daxh8m.mongodb.net/?appName=DudiSoftware'
  const uriSaigondi = 'mongodb+srv://dudisoftwaresaletwo_db_user:qkXJB4A4P2GhBMPw@dudisoftware.5daxh8m.mongodb.net/saigondi?appName=DudiSoftware'
  const uriSaiGonGo = 'mongodb+srv://dudisoftwaresaletwo_db_user:qkXJB4A4P2GhBMPw@dudisoftware.5daxh8m.mongodb.net/SaiGonGo?appName=DudiSoftware'

  await updateSeedRealisticDataFile()
  await updateDatabase('saigondi', uriSaigondi)
  await updateDatabase('SaiGonGo', uriSaiGonGo)

  console.log(`\n🎉 All images successfully updated across databases and seed files!`)
  process.exit(0)
}

run().catch(err => {
  console.error('❌ Error executing update:', err)
  process.exit(1)
})
