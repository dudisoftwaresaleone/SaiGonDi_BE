import dns from 'dns'
dns.setServers(['8.8.8.8', '8.8.4.4'])
dns.setDefaultResultOrder('ipv4first')
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
const Review = (await import('../models/Review.model.js')).default

const categoriesData = [
  { name: 'Lịch trình', description: 'Các bài viết liên quan đến các lịch trình tại Sài Gòn.', type: 'blog' },
  { name: 'Kinh nghiệm', description: 'Chia sẻ mẹo hữu ích, kinh nghiệm đi lại, ăn uống và vui chơi tại Sài Gòn.', type: 'blog' },
  { name: 'Sự kiện', description: 'Khám phá những sự kiện tại Sài Gòn', type: 'blog' },
  { name: 'Ảnh đẹp', description: 'Ảnh đẹp, vui chơi tại Sài Gòn', type: 'blog' },
  { name: 'Ẩm thực đặc sắc', description: 'Khám phá món ngon và đặc sản Sài Gòn.', type: 'blog' },
  { name: 'Review chi tiết', description: 'Đánh giá địa điểm, quán ăn và dịch vụ.', type: 'blog' },
  { name: 'Top-list gợi ý', description: 'Danh sách gợi ý trải nghiệm thú vị ở Sài Gòn.', type: 'blog' },
  { name: 'Ẩm thực', description: 'Tìm hiểu về món ngon của Sài Gòn.', type: 'place' },
  { name: 'Vui chơi giải trí', description: 'Khám phá các điểm vui chơi và giải trí tại Sài Gòn.', type: 'place' },
  { name: 'Di tích lịch sử', description: 'Tham quan các di tích lịch sử nổi tiếng ở Sài Gòn.', type: 'place' },
  { name: 'Mua sắm', description: 'Khám phá các trung tâm mua sắm và chợ nổi tiếng.', type: 'place' },
  { name: 'Thiên nhiên và công viên', description: 'Thư giãn tại các công viên và khu vực thiên nhiên.', type: 'place' },
  { name: 'Địa điểm tôn giáo', description: 'Tham quan các địa điểm tôn giáo và tâm linh.', type: 'place' },
  { name: 'Khách sạn và lưu trú', description: 'Tìm hiểu về các khách sạn và nơi lưu trú tốt nhất.', type: 'place' },
  { name: 'Ẩm thực đường phố', description: 'Khám phá các món ăn đường phố đặc sắc.', type: 'place' },
  { name: 'Quán cà phê và trà', description: 'Tìm hiểu về các quán cà phê và trà nổi tiếng.', type: 'place' }
]

const badgesData = [
  {
    rankOrder: 1,
    name: 'Tân Binh Khám Phá',
    description: 'Huy hiệu cho người mới bắt đầu khám phá Sài Gòn Di.',
    icon: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=300',
    type: 'rank',
    condition: { createBlog: { points: 2, count: 1 }, likeBlog: { points: 1, count: 3 }, checkinPlace: { points: 2, count: 1 } },
    pointsRequired: 5,
    isActive: true
  },
  {
    rankOrder: 2,
    name: 'Blogger Năng Nổ',
    description: 'Trao cho việc tương tác tích cực với các bài blog.',
    icon: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=300',
    type: 'rank',
    condition: { createBlog: { points: 5, count: 3 }, likeBlog: { points: 1, count: 5 }, commentBlog: { points: 2, count: 2 } },
    pointsRequired: 10,
    isActive: true
  },
  {
    rankOrder: 3,
    name: 'Người Chia Sẻ',
    description: 'Trao cho việc tương tác và chia sẻ nội dung.',
    icon: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300',
    type: 'rank',
    condition: { shareBlog: { points: 3, count: 2 }, sharePlace: { points: 3, count: 2 }, favoritePlace: { points: 1, count: 5 } },
    pointsRequired: 15,
    isActive: true
  }
]

