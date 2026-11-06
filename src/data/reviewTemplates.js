// Đánh giá mẫu theo LOẠI địa điểm (không nhắc món ăn/quán cho di tích, công viên, phố đi bộ...).
// Dùng chung cho seedRealisticData.js và scripts/fixSeedReviews.js.
// Không gắn chi tiết riêng của một địa điểm cụ thể để tránh nêu sai sự thật.

export const REVIEW_TEMPLATES = {
  history: [
    { rating: 5, comment: 'Công trình mang đậm dấu ấn lịch sử của Sài Gòn, không gian trang nghiêm và được bảo tồn rất chỉn chu. Nên dành ít nhất một tiếng để đi hết các khu trưng bày.' },
    { rating: 5, comment: 'Đến đây mới thấy hết giá trị của di tích. Có nhiều hiện vật, hình ảnh tư liệu quý, đi cùng người thân lớn tuổi nghe kể chuyện rất xúc động.' },
    { rating: 4, comment: 'Kiến trúc đẹp, nhiều góc chụp ảnh cổ kính. Nên đi buổi sáng cho đỡ nắng và đỡ đông, ăn mặc lịch sự khi vào tham quan.' },
    { rating: 4, comment: 'Địa điểm rất đáng ghé khi đến TP.HCM. Biển chỉ dẫn rõ ràng, nhân viên hỗ trợ nhiệt tình, phù hợp cả đi gia đình lẫn đi học tập.' }
  ],
  religious: [
    { rating: 5, comment: 'Không gian thanh tịnh, kiến trúc cổ kính và rất sạch sẽ. Đến đây thấy lòng nhẹ nhàng hơn hẳn giữa nhịp sống ồn ào của thành phố.' },
    { rating: 5, comment: 'Nơi rất đẹp để tìm chút bình yên cuối tuần. Nên ăn mặc kín đáo, nói nhỏ và giữ yên lặng để tôn trọng người đến lễ.' },
    { rating: 4, comment: 'Kiến trúc và các chi tiết điêu khắc rất tinh xảo, chụp ảnh lên hình đẹp. Dịp lễ, rằm hay mùng một thường khá đông nên đi sớm sẽ thoải mái hơn.' },
    { rating: 4, comment: 'Đường đi dễ tìm, có chỗ gửi xe gần đó. Phù hợp để ghé thăm, tìm hiểu văn hóa và lịch sử của khu vực.' }
  ],
  nature: [
    { rating: 5, comment: 'Không gian xanh mát hiếm có giữa trung tâm thành phố, nhiều cây to cho bóng râm. Đi dạo, chạy bộ buổi sáng hoặc chiều mát đều rất dễ chịu.' },
    { rating: 5, comment: 'Dẫn cả gia đình đi dã ngoại cuối tuần, trẻ con chạy chơi thoải mái. Lối đi rộng, sạch sẽ, có nhiều ghế đá để nghỉ chân.' },
    { rating: 4, comment: 'Chỗ này hợp để thư giãn và chụp ảnh. Nên mang theo nước uống và nón nếu đi buổi trưa vì trời Sài Gòn khá nắng.' },
    { rating: 4, comment: 'Không khí trong lành, ít ồn ào hơn mình tưởng. Cuối tuần khá đông nên đi sáng sớm sẽ yên tĩnh hơn.' }
  ],
  shopping: [
    { rating: 5, comment: 'Nhiều gian hàng để dạo và chọn quà mang về, hàng hóa phong phú. Nên đi sớm trong ngày để tránh đông và có nhiều lựa chọn hơn.' },
    { rating: 4, comment: 'Khu mua sắm sầm uất, đi bộ dạo xem rất vui. Nhớ trả giá nhẹ nhàng ở khu chợ và giữ cẩn thận đồ đạc cá nhân.' },
    { rating: 4, comment: 'Không gian rộng rãi, có máy lạnh, chỗ gửi xe thuận tiện. Phù hợp đi cả nhà, vừa mua sắm vừa đi dạo.' },
    { rating: 5, comment: 'Một điểm đến quen thuộc của người Sài Gòn, đi một lần là hiểu vì sao nơi này lúc nào cũng nhộn nhịp.' }
  ],
  entertainment: [
    { rating: 5, comment: 'Không khí rất sôi động, buổi tối đông vui và nhiều người đi dạo. Là nơi lý tưởng để cảm nhận nhịp sống về đêm của Sài Gòn.' },
    { rating: 5, comment: 'Góc chụp ảnh check-in lên hình đẹp, nhất là vào buổi chiều tối khi lên đèn. Cuối tuần khá đông nên đi sớm để dễ tìm chỗ đứng.' },
    { rating: 4, comment: 'Đi cùng bạn bè hoặc gia đình đều hợp. Nên đi sớm hoặc dùng xe công cộng để di chuyển thuận tiện hơn vào giờ cao điểm.' },
    { rating: 4, comment: 'Địa điểm rất đáng ghé khi đến Sài Gòn, có nhiều hoạt động để xem và trải nghiệm. Nhớ mang theo máy ảnh vì có nhiều góc đẹp.' }
  ],
  cafe: [
    { rating: 5, comment: 'Quán có gu, không gian dễ chịu và nhạc nhẹ nhàng, ngồi làm việc hay đọc sách đều hợp. Đồ uống ngon, nhân viên thân thiện.' },
    { rating: 4, comment: 'Đồ uống đúng vị, giá hợp lý so với khu vực trung tâm. Giờ cao điểm hơi đông nên đến sớm sẽ chọn được chỗ ngồi ưng ý.' },
    { rating: 4, comment: 'Decor đẹp, nhiều góc chụp ảnh. Có wifi và ổ điện, thích hợp ngồi lâu cùng bạn bè hoặc làm việc nhẹ.' },
    { rating: 5, comment: 'Một trong những quán cà phê mình hay quay lại, không gian thoáng và yên tĩnh vừa đủ. Sẽ giới thiệu thêm cho bạn bè.' }
  ],
  food: [
    { rating: 5, comment: 'Món ăn ngon, vị đậm đà đúng kiểu Sài Gòn. Phục vụ nhanh nhẹn dù quán khá đông, giá hợp lý so với chất lượng.' },
    { rating: 4, comment: 'Nguyên liệu tươi, nêm nếm vừa miệng. Giờ cao điểm phải chờ một chút nhưng đáng để thử, chắc chắn sẽ quay lại.' },
    { rating: 5, comment: 'Dẫn bạn bè từ nơi khác đến thử, ai cũng khen. Khẩu phần đầy đặn, giá cả phải chăng cho một bữa ăn no.' },
    { rating: 4, comment: 'Quán đơn giản nhưng sạch sẽ, nhân viên nhiệt tình. Nên đến sớm vào cuối tuần vì quán thường khá đông.' }
  ],
  hotel: [
    { rating: 5, comment: 'Vị trí thuận tiện, phòng sạch sẽ và nhân viên đón tiếp chu đáo. Đi bộ ra các điểm tham quan chính rất dễ.' },
    { rating: 4, comment: 'Kiến trúc đẹp, không gian sang trọng và yên tĩnh. Bữa sáng ổn, dịch vụ chuyên nghiệp, phù hợp cho chuyến đi công tác hoặc nghỉ ngơi.' },
    { rating: 4, comment: 'Phòng thoáng, giường êm, giá hợp lý so với khu vực trung tâm. Lễ tân hỗ trợ nhiều thông tin du lịch hữu ích.' },
    { rating: 5, comment: 'Trải nghiệm lưu trú rất dễ chịu, mình sẽ chọn lại cho lần sau khi quay lại Sài Gòn.' }
  ],
  general: [
    { rating: 5, comment: 'Địa điểm rất đáng ghé thăm khi đến Sài Gòn, không gian dễ chịu và thuận tiện đi lại.' },
    { rating: 4, comment: 'Đi một lần là thấy hài lòng, nên đến vào buổi sáng hoặc chiều mát để thoải mái hơn.' },
    { rating: 4, comment: 'Nơi này phù hợp đi cùng gia đình và bạn bè, có nhiều góc đẹp để chụp ảnh.' }
  ]
}

