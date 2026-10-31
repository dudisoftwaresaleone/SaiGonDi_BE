// 8 bài blog hướng dẫn về địa điểm thật ở Sài Gòn (thay cho các bài mẫu ngắn trước đây).
// - Ảnh dùng ảnh thật của đúng địa điểm trong placeImages.json (đã tải về frontend).
// - Mỗi bài có phần "Lưu ý" nhắc kiểm tra lại giờ/giá vì thông tin thay đổi.
// - Dữ kiện lịch sử/số liệu chỉ ghi khi đã đối chiếu ít nhất một nguồn; chỗ nguồn không thống nhất thì không nêu.
// content: text hỗ trợ HTML cơ bản (h2, h3, p, ul/li, strong, em, blockquote); image có caption khớp với ảnh.
import { placeImages } from '../utils/localImages.js'

const img = (slug, n = 1) => {
  const url = placeImages[slug]?.[n - 1]
  if (!url) throw new Error(`Thiếu ảnh ${slug} #${n} trong placeImages.json`)
  return url
}
const text = (value) => ({ type: 'text', value })
const image = (slug, n, caption) => ({ type: 'image', url: img(slug, n), caption })

export const blogArticles = [
  // 1 ────────────────────────────────────────────────────────────────────────────
  {
    matchTitle: 'Lịch trình 24h oanh tạc',
    title: 'Lịch trình 24 giờ ở trung tâm Sài Gòn: đi bộ từ Nhà thờ Đức Bà đến phố Bùi Viện',
    categoryName: 'Lịch trình gợi ý',
    tags: ['saigon', 'trungtam', 'lichtrinh', 'dulich', 'dibo'],
    mainImage: img('nha-tho-duc-ba-sai-gon', 1),
    content: [
      text('<p>Khu trung tâm Sài Gòn có một lợi thế hiếm thấy ở các đô thị lớn: những điểm đến nổi tiếng nhất nằm cách nhau chỉ vài trăm mét đến khoảng một cây số. Nếu chỉ có một ngày, bạn hoàn toàn có thể đi bộ qua các công trình thuộc địa, một ngôi chợ trăm năm, bờ sông và hai con phố đi bộ mà không cần thuê xe riêng. Lịch trình dưới đây sắp xếp theo thứ tự địa lý để bạn đỡ phải đi lại, kèm những điều nên biết trước khi đến từng nơi.</p>'),
      text('<h2>Trước khi đi</h2>'),
      text('<ul><li>Mang giày đã quen chân. Cả lộ trình khoảng 5–6 km nếu đi bộ hết; đoạn Dinh Độc Lập – chợ Bến Thành có thể đi xe công nghệ cho đỡ nắng.</li><li>Giờ mở cửa và giá vé của Dinh Độc Lập, Nhà hát Thành phố hay các điểm tham quan có thu phí thay đổi theo từng thời điểm. Hãy xem lại thông tin chính thức trước khi đến.</li><li>Đi vào các điểm tôn giáo (nhà thờ, chùa) nên mặc kín vai và đầu gối.</li></ul>'),
      text('<h2>Buổi sáng: Nhà thờ Đức Bà và Bưu điện Trung tâm</h2>'),
      text('<p>Bắt đầu tại Công trường Công xã Paris, nơi hai công trình biểu tượng của thành phố đứng đối diện nhau. Nhà thờ Chánh tòa Đức Bà là nhà thờ chính tòa của Tổng giáo phận Sài Gòn, được khởi công từ năm 1863. Cần lưu ý rằng nhà thờ đã được đại trùng tu từ tháng 7/2017 và tiến độ nhiều lần kéo dài, dự kiến đến cuối năm 2027, nên phần tháp chuông thường được che bằng giàn giáo. Nếu bạn muốn ảnh “sạch” thì khó, nhưng đổi lại bạn đang chứng kiến một công cuộc bảo tồn di sản đang diễn ra.</p>'),
      image('nha-tho-duc-ba-sai-gon', 1, 'Nhà thờ Đức Bà và tượng Đức Mẹ Hòa Bình nhìn từ công trường phía trước'),
      text('<p>Ngay bên kia công trường là Bưu điện Trung tâm Sài Gòn, xây trong khoảng 1886–1891 theo đồ án của kiến trúc sư Marie-Alfred Foulhoux, mang phong cách chiết trung: bố cục phương Tây nhưng có nhiều chi tiết trang trí phương Đông. Bước vào trong, bạn sẽ thấy mái vòm cao, dãy quầy giao dịch kiểu cũ và những tấm bản đồ xưa trên tường. Đây vẫn là bưu điện đang hoạt động, vì vậy bạn có thể mua một tấm bưu thiếp và gửi đi ngay tại chỗ.</p>'),
      image('buu-dien-trung-tam-sai-gon', 1, 'Mặt tiền Bưu điện Trung tâm Sài Gòn'),
      text('<h2>Giữa ngày: Dinh Độc Lập và chợ Bến Thành</h2>'),
      text('<p>Từ nhà thờ đi bộ khoảng 10–15 phút là đến Dinh Độc Lập. Đây từng là nơi ở và làm việc của Tổng thống Việt Nam Cộng hòa, gắn với sự kiện ngày 30/4/1975, và hiện là di tích quốc gia đặc biệt. Bên trong có các phòng khánh tiết, phòng họp, khu hầm chỉ huy; bạn nên dành ít nhất một tiếng để đi hết.</p>'),
      image('dinh-doc-lap-hoi-truong-thong-nhat', 1, 'Dinh Độc Lập (Hội trường Thống Nhất) nhìn từ khuôn viên phía trước'),
      text('<p>Buổi trưa, di chuyển đến chợ Bến Thành, ngôi chợ được khởi công xây dựng từ năm 1912. Hình ảnh tháp đồng hồ ở cửa nam được xem là biểu tượng không chính thức của thành phố. Bên trong, dãy hàng ăn uống phục vụ du khách khá tiện cho bữa trưa nhanh; hãy xem giá niêm yết, hỏi giá trước khi gọi món và mặc cả nhẹ nhàng khi mua đồ lưu niệm.</p>'),
      image('cho-ben-thanh', 2, 'Gian chính bên trong chợ Bến Thành'),
      text('<h2>Buổi chiều: Nhà hát Thành phố và bờ sông</h2>'),
      text('<p>Đi bộ về phía đường Đồng Khởi để ngắm Nhà hát Thành phố (Nhà hát Sài Gòn), công trình có mặt tiền hướng ra Công trường Lam Sơn. Nếu không có buổi biểu diễn, bạn vẫn có thể chụp ảnh bên ngoài và nghỉ chân ở các quán cà phê quanh quảng trường.</p>'),
      image('nha-hat-thanh-pho-municipal-theatre', 2, 'Nhà hát Thành phố nhìn từ đường Đồng Khởi'),
      text('<p>Tiếp tục đi thẳng xuống phía sông Sài Gòn đến bến Bạch Đằng. Dải công viên ven sông là chỗ lý tưởng để đón gió chiều và xem hoàng hôn. Nếu còn thời gian, bạn có thể đi thử tuyến buýt sông (xem bài hướng dẫn riêng về Saigon Waterbus trong chuyên mục Review chi tiết).</p>'),
      image('ben-bach-dang-and-ga-tau-thuy-saigon-waterbus', 2, 'Lối đi dọc bờ sông Sài Gòn tại bến Bạch Đằng'),
      text('<h2>Buổi tối: phố đi bộ Nguyễn Huệ và Bùi Viện</h2>'),
      text('<p>Phố đi bộ Nguyễn Huệ chạy thẳng từ Ủy ban Nhân dân Thành phố ra tới sông, là không gian công cộng lớn nhất khu trung tâm, thường có hoạt động đường phố, nhất là vào cuối tuần. Đây là nơi để đi chậm, ngắm người và ngắm những tòa nhà lên đèn.</p>'),
      image('pho-di-bo-nguyen-hue', 3, 'Phố đi bộ Nguyễn Huệ vào ban ngày'),
      text('<p>Kết thúc ngày ở phố Bùi Viện, khu vực sôi động và ồn ào nhất thành phố về đêm, nơi tập trung nhiều quán bar, quán ăn đêm và khách nước ngoài. Hãy giữ kỹ điện thoại, ví và tránh đưa tài sản ra sát lề đường.</p>'),
      image('pho-tay-bui-vien-khu-pho-khong-ngu', 1, 'Cổng phố đi bộ Bùi Viện lên đèn'),
      text('<h2>Gợi ý để chuyến đi trọn vẹn hơn</h2>'),
      text('<ul><li>Đi vào ngày trong tuần nếu muốn bớt đông, đặc biệt ở Dinh Độc Lập và chợ Bến Thành.</li><li>Cố gắng đi các đoạn ngoài trời vào sáng sớm hoặc cuối chiều để tránh nắng gắt giữa trưa.</li><li>Mang theo chai nước và kem chống nắng; các điểm trên lộ trình có nhiều quán cà phê để nghỉ giữa chặng.</li></ul>'),
      text('<p><em>Lưu ý: giờ mở cửa, giá vé và tiến độ trùng tu có thể thay đổi. Hãy kiểm tra thông tin chính thức trước khi khởi hành.</em></p>')
    ]
  },

  // 2 ────────────────────────────────────────────────────────────────────────────
  {
    matchTitle: 'Food Tour Chợ Lớn',
    title: 'Dạo Chợ Lớn một ngày: hội quán, chợ Bình Tây và những món ăn của người Hoa',
    categoryName: 'Ẩm thực đặc sắc',
    tags: ['cholon', 'nguoihoa', 'chobinhtay', 'amthuc', 'dulich'],
    mainImage: img('cho-lon-cho-binh-tay', 1),
    content: [
      text('<p>Chợ Lớn là khu phố của cộng đồng người Hoa ở Sài Gòn, hình thành từ rất sớm và vẫn giữ nhiều nét riêng: hội quán, miếu chùa, những dãy phố buôn bán sỉ và một nền ẩm thực mang dấu ấn Quảng Đông, Triều Châu. Khác với trung tâm Quận 1, nhịp sống ở đây chậm hơn và có phần “đời thường” hơn. Bài này gợi ý một lộ trình đi bộ kết hợp tham quan và ăn uống, đi trong khoảng nửa ngày đến một ngày.</p>'),
      text('<h2>Chợ Bình Tây: điểm khởi đầu</h2>'),
      text('<p>Chợ Bình Tây, còn được gọi là Chợ Lớn Mới, nằm trong khu vực Chợ Lớn và là trung tâm buôn bán sỉ lớn của khu vực này. Phần tòa nhà chính với tháp đồng hồ ở giữa và mái ngói kiểu Hoa rất dễ nhận ra. Bên trong là hàng nghìn gian hàng vải vóc, đồ khô, gia vị, đồ gia dụng; phần lớn phục vụ người mua sỉ nên nhịp mua bán khá nhanh.</p>'),
      image('cho-lon-cho-binh-tay', 1, 'Mặt tiền chợ Bình Tây với tháp đồng hồ ở giữa'),
      image('cho-lon-cho-binh-tay', 2, 'Hoạt động buôn bán quanh khu vực chợ Bình Tây'),
      text('<h2>Chùa Bà Thiên Hậu (Hội quán Tuệ Thành)</h2>'),
      text('<p>Hội quán Tuệ Thành, thường được gọi là Miếu Thiên Hậu hay Chùa Bà Chợ Lớn, là cơ sở tín ngưỡng thờ Thiên Hậu Thánh mẫu. Điểm nổi bật khi bước vào là những vòng hương lớn treo kín trên cao, khói hương bảng lảng và hệ thống tượng gốm, phù điêu trang trí trên mái. Đây là nơi sinh hoạt tín ngưỡng thật sự, nên hãy giữ trang phục kín đáo, nói khẽ và không chụp ảnh sát vào người đang cúng lễ.</p>'),
      image('chua-ba-thien-hau-hoi-quan-tue-thanh', 1, 'Mặt trước Hội quán Tuệ Thành (Chùa Bà Thiên Hậu)'),
      image('chua-ba-thien-hau-hoi-quan-tue-thanh', 3, 'Những vòng hương treo trong chính điện'),
      text('<h2>Hội quán Ôn Lăng và Nhà thờ Cha Tam</h2>'),
      text('<p>Hội quán Ôn Lăng còn được gọi là chùa Ôn Lăng, chùa Quan Âm hay chùa Ông Lào, là ngôi chùa của người Việt gốc Hoa trong một con hẻm nhỏ trên đường Lão Tử. Khuôn viên có bức tường gốm rồng và hồ nước nhỏ rất đáng chú ý.</p>'),
      image('hoi-quan-on-lang', 1, 'Bức tường gốm rồng và hồ nước trong khuôn viên Hội quán Ôn Lăng'),
      text('<p>Không xa đó là Nhà thờ Cha Tam, một nhà thờ cổ trên đường Học Lạc. Điều thú vị là ngôi nhà thờ Công giáo này có phần tháp mang dáng mái cong kiểu Hoa, một minh chứng cho sự hòa trộn văn hóa của khu vực.</p>'),
      image('nha-tho-cha-tam', 1, 'Tháp Nhà thờ Cha Tam với mái cong kiểu Hoa'),
      text('<h2>Ăn gì ở Chợ Lớn?</h2>'),
      text('<p>Chợ Lớn không có “một quán nổi tiếng duy nhất”; thế mạnh của khu này là các món truyền thống được nhiều tiệm cùng làm. Một số món bạn nên tìm thử:</p>'),
      text('<ul><li><strong>Sủi cảo, há cảo, xíu mại, bánh bao</strong>: nhóm món điểm tâm kiểu Quảng. Khu phố quanh đường Hà Tôn Quyền nổi tiếng về món sủi cảo.</li><li><strong>Mì vịt tiềm, mì và hủ tiếu</strong>: nước dùng ninh từ xương và thảo mộc, thường ăn kèm vịt hoặc xá xíu.</li><li><strong>Cháo và các món hầm</strong>: hợp cho bữa sáng sớm hoặc trời mưa.</li><li><strong>Chè</strong>: chè mè đen, chè đậu và các loại chè nấu theo kiểu Hoa để tráng miệng.</li></ul>'),
      text('<p>Bài này cố ý không xếp hạng từng quán vì quán ở Chợ Lớn đổi chủ, đổi giờ và đổi chất lượng khá nhanh. Cách an toàn nhất là chọn quán đông khách địa phương, xem bảng giá niêm yết và đối chiếu với đánh giá gần đây trên bản đồ trước khi vào.</p>'),
      text('<h2>Gợi ý đi lại</h2>'),
      text('<ul><li>Đi vào buổi sáng để tránh nắng và gặp được nhiều món điểm tâm.</li><li>Các điểm tham quan nằm khá gần nhau nhưng đường nhỏ, đông xe máy; có thể kết hợp đi bộ và xe công nghệ giữa các cụm.</li><li>Chợ Kim Biên và các chợ chuyên doanh quanh đây bán sỉ nhiều mặt hàng; nếu chỉ đi tham quan, hãy giữ thái độ lịch sự khi chụp ảnh gian hàng.</li></ul>'),
      image('cho-kim-bien', 1, 'Chợ Kim Biên, một trong những chợ chuyên doanh trong khu Chợ Lớn'),
      text('<p><em>Lưu ý: giờ mở cửa của hội quán và quán ăn có thể thay đổi, đặc biệt trong dịp lễ Tết và ngày rằm.</em></p>')
    ]
  },

  // 3 ────────────────────────────────────────────────────────────────────────────
  {
    matchTitle: 'Trải nghiệm Saigon Waterbus',
    title: 'Đi buýt sông Saigon Waterbus: tuyến, giá vé và cách ngắm thành phố từ mặt nước',
    categoryName: 'Review chi tiết',
    tags: ['waterbus', 'sonsaigon', 'buytsong', 'dulich', 'hoanghon'],
    mainImage: img('ben-bach-dang-and-ga-tau-thuy-saigon-waterbus', 1),
    content: [
      text('<p>Phần lớn du khách quen nhìn Sài Gòn từ trên bờ. Buýt sông Saigon Waterbus cho bạn một góc nhìn khác: dòng sông Sài Gòn với đường chân trời của khu đô thị mới ở một bên và phố cũ ở bên kia, trong một chuyến đi không quá dài và có giá vé thấp. Dưới đây là những gì bạn nên biết trước khi đi.</p>'),
      text('<h2>Tuyến đi và các bến</h2>'),
      text('<p>Tuyến phổ biến nhất dài khoảng 11 km, đi từ bến Bạch Đằng (khu trung tâm) đến bến Linh Đông ở khu vực Thủ Đức. Theo các nguồn du lịch, dọc đường có khoảng 8 bến: Bạch Đằng, Thủ Thiêm, Ba Son, Bình An, Thảo Điền, Thanh Đa, Hiệp Bình Chánh và Linh Đông. Số bến và điểm dừng có thể được điều chỉnh, vì vậy hãy xem lại bản đồ tuyến chính thức trước khi đi.</p>'),
      image('ben-bach-dang-and-ga-tau-thuy-saigon-waterbus', 1, 'Công viên bến Bạch Đằng, điểm xuất phát của tuyến buýt sông'),
      text('<h2>Giá vé và cách mua</h2>'),
      text('<ul><li>Theo các bài hướng dẫn gần đây, vé 15.000 đồng/lượt và 30.000 đồng/vé khứ hồi; một số đối tượng như người cao tuổi, người khuyết tật được miễn vé.</li><li>Có thể mua trực tiếp tại bến hoặc đặt qua website/ứng dụng của đơn vị vận hành.</li><li>Một số nguồn ghi vé không hoàn và không hủy, nên chọn khung giờ chắc chắn đi được.</li></ul>'),
      text('<p>Lịch chạy giữa các nguồn không thống nhất (có nơi ghi chạy cách nhau 30 phút từ buổi sáng đến tối, có nơi ghi chuyến cuối vào khoảng 17:30). Đây là thông tin dễ thay đổi theo mùa và theo ngày, nên cách duy nhất chắc chắn là kiểm tra trên kênh chính thức của Saigon Waterbus ngay trước ngày đi.</p>'),
      text('<h2>Bạn sẽ nhìn thấy gì trên sông?</h2>'),
      text('<p>Rời bến Bạch Đằng, tàu đi qua khu vực Thủ Thiêm với công viên ven sông và các tòa nhà mới, sau đó đến khu Ba Son rồi tiếp tục về phía Bình An, Thảo Điền. Trên đường, tòa nhà cao nhất Việt Nam, Landmark 81, xuất hiện trên đường chân trời. Tòa nhà thuộc tổ hợp Vinhomes Central Park và là một trong những công trình dễ nhận ra nhất của thành phố từ mặt nước.</p>'),
      image('landmark-81-and-cong-vien-vinhomes-central-park', 1, 'Landmark 81 và các tòa nhà ven sông lúc hoàng hôn'),
      image('cong-vien-bo-song-sai-gon-thu-thiem', 1, 'Công viên bờ sông Sài Gòn (Thủ Thiêm) nhìn về phía trung tâm'),
      text('<h2>Mẹo cho chuyến đi</h2>'),
      text('<ul><li>Đi chuyến cuối ngày nếu bạn muốn ngắm hoàng hôn, nhưng hãy chắc chắn về giờ chuyến về vì có thể không còn tàu quay lại.</li><li>Mang nón hoặc kính râm; trên sông ít bóng râm, nắng chiều vẫn khá gắt.</li><li>Chọn chỗ ngồi gần cửa sổ phía bờ bạn muốn ngắm, và đến bến sớm vài phút để dễ chọn.</li><li>Nếu đi khứ hồi, hãy dành thời gian đi dạo ở công viên bến Bạch Đằng trước hoặc sau chuyến đi.</li></ul>'),
      text('<p><em>Lưu ý: giá vé, lịch chạy và danh sách bến trong bài lấy từ các nguồn du lịch và báo chí, có thể đã thay đổi. Hãy xác nhận trên kênh chính thức trước khi đi.</em></p>')
    ]
  },

  // 4 ────────────────────────────────────────────────────────────────────────────
  {
    matchTitle: 'Top 7 quán cà phê chung cư cổ',
    title: 'Chung cư cà phê ở Sài Gòn: ghé 42 Nguyễn Huệ và những tòa nhà cũ giữa trung tâm',
    categoryName: 'Kinh nghiệm du lịch',
    tags: ['chungcu', 'caphe', '42nguyenhue', 'saigoncu', 'checkin'],
    mainImage: img('chung-cu-ca-phe-42-nguyen-hue', 1),
    content: [
      text('<p>Một trong những hình ảnh quen thuộc nhất của Sài Gòn những năm gần đây là những dãy cửa sổ nhiều màu của chung cư cũ ở khu trung tâm, nơi các căn hộ được cải tạo thành quán cà phê, tiệm trà và cửa hàng nhỏ. Điều đặc biệt là đây vẫn là nơi có người dân sinh sống, nên việc ghé thăm cần một chút tinh tế.</p>'),
      text('<h2>Chung cư 42 Nguyễn Huệ</h2>'),
      text('<p>Chung cư 42 Nguyễn Huệ được cho là xây từ năm 1960, nằm ngay trên phố đi bộ Nguyễn Huệ. Nhiều căn hộ ở đây đã được chủ nhà cho thuê để kinh doanh quán cà phê, thường nằm ở các tầng trên như tầng 4, tầng 5. Từ ban công, bạn nhìn thẳng xuống phố đi bộ và dòng người phía dưới, đó là lý do tòa nhà trở thành điểm check-in quen thuộc.</p>'),
      image('chung-cu-ca-phe-42-nguyen-hue', 1, 'Chung cư 42 Nguyễn Huệ nhìn từ phố đi bộ'),
      text('<h2>Ngoài 42 Nguyễn Huệ còn những tòa nào?</h2>'),
      text('<p>Báo chí thường nhắc đến các chung cư lâu đời ở trung tâm như Nguyễn Huệ, Tôn Thất Đạm, Lý Tự Trọng và Phùng Hưng như một nhóm kiến trúc đặc trưng của đô thị Sài Gòn thế kỷ 20. Mỗi tòa có một không khí riêng: cầu thang bộ cũ, hành lang thông gió, ô cửa hoa gió và những lớp sơn bong tróc đầy chất hoài niệm. Tình trạng kinh doanh của từng quán thay đổi nhanh nên bài không giới thiệu từng quán cụ thể; bạn có thể xem các đánh giá gần đây trước khi leo cầu thang.</p>'),
      text('<h2>Cách ghé thăm cho đúng</h2>'),
      text('<ul><li>Đây là nhà ở của người dân: nói khẽ trong hành lang và cầu thang, không đứng chụp ảnh chắn lối đi.</li><li>Một số quán không có thang máy hoặc thang máy không hoạt động thường xuyên; hãy sẵn sàng leo thang bộ.</li><li>Hỏi giá hoặc xem thực đơn trước khi ngồi, đặc biệt ở những quán có view đẹp.</li><li>Đến vào buổi sáng ngày thường nếu muốn yên tĩnh; cuối tuần và buổi tối thường đông hơn.</li></ul>'),
      text('<h2>Kết hợp với phố đi bộ</h2>'),
      text('<p>Vì tòa nhà nằm ngay trên phố đi bộ Nguyễn Huệ, bạn có thể kết hợp ghé quán, rồi đi dạo ra phía sông. Ban ngày dễ quan sát chi tiết kiến trúc của tòa nhà; buổi tối, phố lên đèn và ban công nhìn xuống sẽ có không khí khác.</p>'),
      image('pho-di-bo-nguyen-hue', 4, 'Trụ sở Ủy ban Nhân dân Thành phố ở cuối phố đi bộ Nguyễn Huệ về đêm'),
      text('<p><em>Lưu ý: năm xây dựng 1960 lấy theo bài viết của báo chí; thông tin về các quán thay đổi liên tục, hãy kiểm tra trước khi đến.</em></p>')
    ]
  },

  // 5 ────────────────────────────────────────────────────────────────────────────
  {
    matchTitle: 'Khám phá kiến trúc Đông Dương',
    title: 'Ba bảo tàng trăm tuổi ở Sài Gòn: kiến trúc, hiện vật và cách tham quan',
    categoryName: 'Kinh nghiệm du lịch',
    tags: ['baotang', 'kientruc', 'saigoncu', 'dulich', 'lichsu'],
    mainImage: img('bao-tang-my-thuat-tp-ho-chi-minh', 1),
    content: [
      text('<p>Sài Gòn có nhiều bảo tàng, nhưng ba cái tên dưới đây đáng đến không chỉ vì hiện vật mà còn vì chính ngôi nhà chứa chúng. Cả ba đều là những công trình có từ thời Pháp thuộc hoặc cuối thế kỷ 19 đến đầu thế kỷ 20 và vẫn còn giữ nhiều nét kiến trúc đặc trưng.</p>'),
      text('<h2>Bảo tàng Mỹ thuật TP.HCM</h2>'),
      text('<p>Bảo tàng nằm trên đường Phó Đức Chính, trong ba biệt thự liền kề. Tòa nhà chính gắn với ông Hứa Bổn Hòa (thường gọi là Chú Hỏa), một thương gia giàu có của Sài Gòn xưa; các nguồn thường ghi công trình được xây từ khoảng năm 1929. Phong cách kiến trúc được nhiều tài liệu mô tả là Art Deco pha trộn yếu tố Á và Âu: cầu thang, cửa vòm, gạch hoa và sân trong. Bảo tàng bắt đầu hoạt động từ năm 1987 và trưng bày tranh, tượng và đồ gốm từ nhiều giai đoạn.</p>'),
      image('bao-tang-my-thuat-tp-ho-chi-minh', 1, 'Mặt tiền Bảo tàng Mỹ thuật TP.HCM'),
      image('bao-tang-my-thuat-tp-ho-chi-minh', 4, 'Khoảng sân trong của bảo tàng nhìn từ trên cao'),
      text('<h2>Bảo tàng Lịch sử TP.HCM</h2>'),
      text('<p>Bảo tàng Lịch sử TP.HCM nằm trong khuôn viên Thảo Cầm Viên Sài Gòn, bảo tồn và trưng bày hàng chục ngàn hiện vật trong và ngoài nước. Điểm đặc biệt là kiến trúc “Đông Dương” với mái nhiều tầng uốn cong theo phong cách cung đình phương Đông trên nền bố cục phương Tây. Bạn nên dành thời gian ngắm tòa nhà từ ngoài trước khi vào trong xem các hiện vật.</p>'),
      image('bao-tang-lich-su-thanh-pho-ho-chi-minh', 1, 'Tòa nhà Bảo tàng Lịch sử TP.HCM với mái nhiều tầng kiểu Đông Dương'),
      text('<h2>Bảo tàng Thành phố Hồ Chí Minh</h2>'),
      text('<p>Bảo tàng nằm tại số 65 Lý Tự Trọng, trên khuôn viên rộng gần 2 ha, giới hạn bởi các đường Lý Tự Trọng, Pasteur, Lê Thánh Tôn và Nam Kỳ Khởi Nghĩa. Khuôn viên là nơi trưng bày ngoài trời nhiều hiện vật quân sự, thích hợp để dạo nếu bạn muốn một chỗ yên tĩnh giữa trung tâm.</p>'),
      text('<h2>Mẹo tham quan</h2>'),
      text('<ul><li>Dành 1–1,5 giờ cho mỗi bảo tàng; nếu muốn xem cả ba, nên chia làm hai buổi.</li><li>Kiểm tra ngày nghỉ trong tuần của từng bảo tàng trước khi đi; nhiều nơi nghỉ một ngày cố định.</li><li>Đọc kỹ quy định chụp ảnh và có thể phải gửi túi lớn.</li><li>Đi vào buổi sáng khi trời mát và đông khách ít hơn.</li></ul>'),
      text('<p><em>Lưu ý: năm xây dựng và phong cách kiến trúc ghi theo các nguồn tham khảo phổ biến, các nguồn có thể khác nhau ở năm hoàn thành và tên kiến trúc sư; giờ mở cửa và giá vé có thể thay đổi.</em></p>')
    ]
  },

  // 6 ────────────────────────────────────────────────────────────────────────────
  {
    matchTitle: 'Đi tìm đĩa cơm tấm đêm',
    title: 'Cơm tấm Sài Gòn: từ hạt gạo vỡ đến đĩa sườn bì chả, và cách chọn quán',
    categoryName: 'Ẩm thực đặc sắc',
    tags: ['comtam', 'amthuc', 'saigon', 'monngon', 'foodtour'],
    mainImage: img('hem-com-tam-dem-ba-muoi-hang-xanh', 1),
    content: [
      text('<p>Cơm tấm là món ăn gần như không thể thiếu khi nói về ẩm thực Sài Gòn: có thể ăn vào bữa sáng, trưa, tối hay khuya; có thể ăn ở quán vỉa hè hoặc nhà hàng. Trước khi chọn quán, bạn có thể thấy món ăn thú vị hơn nếu hiểu nó được tạo thành từ những gì.</p>'),
      text('<h2>“Tấm” là gì?</h2>'),
      text('<p>Tấm là những hạt gạo bị vỡ trong quá trình xay xát. Trước đây, loại gạo này rẻ hơn gạo nguyên hạt và thường được người lao động nghèo dùng để nấu cơm. Hạt cơm tấm nhỏ, mềm hơn và dễ tơi, khi ăn kèm các món nướng và nước mắm sẽ cho cảm giác khác hẳn cơm trắng bình thường. Từ một món bình dân, cơm tấm dần trở thành đặc sản.</p>'),
      image('hem-com-tam-dem-ba-muoi-hang-xanh', 1, 'Đĩa cơm tấm sườn nướng (ảnh minh họa món ăn)'),
      text('<h2>Một đĩa cơm tấm có gì?</h2>'),
      text('<ul><li><strong>Sườn nướng</strong>: thường là sườn cốt lết ướp sả, tỏi, đường và nước mắm, nướng trên than để có mùi khói.</li><li><strong>Bì</strong>: da heo thái sợi trộn thính gạo.</li><li><strong>Chả trứng</strong>: trứng, miến và thịt xay hấp hoặc nướng.</li><li><strong>Mỡ hành</strong>: hành lá phi với dầu nóng, rưới lên cơm.</li><li><strong>Dưa leo, cà chua, đồ chua</strong>: giúp cân bằng vị béo.</li><li><strong>Nước mắm pha</strong>: yếu tố quyết định hương vị; mỗi quán có công thức riêng.</li></ul>'),
      image('com-tam-ba-ghien', 2, 'Miếng sườn nướng của đĩa cơm tấm (ảnh minh họa món ăn)'),
      text('<h2>Cách chọn quán cơm tấm</h2>'),
      text('<ul><li><strong>Quan sát bếp nướng</strong>: quán nướng sườn tại chỗ thường cho hương thơm tốt hơn quán nướng sẵn từ trước.</li><li><strong>Xem sườn</strong>: miếng sườn nên có độ dày vừa phải, mặt ngoài xém cạnh, không khô cứng.</li><li><strong>Thử nước mắm</strong>: nước mắm nên cân bằng giữa mặn, ngọt và chua cay, không quá gắt.</li><li><strong>Chọn giờ phù hợp</strong>: quán cơm tấm đêm thường sáng đèn từ chiều đến khuya; ăn đêm thường có không khí đông vui hơn, nhưng nên chọn quán có đánh giá gần đây.</li></ul>'),
      text('<h2>Một địa chỉ để bắt đầu</h2>'),
      text('<p>Cơm Tấm Ba Ghiền ở đường Đặng Văn Ngữ (Phú Nhuận) là một cái tên lâu năm thường được nhắc đến trong các danh sách quán cơm tấm Sài Gòn. Bạn có thể tham khảo thêm các địa điểm ẩm thực khác trong mục Địa điểm của Sài Gòn Đi và xem đánh giá của người dùng để chọn quán gần nơi mình ở.</p>'),
      image('com-tam-ba-ghien', 3, 'Một đĩa cơm tấm sườn trứng (ảnh minh họa món ăn)'),
      text('<p><em>Lưu ý: các ảnh trong bài là ảnh thật của món cơm tấm tại Sài Gòn từ Wikimedia Commons, dùng để minh họa món ăn chứ không phải ảnh của một quán cụ thể. Giá và giờ bán thay đổi theo từng quán.</em></p>')
    ]
  },

  // 7 ────────────────────────────────────────────────────────────────────────────
  {
    matchTitle: 'Cẩm nang check-in Nhà thờ màu hồng',
    title: 'Nhà thờ Tân Định: lịch sử, kiến trúc và cách tham quan đúng lễ nghi',
    categoryName: 'Ảnh đẹp Sài Gòn',
    tags: ['nhathotandinh', 'nhathohong', 'kientruc', 'checkin', 'saigon'],
    mainImage: img('nha-tho-tan-dinh-nha-tho-mau-hong', 3),
    content: [
      text('<p>Nhà thờ Tân Định ở số 289 Hai Bà Trưng nổi tiếng với màu hồng đặc trưng, một hình ảnh quen thuộc trên mạng xã hội. Nhưng đây trước hết là nhà thờ của giáo xứ Tân Định, nơi vẫn diễn ra thánh lễ hằng ngày. Hiểu điều này giúp bạn tham quan và chụp ảnh vừa đẹp vừa đúng phép.</p>'),
      text('<h2>Một chút lịch sử</h2>'),
      text('<p>Nhà thờ Tân Định cùng với Nhà thờ Đức Bà Sài Gòn là hai nhà thờ được xây dựng từ rất sớm và có quy mô lớn nhất thành phố. Theo các nguồn tham khảo, nhà thờ khởi công năm 1870 và khánh thành ngày 16/12/1876. Công trình sau đó được mở rộng thêm; các nguồn không thống nhất về năm xây tháp chuông, nên ở đây không nêu một mốc cụ thể. Tháp chuông cao khoảng 52,6 m.</p>'),
      image('nha-tho-tan-dinh-nha-tho-mau-hong', 3, 'Mặt tiền Nhà thờ Tân Định'),
      text('<h2>Kiến trúc</h2>'),
      text('<p>Công trình thường được mô tả là mang phong cách Roman pha yếu tố Gothic, với tháp chuông chính cao ở giữa, các cửa vòm và mặt tiền nhiều lớp phù điêu. Màu hồng bên ngoài kết hợp với các đường viền màu sáng tạo nên vẻ ngoài khác biệt so với phần lớn nhà thờ cùng thời ở Việt Nam.</p>'),
      image('nha-tho-tan-dinh-nha-tho-mau-hong', 4, 'Tháp chuông Nhà thờ Tân Định nhìn từ dưới lên'),
      text('<h2>Tham quan đúng lễ nghi</h2>'),
      text('<ul><li><strong>Trang phục</strong>: mặc kín đáo (che vai, đầu gối), tránh áo hai dây hoặc quần ngắn quá mức.</li><li><strong>Khi có thánh lễ</strong>: giữ yên lặng, không đi lại hoặc chụp ảnh trong lúc đang cử hành lễ; nếu muốn vào trong, nên chọn thời điểm không có lễ.</li><li><strong>Xin phép</strong>: nếu muốn chụp ảnh nhóm lớn, chụp ảnh cưới hoặc quay phim chuyên nghiệp, hãy liên hệ giáo xứ trước.</li><li><strong>Giờ mở cửa và giờ lễ</strong> thay đổi, hãy kiểm tra thông tin từ giáo xứ.</li></ul>'),
      text('<h2>Mẹo chụp ảnh</h2>'),
      text('<ul><li>Ánh sáng buổi sáng sớm hoặc cuối chiều thường dịu hơn buổi trưa; ngày thường vắng hơn cuối tuần.</li><li>Đứng ở lề đường phía bên kia đường Hai Bà Trưng để lấy được toàn bộ mặt tiền, nhưng cần chú ý giao thông vì đây là đường đông xe.</li><li>Ngoài tổng thể, bạn có thể thử góc chụp từ dưới lên để lấy tháp chuông, hoặc chụp chi tiết phù điêu và cửa vòm.</li></ul>'),
      image('nha-tho-tan-dinh-nha-tho-mau-hong', 1, 'Tháp chuông và mặt tiền Nhà thờ Tân Định từ lề đường'),
      text('<p><em>Lưu ý: các mốc lịch sử lấy theo nguồn tham khảo phổ biến; các nguồn có thể khác nhau về chi tiết.</em></p>')
    ]
  },

  // 8 ────────────────────────────────────────────────────────────────────────────
  {
    matchTitle: 'Hồ Con Rùa về đêm',
    title: 'Hồ Con Rùa: từ cổng thành xưa đến điểm hẹn ăn vặt của giới trẻ Sài Gòn',
    categoryName: 'Ẩm thực đặc sắc',
    tags: ['hoconrua', 'quavat', 'saigon', 'amthucduongpho', 'saigondem'],
    mainImage: img('ho-con-rua-cong-truong-quoc-te', 1),
    content: [
      text('<p>Hồ Con Rùa là tên gọi dân gian của một hồ phun nước nhân tạo ở giữa nơi giao nhau của ba con đường Võ Văn Tần, Phạm Ngọc Thạch và Trần Cao Vân, tạo thành một nút giao thông kiểu bùng binh. Khu vực này có tên chính thức là Công trường Quốc tế, và hiện nay là một trong những nơi có hoạt động ẩm thực gần như từ sáng đến đêm, với nhiều tiệm cà phê và hàng quán xung quanh.</p>'),
      image('ho-con-rua-cong-truong-quoc-te', 1, 'Tháp giữa hồ Con Rùa và những hàng cây quanh bùng binh'),
      text('<h2>Một chút lịch sử</h2>'),
      text('<p>Theo một số tài liệu, vị trí này từng là nơi đặt cổng thành Khảm Khuyết của thành Bát Quái; đến năm 1878 người Pháp xây tại đây một tháp nước để cấp nước cho cư dân và tháp bị dỡ bỏ vào năm 1921. Về sau, khu vực được tu sửa nhiều lần và được đặt tên Công trường Quốc tế vào năm 1972. Các nguồn không hoàn toàn thống nhất về thời điểm và chi tiết, nên bạn nên xem đây là những mốc tham khảo.</p>'),
      text('<p>Về cái tên “Con Rùa”, các tài liệu cho biết trước đây từng có tượng rùa trong khu vực này; tên gọi dân gian vẫn được dùng đến ngày nay. Những câu chuyện phong thủy liên quan đến con rùa chủ yếu là truyền thuyết, chưa có cơ sở xác nhận.</p>'),
      image('ho-con-rua-cong-truong-quoc-te', 2, 'Mặt hồ phủ lá sen và bóng tháp'),
      text('<h2>Ăn gì quanh hồ?</h2>'),
      text('<p>Quanh Công trường Quốc tế có nhiều xe đẩy và quán nhỏ bán các món ăn vặt đường phố quen thuộc của giới trẻ Sài Gòn. Các món thường gặp gồm:</p>'),
      text('<ul><li>Bánh tráng nướng, bánh tráng trộn</li><li>Bắp xào, các món xiên que nướng</li><li>Trà tắc, trà sữa và các loại nước giải khát</li><li>Cà phê ở các tiệm xung quanh để ngồi lâu hơn</li></ul>'),
      text('<p>Danh sách quán thay đổi liên tục nên bài không giới thiệu từng quán cụ thể. Hãy hỏi giá trước khi gọi món và ưu tiên quán có đông khách địa phương.</p>'),
      text('<h2>Mẹo để chuyến đi dễ chịu hơn</h2>'),
      text('<ul><li>Hồ nằm giữa bùng binh nên băng qua đường rất cẩn thận, ưu tiên đi theo vạch dành cho người đi bộ.</li><li>Buổi tối khu vực đông người; hãy giữ kỹ đồ đạc cá nhân.</li><li>Mang theo túi để đựng rác, không xả rác xuống hồ và vỉa hè.</li><li>Nếu muốn yên tĩnh để ngắm hồ, hãy đến vào buổi sáng sớm.</li></ul>'),
      image('ho-con-rua-cong-truong-quoc-te', 4, 'Bóng cây và tháp phản chiếu trên mặt hồ'),
      text('<p><em>Lưu ý: các mốc lịch sử lấy theo nguồn tham khảo phổ biến và có thể khác nhau giữa các tài liệu; quán xá quanh hồ thay đổi liên tục.</em></p>')
    ]
  }
]