const seedAll = async () => {
  try {
    console.log('🔄 Đang kết nối tới MongoDB database...')
    await connectDB()
    console.log('✅ Đã kết nối MongoDB thành công!')

    // 1. Seed Wards
    console.log('\n📌 1/6. Nạp dữ liệu Phường/Xã (Wards)...')
    const wardsPath = path.join(__dirname, '..', 'data', 'wards.json')
    let rawWards = JSON.parse(fs.readFileSync(wardsPath, 'utf-8'))
    const processedWards = rawWards.map(ward => ({
      ...ward,
      location: {
        type: 'Point',
        coordinates: ward.location?.coordinates?.length === 2 ? [ward.location.coordinates[1], ward.location.coordinates[0]] : [106.6990, 10.7798]
      }
    }))
    await Ward.deleteMany({})
    const createdWards = await Ward.insertMany(processedWards)
    console.log(`✅ Đã nạp thành công ${createdWards.length} Phường/Xã!`)
    const defaultWard = createdWards[0]

    // 2. Seed Categories
    console.log('\n📌 2/6. Nạp dữ liệu Danh mục (Categories)...')
    await Category.deleteMany({})
    const createdCategories = await Category.insertMany(categoriesData)
    console.log(`✅ Đã nạp thành công ${createdCategories.length} Danh mục!`)

    const placeCatMap = {}
    const blogCatMap = {}
    createdCategories.forEach(c => {
      if (c.type === 'place') placeCatMap[c.name] = c._id
      if (c.type === 'blog') blogCatMap[c.name] = c._id
    })

    // 3. Seed Badges
    console.log('\n📌 3/6. Nạp dữ liệu Huy hiệu (Badges)...')
    await Badge.deleteMany({})
    const createdBadges = await Badge.insertMany(badgesData)
    console.log(`✅ Đã nạp thành công ${createdBadges.length} Huy hiệu!`)

    // 4. Seed Users
    console.log('\n📌 4/6. Nạp tài khoản mẫu (Users)...')
    await User.deleteMany({ email: { $in: ['admin@saigondi.com', 'user@saigondi.com', 'khanh.nguyen@saigondi.com'] } })
    
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'SaiGonDi',
      email: 'admin@saigondi.com',
      password: 'password123',
      role: 'admin',
      provider: 'local',
      emailVerified: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
    })

    const demoUser = await User.create({
      firstName: 'Khánh',
      lastName: 'Nguyễn',
      email: 'user@saigondi.com',
      password: 'password123',
      role: 'user',
      provider: 'local',
      emailVerified: true,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
      bio: 'Yêu Sài Gòn, thích đi cà phê và chụp ảnh góc phố.'
    })
    console.log('✅ Đã nạp 2 tài khoản mẫu: admin@saigondi.com / user@saigondi.com (mật khẩu: password123)')

    // 5. Seed Places
    console.log('\n📌 5/6. Nạp dữ liệu Địa điểm (Places)...')
    await Place.deleteMany({})

    const placesData = [
      {
        name: 'Nhà Thờ Đức Bà Sài Gòn',
        description: 'Vương cung thánh đường Chính tòa Đức Mẹ Vô nhiễm Nguyên tội là một trong những công trình kiến trúc cổ độc đáo và tiêu biểu nhất của Thành phố Hồ Chí Minh.',
        categories: [placeCatMap['Di tích lịch sử'] || createdCategories[0]._id],
        address: '01 Công xã Paris, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        ward: defaultWard._id,
        district: 'Quận 1',
        location: { type: 'Point', coordinates: [106.6990, 10.7798] },
        images: [
          'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1000',
          'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1000'
        ],
        status: 'approved',
        avgRating: 4.9,
        totalRatings: 320,
        viewCount: 1540,
        totalLikes: 142,
        createdBy: adminUser._id
      },
      {
        name: 'Bưu Điện Trung Tâm Sài Gòn',
        description: 'Bưu điện trung tâm TP.HCM mang phong cách kiến trúc Phục Hưng pha lẫn kiến trúc Pháp cổ, điểm check-in lịch sử biểu tượng đối diện Nhà Thờ Đức Bà.',
        categories: [placeCatMap['Di tích lịch sử'] || createdCategories[0]._id],
        address: '02 Công xã Paris, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        ward: defaultWard._id,
        district: 'Quận 1',
        location: { type: 'Point', coordinates: [106.7001, 10.7799] },
        images: [
          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1000'
        ],
        status: 'approved',
        avgRating: 4.7,
        totalRatings: 210,
        viewCount: 980,
        totalLikes: 89,
        createdBy: adminUser._id
      },
      {
        name: 'Chợ Bến Thành',
        description: 'Ngôi chợ lịch sử nổi tiếng nhất Sài Gòn với 4 cổng Đông Tây Nam Bắc. Nơi tụ họp hàng nghìn gian hàng ẩm thực đường phố, quà lưu niệm và đặc sản.',
        categories: [placeCatMap['Mua sắm'] || placeCatMap['Ẩm thực đường phố'] || createdCategories[0]._id],
        address: 'Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
        ward: defaultWard._id,
        district: 'Quận 1',
        location: { type: 'Point', coordinates: [106.6984, 10.7719] },
        images: [
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000'
        ],
        status: 'approved',
        avgRating: 4.5,
        totalRatings: 450,
        viewCount: 2300,
        totalLikes: 210,
        createdBy: adminUser._id
      },
      {
        name: 'Phố Đi Bộ Nguyễn Huệ',
        description: 'Quảng trường đại lộ hiện đại nhất trung tâm Quận 1, nơi tập trung các hoạt động vui chơi giải trí đường phố sôi động, ngắm cảnh xe cộ và nhạc nước về đêm.',
        categories: [placeCatMap['Vui chơi giải trí'] || createdCategories[0]._id],
        address: 'Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        ward: defaultWard._id,
        district: 'Quận 1',
        location: { type: 'Point', coordinates: [106.7022, 10.7741] },
        images: [
          'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=1000'
        ],
        status: 'approved',
        avgRating: 4.8,
        totalRatings: 510,
        viewCount: 3100,
        totalLikes: 350,
        createdBy: adminUser._id
      },
      {
        name: 'Landmark 81 & Công Viên Ven Sông',
        description: 'Tòa tháp cao nhất Việt Nam nổi bật bên sông Sài Gòn. Nơi hội tụ trung tâm thương mại cao cấp, rạp chiếu phim và công viên ven sông xanh mát rợp bóng.',
        categories: [placeCatMap['Vui chơi giải trí'] || placeCatMap['Thiên nhiên và công viên'] || createdCategories[0]._id],
        address: '720A Điện Biên Phủ, Phường 22, Quận Bình Thạnh, TP. Hồ Chí Minh',
        ward: defaultWard._id,
        district: 'Bình Thạnh',
        location: { type: 'Point', coordinates: [106.7217, 10.7951] },
        images: [
          'https://images.unsplash.com/photo-1574007557239-acf6863bc375?w=1000'
        ],
        status: 'approved',
        avgRating: 4.9,
        totalRatings: 680,
        viewCount: 4500,
        totalLikes: 420,
        createdBy: adminUser._id
      },
      {
        name: 'Chung Cư Cà Phê 42 Nguyễn Huệ',
        description: 'Dãy chung cư cũ độc đáo quy tụ hàng chục quán cà phê phong cách Vintage ngắm trọn góc nhìn bao quát ra Phố Đi Bộ Nguyễn Huệ.',
        categories: [placeCatMap['Quán cà phê và trà'] || createdCategories[0]._id],
        address: '42 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        ward: defaultWard._id,
        district: 'Quận 1',
        location: { type: 'Point', coordinates: [106.7025, 10.7745] },
        images: [
          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000'
        ],
        status: 'approved',
        avgRating: 4.6,
        totalRatings: 180,
        viewCount: 1200,
        totalLikes: 115,
        createdBy: demoUser._id
      }
    ]

    const createdPlaces = await Place.create(placesData)
    console.log(`✅ Đã nạp thành công ${createdPlaces.length} Địa điểm du lịch/ẩm thực!`)

    // 6. Seed Blogs
    console.log('\n📌 6/6. Nạp dữ liệu Bài viết (Blogs)...')
    await Blog.deleteMany({})

    const blogsData = [
      {
        title: 'Khám phá ẩm thực đường phố Sài Gòn quanh chợ Bến Thành',
        slug: 'kham-pha-am-thuc-duong-pho-sai-gon-quanh-cho-ben-thanh',
        mainImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000',
        content: [
          { type: 'text', value: 'Sài Gòn là thiên đường ẩm thực đường phố sầm uất nhất cả nước. Nếu bạn có dịp ghé thăm chợ Bến Thành, hãy dành bụng để thưởng thức vô số món ăn đặc sắc như bánh canh trảng bàng, chè mâm, hủ tiếu nam vang ngay các con hẻm xung quanh nhé.' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000', caption: 'Ẩm thực phong phú quanh chợ đêm Bến Thành' }
        ],
        categories: [blogCatMap['Ẩm thực đặc sắc'] || createdCategories[0]._id],
        tags: ['saigon', 'food', 'benthanh', 'amthuc'],
        privacy: 'public',
        status: 'approved',
        authorId: demoUser._id,
        ward: defaultWard._id,
        viewCount: 380,
        totalLikes: 42
      },
      {
        title: 'Lịch trình 1 ngày "oanh tạc" trọn vẹn trung tâm Quận 1 Sài Gòn',
        slug: 'lich-trinh-1-ngay-oanh-tac-tron-ven-trung-tam-quan-1-sai-gon',
        mainImage: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1000',
        content: [
          { type: 'text', value: 'Với lịch trình 1 ngày gói gọn, bạn hoàn toàn có thể check-in các biểu tượng kiến trúc lừng danh: Sáng cà phê bệt Nhà Thờ Đức Bà, trưa chụp ảnh Bưu Điện Thành Phố, chiều dạo chợ Bến Thành và tối ngắm hoàng hôn ngắm cảnh phố đi bộ Nguyễn Huệ.' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1000', caption: 'Góc chụp Nhà Thờ Đức Bà rực rỡ buổi sáng' }
        ],
        categories: [blogCatMap['Lịch trình'] || blogCatMap['Kinh nghiệm'] || createdCategories[0]._id],
        tags: ['saigon', 'travel', 'quan1', 'lichtrinh'],
        privacy: 'public',
        status: 'approved',
        authorId: adminUser._id,
        ward: defaultWard._id,
        viewCount: 650,
        totalLikes: 85
      },
      {
        title: 'Top 5 quán cà phê chung cư cổ ngắm view Sài Gòn siêu thơ mộng',
        slug: 'top-5-quan-ca-phe-chung-cu-co-ngam-view-sai-gon-sieu-tho-mong',
        mainImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000',
        content: [
          { type: 'text', value: 'Chung cư 42 Nguyễn Huệ là tọa độ quen thuộc của các tín đồ mê cà phê. Mỗi tầng chung cư mang một màu sắc và phong cách decor riêng biệt, từ không gian retro cổ điển đến hiện đại sang chảnh ngắm trọn đại lộ Nguyễn Huệ.' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000', caption: 'Không gian cà phê ngập tràn ánh sáng' }
        ],
        categories: [blogCatMap['Top-list gợi ý'] || createdCategories[0]._id],
        tags: ['caphe', 'saigon', 'nguyenhue', 'toplist'],
        privacy: 'public',
        status: 'approved',
        authorId: demoUser._id,
        ward: defaultWard._id,
        viewCount: 420,
        totalLikes: 56
      }
    ]

    const createdBlogs = await Blog.create(blogsData)
    console.log(`✅ Đã nạp thành công ${createdBlogs.length} Bài viết (Blogs)!`)

    // Create Reviews for Places
    console.log('\n📌 Tạo đánh giá mẫu (Reviews)...')
    await Review.deleteMany({})
    await Review.create([
      {
        placeId: createdPlaces[0]._id,
        userId: demoUser._id,
        rating: 5,
        comment: 'Nhà thờ kiến trúc rất đẹp và trang nghiêm, vị trí ngay trung tâm vô cùng thuận tiện!',
        images: ['https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800']
      },
      {
        placeId: createdPlaces[2]._id,
        userId: adminUser._id,
        rating: 4,
        comment: 'Chợ Bến Thành rất đông vui sầm uất, nhiều món ăn ngon đặc trưng Sài Gòn.',
        images: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800']
      }
    ])
    console.log('✅ Đã nạp thành công các đánh giá mẫu!')

    console.log('\n🎉 ========================================================')
    console.log('🚀 TẤT CẢ DỮ LIỆU MẪU ĐÃ ĐƯỢC NẠP THÀNH CÔNG VÀO MONGODB!')
    console.log('========================================================\n')

  } catch (error) {
    console.error('❌ Lỗi khi nạp dữ liệu:', error)
  } finally {
    await mongoose.disconnect()
    console.log('👋 Đã đóng kết nối MongoDB.')
  }
}

seedAll()