// Tên danh mục (type "place") -> nhóm mẫu đánh giá
const CATEGORY_GROUP = {
  'Di tích lịch sử': 'history',
  'Địa điểm tôn giáo': 'religious',
  'Thiên nhiên và công viên': 'nature',
  'Mua sắm': 'shopping',
  'Vui chơi giải trí': 'entertainment',
  'Quán cà phê và trà': 'cafe',
  'Ẩm thực': 'food',
  'Ẩm thực đường phố': 'food',
  'Khách sạn và lưu trú': 'hotel'
}

export function reviewGroupForCategory(categoryName) {
  return CATEGORY_GROUP[categoryName] || 'general'
}

export function getReviewTemplates(categoryName) {
  return REVIEW_TEMPLATES[reviewGroupForCategory(categoryName)]
}

// Chọn mẫu theo vị trí (xác định, không random) để chạy lại script cho kết quả ổn định
export function pickReviewTemplate(categoryName, index = 0) {
  const list = getReviewTemplates(categoryName)
  return list[Math.abs(index) % list.length]
}

// 8 câu đánh giá chung chung cũ (copy-paste cho mọi địa điểm) - dùng để nhận diện review seed trong DB
export const LEGACY_GENERIC_COMMENTS = [
  'Địa điểm tuyệt đẹp và mang đậm dấu ấn lịch sử hào hùng của Sài Gòn! Không gian trang nghiêm, kiến trúc cổ kính được bảo tồn rất chỉn chu. Rất tự hào về thành phố.',
  'Góc chụp ảnh check-in siêu đỉnh, lên hình đẹp mê ly luôn mọi người ơi! Khuyên các bạn nên đi vào buổi sáng sớm nắng xiên để có ánh sáng đẹp nhất.',
  'Đồ ăn ở đây ngon xuất sắc, hương vị đậm đà chuẩn vị bản xứ. Phục vụ nhanh nhẹn dù quán rất đông khách, giá cả hợp lý so với chất lượng.',
  'Lần đầu dẫn gia đình đến đây trải nghiệm, bố mẹ mình thích mê luôn! Không gian thoáng đãng mát mẻ, nhân viên nhiệt tình chu đáo.',
  'Món ăn làm cực kỳ tâm huyết, nguyên liệu tươi rói. Nước sốt chấm cùng bánh mì giòn tan ngon đỉnh chóp, chắc chắn sẽ quay lại nhiều lần.',
  'Quán decor phong cách vintage rất có gu, view ngắm phố phường cực chill. Đồ uống ngon, nhạc nhẹ nhàng thư giãn thích hợp làm việc và đọc sách.',
  'Trải nghiệm ngắm hoàng hôn ở đây thực sự mãn nhãn! Không khí trong lành, lộng gió, cảm giác mọi âu lo mệt mỏi đều tan biến hết.',
  'Địa điểm rất đáng ghé thăm khi đến Sài Gòn. Bạn nên chuẩn bị trang phục lịch sự và mang theo máy ảnh vì có rất nhiều góc đẹp.'
]
