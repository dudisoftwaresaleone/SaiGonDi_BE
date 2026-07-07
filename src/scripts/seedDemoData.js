import dns from 'dns'
dns.setServers(['8.8.8.8', '8.8.4.4'])
dns.setDefaultResultOrder('ipv4first')

import mongoose from 'mongoose'
const { connectDB } = await import('../config/db.js')
const User = (await import('../models/User.model.js')).default
const Place = (await import('../models/Place.model.js')).default
const Blog = (await import('../models/Blog.model.js')).default
const Category = (await import('../models/Category.model.js')).default
const Ward = (await import('../models/Ward.model.js')).default

const seedDemoData = async () => {
  try {
    await connectDB()
    console.log('Connected to database to seed demo data...')

    // 1. Clear old demo data (only demo ones to avoid clearing everything if needed, but for fresh start let's clear)
    await User.deleteMany({ email: { $in: ['admin@saigondi.com', 'user@saigondi.com'] } })
    
    // 2. Create Users
    console.log('Creating demo users...')
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'SaiGonDi',
      email: 'admin@saigondi.com',
      password: 'password123', // Will be hashed by pre-save hook
      role: 'admin',
      provider: 'local',
      emailVerified: true
    })

    const normalUser = await User.create({
      firstName: 'Khánh',
      lastName: 'Nguyễn',
      email: 'user@saigondi.com',
      password: 'password123',
      role: 'user',
      provider: 'local',
      emailVerified: true
    })

    // 3. Get Wards & Categories
    const wards = await Ward.find().limit(5)
    if (wards.length === 0) {
      throw new Error('No wards found in database. Please run seedWards.js script first.')
    }
    const defaultWard = wards[0]

    const placeCategories = await Category.find({ type: 'place' })
    const blogCategories = await Category.find({ type: 'blog' })

    if (placeCategories.length === 0 || blogCategories.length === 0) {
      throw new Error('No categories found. Please run seedBlogCategories.js first.')
    }

    // 4. Create Places (Destinations)
    console.log('Creating demo places...')
    await Place.deleteMany({ createdBy: { $in: [adminUser._id, normalUser._id] } })

    const placesData = [
      {
        name: 'Nhà Thờ Đức Bà Sài Gòn',
        description: 'Vương cung thánh đường Chính tòa Đức Mẹ Vô nhiễm Nguyên tội là nhà thờ chính tòa của Tổng giáo phận Thành phố Hồ Chí Minh, một trong những công trình kiến trúc cổ độc đáo của Sài Gòn.',
        categories: [placeCategories[2]._id], // Di tích lịch sử
        address: '01 Công xã Paris, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        ward: defaultWard._id,
        district: 'Quận 1',
        location: { type: 'Point', coordinates: [106.6990, 10.7798] },
        images: ['https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800'],
        status: 'approved',
        avgRating: 4.8,
        totalRatings: 120,
        createdBy: adminUser._id
      },
      {
        name: 'Bưu Điện Trung Tâm Sài Gòn',
        description: 'Bưu điện trung tâm Thành phố Hồ Chí Minh là một trong những công trình kiến trúc tiêu biểu tại Thành phố Hồ Chí Minh, được người Pháp xây dựng trong khoảng các năm 1886–1891.',
        categories: [placeCategories[2]._id], // Di tích lịch sử
        address: '02 Công xã Paris, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        ward: defaultWard._id,
        district: 'Quận 1',
        location: { type: 'Point', coordinates: [106.7001, 10.7799] },
        images: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'],
        status: 'approved',
        avgRating: 4.6,
        totalRatings: 95,
        createdBy: adminUser._id
      },
      {
        name: 'Chợ Bến Thành',
        description: 'Chợ Bến Thành là một trong những địa điểm tiêu biểu của Thành phố Hồ Chí Minh. Nơi đây không chỉ là trung tâm buôn bán sầm uất mà còn là điểm tham quan hấp dẫn du khách.',
        categories: [placeCategories[3]._id], // Mua sắm
        address: 'Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
        ward: defaultWard._id,
        district: 'Quận 1',
        location: { type: 'Point', coordinates: [106.6984, 10.7719] },
        images: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'],
        status: 'approved',
        avgRating: 4.4,
        totalRatings: 150,
        createdBy: adminUser._id
      },
      {
        name: 'Phố Đi Bộ Nguyễn Huệ',
        description: 'Phố đi bộ Nguyễn Huệ là một quảng trường lớn nằm ở trung tâm Quận 1. Nơi đây thường xuyên diễn ra các hoạt động văn hóa đường phố sôi động về đêm.',
        categories: [placeCategories[1]._id], // Vui chơi giải trí
        address: 'Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        ward: defaultWard._id,
        district: 'Quận 1',
        location: { type: 'Point', coordinates: [106.7022, 10.7741] },
        images: ['https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800'],
        status: 'approved',
        avgRating: 4.7,
        totalRatings: 210,
        createdBy: adminUser._id
      }
    ]

    const createdPlaces = await Place.create(placesData)
    console.log(`Created ${createdPlaces.length} demo places successfully!`)

    // 5. Create Blogs
    console.log('Creating demo blogs...')
    await Blog.deleteMany({ authorId: { $in: [adminUser._id, normalUser._id] } })

    const blogsData = [
      {
        title: 'Khám phá ẩm thực đường phố Sài Gòn quanh chợ Bến Thành',
        slug: 'kham-pha-am-thuc-duong-pho-sai-gon-quanh-cho-ben-thanh',
        mainImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
        content: [
          { type: 'text', value: 'Sài Gòn là thiên đường ẩm thực đường phố sầm uất nhất cả nước. Nếu bạn có dịp ghé thăm chợ Bến Thành, hãy dành bụng để thưởng thức vô số món ăn đặc sắc như bánh canh trảng bàng, chè mâm, hủ tiếu nam vang ngay các con hẻm xung quanh nhé.' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', caption: 'Ẩm thực phong phú quanh chợ đêm' }
        ],
        categories: [blogCategories[4]._id], // Ẩm thực đặc sắc
        tags: ['saigon', 'food', 'benthanh'],
        authorId: normalUser._id,
        ward: defaultWard._id,
        status: 'approved',
        viewCount: 150,
        totalLikes: 12
      },
      {
        title: 'Lịch trình 1 ngày oanh tạc trung tâm Quận 1 cho người mới',
        slug: 'lich-trinh-1-ngay-oanh-tac-trung-tam-quan-1-cho-nguoi-moi',
        mainImage: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
        content: [
          { type: 'text', value: 'Với lịch trình 1 ngày, bạn hoàn toàn có thể check-in toàn bộ các địa điểm nổi tiếng nhất Sài Gòn. Sáng bắt đầu bằng ly cà phê bệt tại nhà thờ Đức Bà, trưa ghé bưu điện thành phố, chiều đi chợ Bến Thành mua sắm và tối dạo mát ở phố đi bộ Nguyễn Huệ.' }
        ],
        categories: [blogCategories[0]._id], // Lịch trình
        tags: ['saigon', 'travel', 'quan1'],
        authorId: normalUser._id,
        ward: defaultWard._id,
        status: 'approved',
        viewCount: 320,
        totalLikes: 25
      }
    ]

    const createdBlogs = await Blog.insertMany(blogsData)
    console.log(`Created ${createdBlogs.length} demo blogs successfully!`)

    console.log('All demo data seeded successfully to MongoDB Cloud!')

  } catch (error) {
    console.error('Error seeding demo data:', error)
  } finally {
    mongoose.disconnect()
  }
}

seedDemoData()
