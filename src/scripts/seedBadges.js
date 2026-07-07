import dns from 'dns'
dns.setServers(['8.8.8.8', '8.8.4.4'])
dns.setDefaultResultOrder('ipv4first')

// Sử dụng dynamic import để đảm bảo DNS config được chạy trước khi load mongoose
const Badge = (await import('../models/Badge.model.js')).default
const { connectDB } = await import('../config/db.js')
const mongoose = (await import('mongoose')).default

const badges = [
  {
    rankOrder: 1,
    name: 'Tân Binh Khám Phá',
    description: 'Huy hiệu cho người mới bắt đầu khám phá Sài Gòn Di.',
    icon: 'https://via.placeholder.com/150/FFC107/000000?Text=TanBinh',
    type: 'rank',
    condition: {
      createBlog: { points: 2, count: 1 },
      likeBlog: { points: 1, count: 3 },
      checkinPlace: { points: 2, count: 1 }
    },
    pointsRequired: 5,
    isActive: true
  },
  {
    rankOrder: 2,
    name: 'Blogger Năng Nổ',
    description: 'Trao cho việc tương tác tích cực với các bài blog.',
    icon: 'https://via.placeholder.com/150/F44336/FFFFFF?Text=BloggerNangNo',
    type: 'rank',
    condition: {
      createBlog: { points: 5, count: 3 },
      likeBlog: { points: 1, count: 5 },
      commentBlog: { points: 2, count: 2 }
    },
    pointsRequired: 10,
    isActive: true
  },
  {
    rankOrder: 3,
    name: 'Người Chia Sẻ',
    description: 'Trao cho việc tương tác và chia sẻ nội dung.',
    icon: 'https://via.placeholder.com/150/2196F3/FFFFFF?Text=NguoiChiaSe',
    type: 'rank',
    condition: {
      shareBlog: { points: 3, count: 2 },
      sharePlace: { points: 3, count: 2 },
      favoritePlace: { points: 1, count: 5 }
    },
    pointsRequired: 15,
    isActive: true
  },
  {
    rankOrder: 4,
    name: 'Người Sáng Tạo Địa Điểm',
    description: 'Trao cho việc thêm các địa điểm mới và đóng góp.',
    icon: 'https://via.placeholder.com/150/4CAF50/FFFFFF?Text=NguoiSangTao',
    type: 'rank',
    condition: {
      createPlace: { points: 5, count: 3 },
      commentPlace: { points: 2, count: 3 },
      checkinPlace: { points: 3, count: 3 }
    },
    pointsRequired: 20,
    isActive: true
  },
  {
    rankOrder: 5,
    name: 'Bậc Thầy Khám Phá',
    description: 'Trao cho sự tương tác nhất quán trên toàn nền tảng.',
    icon: 'https://via.placeholder.com/150/9C27B0/FFFFFF?Text=BacThay',
    type: 'rank',
    condition: {
      createBlog: { points: 5, count: 5 },
      createPlace: { points: 5, count: 5 },
      checkinPlace: { points: 5, count: 5 }
    },
    pointsRequired: 30,
    isActive: true
  },
  {
    rankOrder: 6,
    name: 'Người Kể Chuyện',
    description: 'Dành cho người dùng có nhiều bài blog hay.',
    icon: 'https://via.placeholder.com/150/FF9800/FFFFFF?Text=NguoiKeChuyen',
    type: 'rank',
    condition: {
      createBlog: { points: 5, count: 5 },
      likeBlog: { points: 1, count: 20 },
      shareBlog: { points: 5, count: 5 }
    },
    pointsRequired: 40,
    isActive: true
  },
  {
    rankOrder: 7,
    name: 'Nhà Phê Bình Ẩm Thực',
    description: 'Dành cho người dùng review nhiều địa điểm ăn uống.',
    icon: 'https://via.placeholder.com/150/795548/FFFFFF?Text=NhaPheBinh',
    type: 'rank',
    condition: {
      commentPlace: { points: 3, count: 5 },
      checkinPlace: { points: 2, count: 5 },
      favoritePlace: { points: 1, count: 5 }
    },
    pointsRequired: 50,
    isActive: true
  },
  {
    rankOrder: 8,
    name: 'Hướng Dẫn Viên Du Lịch',
    description: 'Dành cho người dùng đóng góp nhiều địa điểm du lịch.',
    icon: 'https://via.placeholder.com/150/00BCD4/FFFFFF?Text=HDVDuLich',
    type: 'rank',
    condition: {
      createPlace: { points: 5, count: 5 },
      commentPlace: { points: 3, count: 5 },
      checkinPlace: { points: 2, count: 5 }
    },
    pointsRequired: 60,
    isActive: true
  },
  {
    rankOrder: 9,
    name: 'Nhiếp Ảnh Gia',
    description: 'Dành cho người dùng đăng nhiều ảnh đẹp.',
    icon: 'https://via.placeholder.com/150/607D8B/FFFFFF?Text=NhiepAnhGia',
    type: 'rank',
    condition: {
      createPlace: { points: 2, count: 1 },
      createBlog: { points: 2, count: 1 },
      checkinPlace: { points: 1, count: 3 }
    },
    pointsRequired: 70,
    isActive: true
  },
  {
    rankOrder: 10,
    name: 'Người Bạn Của Mọi Nhà',
    description: 'Dành cho người dùng tương tác nhiều với cộng đồng.',
    icon: 'https://via.placeholder.com/150/E91E63/FFFFFF?Text=NguoiBan',
    type: 'rank',
    condition: {
      likeBlog: { points: 1, count: 20 },
      commentPlace: { points: 2, count: 10 },
      favoritePlace: { points: 1, count: 10 }
    },
    pointsRequired: 80,
    isActive: true
  }
];

const syncBadges = async () => {
  try {
    await connectDB();

    for (const badgeData of badges) {
      await Badge.findOneAndUpdate(
        { name: badgeData.name },
        badgeData,
        { upsert: true, new: true }
      );
    }

    console.log('Rank badges synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing badges:', error);
  } finally {
    mongoose.connection.close();
  }
};

syncBadges();
