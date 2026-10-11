import { DestinationDef } from './destinations';
import * as THREE from 'three';
import { C } from './palette';
import { buildHoanKiem } from '../landmarks/hoanKiem';
import { buildPhoCo } from '../landmarks/phoCo';
import { buildVanMieu } from '../landmarks/vanMieu';
import { buildAmThuc } from '../landmarks/amThuc';
import { buildLongBien } from '../landmarks/longBien';
import { buildMotCot } from '../landmarks/motCot';
import { 
  buildNhaThoDa, buildCatCat, buildMuongHoa, 
  buildThacBac, buildCongTroi, buildFansipan 
} from '../landmarks/sapa';
import {
  buildTrongMai, buildSungSot, buildTiTop,
  buildCuaVan, buildDauGo, buildThienCung
} from '../landmarks/halong';
import {
  buildChuaCau, buildPhoTuongVang, buildPhoDenLong,
  buildPhucKien, buildTanKy, buildSongHoai
} from '../landmarks/hoian';

// Placeholder hanoi for now, we'll implement fully later
export const hanoi: DestinationDef = {
  id: 'loc-hanoi',
  name: { vi: 'Hà Nội', en: 'Hanoi' },
  blurb: {
    vi: 'Thủ đô nghìn năm tuổi với hồ xanh thơ mộng, phố cổ trăm nghề, và nền ẩm thực phở – cà phê trứng nức tiếng. Khám phá 6 điểm tham quan mang đậm hồn Hà Nội.',
    en: 'A thousand-year-old capital with poetic lakes, a hundred-trade Old Quarter, and world-famous pho & egg coffee. Explore 6 iconic landmarks of Hanoi.'
  },
  locationLine: { vi: 'Việt Nam · 6 điểm tham quan', en: 'Vietnam · 6 landmarks' },
  seed: 123,
  palette: {
    ...C,
    grassLight: 0x98c968,
    grassMid: 0x649c50,
    grassDark: 0x3d7042,
    dirt: 0xb59874,
    sand: 0xe6cf9a,
    rock: 0x827d78,
  },
  sky: { top: '#5fb8b0', bottom: '#8ed9cf', fog: '#6cc3bb', fogDensity: 0.006 },
  terrain: { amp: 1, freq: 1, type: 'flat' },
  waters: [
    { type: 'lake', dir: [0, 0], radius: 5.2, depth: 0.68 },
    { type: 'lake', dir: [-20, -35], radius: 5.8, depth: 0.72 },
    { type: 'lake', dir: [0, 75], radius: 6.5, depth: 0.75 },
  ],
  paths: [
    [[0, 0], [22, 10]],
    [[22, 10], [25, 55]],
    [[25, 55], [0, 75]],
    [[0, 75], [-22, -15]],
    [[-22, -15], [0, -75]],
    [[0, -75], [0, 0]],
  ],
  stages: [
    { 
      id: 'hoanKiem', index: 1, 
      name: { vi: 'Hồ Hoàn Kiếm & Tháp Rùa', en: 'Hoan Kiem Lake & Turtle Tower' }, 
      subtitle: { vi: 'Trái tim Thủ đô', en: 'The heart of the capital' },
      checkinXp: 15,
      facts: [
        { text: "Tháp Rùa 3 tầng, cao khoảng 8,8 m, xây khoảng 1886 trên gò Rùa giữa hồ", source: "vinpearl.com; mytour.vn" },
        { text: "Cầu Thê Húc xây 1865 bởi Nguyễn Văn Siêu, nối bờ hồ với đền Ngọc Sơn", source: "mia.vn" },
        { text: "Tháp Bút 5 tầng bằng đá ở lối vào cầu Thê Húc", source: "theleader.vn" }
      ],
      dialogueQuest: {
        npcName: "Bác Nam",
        npcRole: "Bác Lái Xích Lô Hồ Gươm",
        npcAvatar: "🚲",
        npcPromptEn: "Hello young explorer! Welcome to Hoan Kiem Lake. Do you know why this sacred lake is called 'Lake of the Returned Sword'?",
        npcPromptVi: "Chào cháu! Chào mừng cháu đến với Hồ Gươm. Cháu có biết vì sao hồ nước thiêng này lại được gọi là 'Hồ Hoàn Kiếm' không?",
        targetVocab: [
          { word: "legend", phonetics: "/ˈledʒ.ənd/", meaningVi: "truyền thuyết" },
          { word: "sacred turtle", phonetics: "/ˈseɪ.krɪd ˈtɜː.təl/", meaningVi: "rùa thần" },
          { word: "magic sword", phonetics: "/ˈmædʒ.ɪk sɔːd/", meaningVi: "thanh gươm thần" }
        ],
        rewardXp: 25,
        options: [
          {
            id: "opt1",
            textEn: "King Le Loi returned the magic sword to the Golden Turtle here.",
            textVi: "Vua Lê Lợi đã hoàn trả thanh gươm thần cho Rùa Vàng Kim Quy tại đây.",
            isCorrect: true,
            feedbackEn: "Brilliant! The Golden Turtle took back the heavenly sword after peace was restored.",
            feedbackVi: "Tuyệt vời! Rùa Vàng Kim Quy đã ngậm gươm thần lặn xuống nước sau khi giặc tan."
          },
          {
            id: "opt2",
            textEn: "A fisherman found hundreds of swords in the middle of the lake.",
            textVi: "Một người đánh cá đã vớt được hàng trăm thanh gươm ở giữa hồ.",
            isCorrect: false,
            feedbackEn: "Not quite! Remember the story of King Le Loi and the giant golden turtle.",
            feedbackVi: "Chưa đúng rồi! Hãy nhớ đến câu chuyện Vua Lê Lợi và Thần Kim Quy nhé."
          },
          {
            id: "opt3",
            textEn: "People forged traditional swords around the ancient lakeside.",
            textVi: "Người dân rèn những thanh kiếm truyền thống quanh bờ hồ.",
            isCorrect: false,
            feedbackEn: "Incorrect. The lake is named after returning the national treasure sword.",
            feedbackVi: "Chưa chính xác. Tên gọi này gắn liền với việc 'hoàn trả' gươm báu."
          }
        ]
      },
      dir: [0, 0], spawnOffset: { bearing: 0, dist: 6.8 }, interactAt: { bearing: 0, dist: 4.8 }, flatR: 9, ground: 'lawn', build: (ctx: any) => buildHoanKiem(ctx), photos: ['content/photos/hanoi/hoankiem.jpg'] 
    },
    { 
      id: 'phoCo', index: 2, 
      name: { vi: '36 Phố Phường (Phố Cổ)', en: '36 Streets (Old Quarter)' }, 
      subtitle: { vi: 'Linh hồn Kẻ Chợ', en: 'The soul of Ke Cho' },
      checkinXp: 15,
      facts: [
        { text: "Nhà ống: mặt tiền hẹp, chiều sâu dài, mái ngói nghiêng, tầng trệt là cửa hàng", source: "nhandan.vn" },
        { text: "Phố mang tên nghề: Hàng Bạc (kim hoàn), Hàng Đào (vải đỏ-hồng), Hàng Mã (dài khoảng 339 m)", source: "greensm.com; mia.vn" }
      ],
      dialogueQuest: {
        npcName: "Bác Tuấn",
        npcRole: "Nghệ Nhân Phố Hàng Bạc",
        npcAvatar: "💍",
        npcPromptEn: "Greetings! Hanoi's Old Quarter has 36 traditional guild streets named after their craft. How would you ask for silver jewelry here in English?",
        npcPromptVi: "Chào bạn nhỏ! Phố cổ Hà Nội có 36 phố phường đặt theo tên nghề truyền thống. Bạn sẽ hỏi mua trang sức bạc bằng tiếng Anh thế nào?",
        targetVocab: [
          { word: "craft guild", phonetics: "/krɑːft ɡɪld/", meaningVi: "phường nghề thủ công" },
          { word: "silver smith", phonetics: "/ˈsɪl.və.smɪθ/", meaningVi: "thợ kim hoàn/bạc" },
          { word: "heritage", phonetics: "/ˈher.ɪ.tɪdʒ/", meaningVi: "di sản" }
        ],
        rewardXp: 25,
        options: [
          {
            id: "opt1",
            textEn: "Could you show me your handcrafted silver souvenirs, please?",
            textVi: "Bác có thể cho cháu xem quà lưu niệm bạc thủ công được không?",
            isCorrect: true,
            feedbackEn: "Polite and accurate! Hang Bac is world-renowned for exquisite handcrafted silver.",
            feedbackVi: "Rất lịch sự và chính xác! Phố Hàng Bạc nổi tiếng khắp nơi về bạc tinh xảo."
          },
          {
            id: "opt2",
            textEn: "Give me cheap silver right now, street man.",
            textVi: "Đưa tôi bạc rẻ ngay bây giờ, người đàn ông trên phố.",
            isCorrect: false,
            feedbackEn: "Too abrupt and impolite in English conversational etiquette.",
            feedbackVi: "Cách nói này quá cộc lốc và thiếu lịch sự trong tiếng Anh."
          },
          {
            id: "opt3",
            textEn: "Where is the silver mine in the middle of this street?",
            textVi: "Mỏ bạc nằm ở đâu giữa con phố này thế?",
            isCorrect: false,
            feedbackEn: "There are no mines in the city; these are artisanal artisan workshops!",
            feedbackVi: "Trong thành phố không có mỏ khai khoáng mà là các xưởng thợ kim hoàn."
          }
        ]
      },
      dir: [22, 10], spawnOffset: { bearing: 0, dist: 6.5 }, flatR: 8, ground: 'paved', build: (ctx: any) => buildPhoCo(ctx), photos: ['content/photos/hanoi/36phophuong.jpg'] 
    },
    { 
      id: 'vanMieu', index: 3, 
      name: { vi: 'Văn Miếu - Quốc Tử Giám', en: 'Temple of Literature' }, 
      subtitle: { vi: 'Đại học đầu tiên VN (1070)', en: "Vietnam's first university (1070)" },
      checkinXp: 15,
      facts: [
        { text: "82 bia tiến sĩ đặt trên lưng rùa đá, mỗi bên giếng Thiên Quang 41 bia xếp 2 hàng", source: "znews.vn; vinpearl.com" },
        { text: "Khuê Văn Các xây 1805, nền vuông cạnh khoảng 6,8 m", source: "vinpearl.com" },
        { text: "Khu nội tự gồm 5 lớp không gian ngăn bằng tường gạch, mỗi tường có 3 cửa", source: "vinwonders.com" }
      ],
      dialogueQuest: {
        npcName: "Chị Mai",
        npcRole: "Hướng Dẫn Viên Văn Miếu",
        npcAvatar: "📚",
        npcPromptEn: "Welcome to Vietnam's first imperial university, built in 1070! What do the 82 stone stelae upon turtle backs represent?",
        npcPromptVi: "Chào mừng bạn đến với trường đại học đầu tiên của Việt Nam năm 1070! 82 bia đá đặt trên lưng rùa tượng trưng cho điều gì?",
        targetVocab: [
          { word: "doctor laureate", phonetics: "/ˈdɒk.tər ˈlɔː.ri.ət/", meaningVi: "tiến sĩ đỗ đạt" },
          { word: "wisdom", phonetics: "/ˈwɪz.dəm/", meaningVi: "trí tuệ, học vấn" },
          { word: "perseverance", phonetics: "/ˌpɜː.sɪˈvɪə.rəns/", meaningVi: "sự kiên trì, bền bỉ" }
        ],
        rewardXp: 25,
        options: [
          {
            id: "opt1",
            textEn: "They honor the brilliant scholars and doctors of imperial examinations.",
            textVi: "Vinh danh những bậc hiền tài và tiến sĩ đỗ đạt qua các kỳ khoa cử.",
            isCorrect: true,
            feedbackEn: "Exactly! As Thân Nhân Trung wrote: 'Talents are the vital energy of the nation.'",
            feedbackVi: "Chính xác! Đúng như lời cụ Thân Nhân Trung: 'Hiền tài là nguyên khí của quốc gia'."
          },
          {
            id: "opt2",
            textEn: "They are gravestones of ancient emperors.",
            textVi: "Đó là những bia mộ của các vị hoàng đế thời xưa.",
            isCorrect: false,
            feedbackEn: "Incorrect. The Temple of Literature is an educational shrine, not a tomb.",
            feedbackVi: "Chưa đúng. Văn Miếu là biểu tượng giáo dục, không phải lăng mộ."
          },
          {
            id: "opt3",
            textEn: "They indicate the map coordinates of old Hanoi.",
            textVi: "Đó là bản đồ chỉ tọa độ của Hà Nội cổ.",
            isCorrect: false,
            feedbackEn: "Not quite. They record names and birthplaces of doctoral graduates.",
            feedbackVi: "Chưa đúng. Bia đá khắc tên tuổi và quê quán của các vị tiến sĩ."
          }
        ]
      },
      dir: [0, -75], spawnOffset: { bearing: 0, dist: 7.2 }, flatR: 8.5, ground: 'paved', build: (ctx: any) => buildVanMieu(ctx), photos: ['content/photos/hanoi/vanmieu.jpg'] 
    },
    { 
      id: 'amThuc', index: 4, 
      name: { vi: 'Ẩm Thực: Phở & Cà Phê Trứng', en: 'Street Food: Pho & Egg Coffee' }, 
      subtitle: { vi: 'Tinh hoa ẩm thực', en: 'The essence of Hanoi cuisine' },
      checkinXp: 15,
      facts: [
        { text: "Cà phê trứng do cụ Nguyễn Văn Giảng sáng tạo năm 1946, dùng lòng đỏ trứng đánh bông thay sữa", source: "vietcetera.com" },
        { text: "Cà phê được rót vào tách nhỏ màu vàng nhạt, đặt trong bát nước ấm", source: "mytour.vn" }
      ],
      dialogueQuest: {
        npcName: "Cô Lan",
        npcRole: "Chủ Quán Phở Gia Truyền",
        npcAvatar: "🍜",
        npcPromptEn: "A warm welcome to you! How would you order a bowl of traditional beef noodle soup with fresh herbs in English?",
        npcPromptVi: "Chào quý khách! Cháu muốn gọi một bát phở bò truyền thống kèm rau thơm bằng tiếng Anh thì nói thế nào?",
        targetVocab: [
          { word: "aromatic broth", phonetics: "/ˌær.əˈmæt.ɪk brɒθ/", meaningVi: "nước dùng thơm ngọt" },
          { word: "whipped egg yolk", phonetics: "/wɪpt eɡ jəʊk/", meaningVi: "lòng đỏ trứng đánh bông" },
          { word: "fresh herbs", phonetics: "/freʃ hɜːbz/", meaningVi: "rau thơm tươi" }
        ],
        rewardXp: 25,
        options: [
          {
            id: "opt1",
            textEn: "May I have a bowl of hot beef Pho with fresh herbs and lime, please?",
            textVi: "Cho cháu xin một bát phở bò nóng kèm rau thơm và chanh với ạ!",
            isCorrect: true,
            feedbackEn: "Delicious English! Enjoy your aromatic Pho and rich egg coffee.",
            feedbackVi: "Rất chuẩn xác! Chúc bạn thưởng thức bát phở nóng hổi đậm đà."
          },
          {
            id: "opt2",
            textEn: "Bring boiling soup water with raw meat here immediately.",
            textVi: "Mang nước canh sôi với thịt sống lại đây ngay.",
            isCorrect: false,
            feedbackEn: "That's not how diners politely order authentic Pho!",
            feedbackVi: "Đây không phải cách gọi món lịch sự của thực khách sành ăn."
          },
          {
            id: "opt3",
            textEn: "I want an ice cream dessert with noodle cake.",
            textVi: "Tôi muốn một món kem tráng miệng với bánh mì sợi.",
            isCorrect: false,
            feedbackEn: "Pho is a savory noodle dish cooked with spices like star anise and cinnamon.",
            feedbackVi: "Phở là món nước dùng nấu từ thảo mộc, quế hồi, không phải món kem."
          }
        ]
      },
      dir: [25, 55], spawnOffset: { bearing: 0, dist: 6.0 }, flatR: 7.5, ground: 'paved', build: (ctx: any) => buildAmThuc(ctx), photos: ['content/photos/hanoi/amthuc.jpg'] 
    },
    { 
      id: 'longBien', index: 5, 
      name: { vi: 'Cầu Long Biên Lịch Sử', en: 'Long Bien Bridge' }, 
      subtitle: { vi: 'Chứng nhân vượt thời gian', en: 'A witness across time' },
      checkinXp: 15,
      facts: [
        { text: "Daydé & Pillé thiết kế, xây 1899–1902, 19 nhịp dầm thép trên 20 trụ", source: "tapchicongthuong.vn; en.wikipedia.org" },
        { text: "Đường sắt đơn ở giữa, hai bên là đường bộ và lối đi bộ", source: "tapchicongthuong.vn" }
      ],
      dialogueQuest: {
        npcName: "Bác Hùng",
        npcRole: "Nhiếp Ảnh Gia Cầu Long Biên",
        npcAvatar: "📷",
        npcPromptEn: "Look at the cantilever steel spans over the Red River! Which sentence best describes Long Bien Bridge's historical significance?",
        npcPromptVi: "Hãy ngắm những nhịp dầm thép vươn qua Sông Hồng! Câu nào mô tả đúng nhất ý nghĩa lịch sử của Cầu Long Biên?",
        targetVocab: [
          { word: "steel cantilever", phonetics: "/stiːl ˈkæn.tɪˌliː.vər/", meaningVi: "dầm thép công-xôn" },
          { word: "historical witness", phonetics: "/hɪˈstɒr.ɪ.kəl ˈwɪt.nəs/", meaningVi: "nhân chứng lịch sử" },
          { word: "resilience", phonetics: "/rɪˈzɪl.jəns/", meaningVi: "sự kiên cường, bền bỉ" }
        ],
        rewardXp: 25,
        options: [
          {
            id: "opt1",
            textEn: "It is an enduring historical witness that survived two centuries of warfare and peace.",
            textVi: "Cây cầu là nhân chứng lịch sử kiên cường vượt qua hai thế kỷ thăng trầm và đạn bom.",
            isCorrect: true,
            feedbackEn: "Perfect! Built over a century ago, it remains an eternal icon of Hanoi.",
            feedbackVi: "Chính xác! Cây cầu thép hơn 100 năm tuổi là biểu tượng bất tử của Thủ đô."
          },
          {
            id: "opt2",
            textEn: "It is a newly built plastic suspension bridge opened last month.",
            textVi: "Đó là cây cầu treo bằng nhựa mới xây tháng trước.",
            isCorrect: false,
            feedbackEn: "Wrong. Long Bien is built of heavy French steel in the early 1900s.",
            feedbackVi: "Sai rồi. Cầu được xây dựng bằng thép kiên cố từ đầu thế kỷ 20."
          },
          {
            id: "opt3",
            textEn: "It is used exclusively for submarine passage beneath the river.",
            textVi: "Cầu chỉ dành cho tàu ngầm đi qua dưới lòng sông.",
            isCorrect: false,
            feedbackEn: "Long Bien carries trains, motorbikes, and walking pedestrians above the river.",
            feedbackVi: "Cầu Long Biên bắc qua mặt sông dành cho tàu hỏa, xe máy và người đi bộ."
          }
        ]
      },
      dir: [0, 75], spawnOffset: { bearing: Math.PI / 2, dist: 11.5 }, flatR: 12, ground: 'sand', build: (ctx: any) => buildLongBien(ctx), photos: ['content/photos/hanoi/longbien.jpg'] 
    },
    { 
      id: 'motCot', index: 6, 
      name: { vi: 'Chùa Một Cột & Lăng Bác', en: 'One Pillar Pagoda & Mausoleum' }, 
      subtitle: { vi: 'Đóa sen nghìn năm', en: 'The thousand-year lotus' },
      checkinXp: 15,
      facts: [
        { text: "Chùa Một Cột xây 1049, một cột đá cao khoảng 4 m, đường kính khoảng 1,2 m", source: "vinwonders.com" },
        { text: "Lăng cao 21,6 m, mỗi cạnh 30 m, ốp đá granite xám, hoàn thành 1975", source: "greensm.com" }
      ],
      dialogueQuest: {
        npcName: "Thầy Thích Tuệ",
        npcRole: "Sư Thầy Chùa Một Cột",
        npcAvatar: "🪷",
        npcPromptEn: "Peace to you! One Pillar Pagoda was erected in 1049 to resemble a sacred lotus flower rising from a pond. How do you say 'hoa sen' in English?",
        npcPromptVi: "A di đà Phật! Chùa Một Cột được xây dựng từ năm 1049 tựa như đóa sen thiêng vươn lên từ mặt nước. 'Hoa sen' trong tiếng Anh là gì?",
        targetVocab: [
          { word: "lotus blossom", phonetics: "/ˈləʊ.təs ˈblɒs.əm/", meaningVi: "đóa hoa sen nở" },
          { word: "architectural wonder", phonetics: "/ˌɑː.kɪˈtek.tʃər.əl ˈwʌn.dər/", meaningVi: "kỳ quan kiến trúc" },
          { word: "serenity", phonetics: "/səˈren.ə.ti/", meaningVi: "sự thanh tịnh" }
        ],
        rewardXp: 25,
        options: [
          {
            id: "opt1",
            textEn: "The Lotus blossom - Vietnam's national flower of purity and elegance.",
            textVi: "Hoa Sen (Lotus) - quốc hoa của Việt Nam tượng trưng cho sự thanh khiết.",
            isCorrect: true,
            feedbackEn: "Wonderful! The lotus rising from the pond is a timeless symbol of purity.",
            feedbackVi: "Rất hay! Đóa sen nở giữa hồ nước là biểu tượng ngàn năm của tâm hồn Việt."
          },
          {
            id: "opt2",
            textEn: "The Sunflower - a yellow plant following the morning sun.",
            textVi: "Hoa Hướng Dương (Sunflower) hướng về mặt trời buổi sớm.",
            isCorrect: false,
            feedbackEn: "No, One Pillar Pagoda is designed like a pure lotus, not sunflower.",
            feedbackVi: "Chưa đúng. Chùa Một Cột có kiến trúc như đóa hoa sen."
          },
          {
            id: "opt3",
            textEn: "The Cactus - a spiky desert plant.",
            textVi: "Cây Xương Rồng (Cactus) ở sa mạc.",
            isCorrect: false,
            feedbackEn: "Incorrect. The temple sits on a single pillar in an elegant lotus pond.",
            feedbackVi: "Không chính xác. Ngôi chùa tọa lạc trên một cột đá giữa hồ sen tĩnh lặng."
          }
        ]
      },
      dir: [-22, -15], spawnOffset: { bearing: 0, dist: 5.6 }, interactAt: { bearing: 0, dist: 3.6 }, flatR: 9.5, ground: 'paved', build: (ctx: any) => buildMotCot(ctx), photos: ['content/photos/hanoi/motcot.jpg'] 
    }
  ]
};

export const sapa: DestinationDef = {
  id: 'loc-sapa',
  name: { vi: 'Sapa', en: 'Sapa' },
  blurb: {
    vi: 'Vùng cao tây bắc với ruộng bậc thang cheo leo, bản làng dân tộc thổ cẩm, và đỉnh Fansipan – Nóc nhà Đông Dương. 6 trải nghiệm núi rừng đang chờ.',
    en: 'Northwestern highlands with terraced rice paddies, ethnic villages, and Fansipan – the Roof of Indochina. 6 mountain experiences await.'
  },
  locationLine: { vi: 'Việt Nam · 6 trải nghiệm', en: 'Vietnam · 6 experiences' },
  seed: 456,
  palette: {
    ...C,
    grassLight: 0x7bc45a, grassMid: 0x4d8e3a, grassDark: 0x2d6628,
    water: 0x5aafb8, sand: 0xb8a070, rock: 0x8a8580,
    leaf: [0x2d7834, 0x4a9a42, 0x68b050, 0x1f5c28], trunk: 0x4a3020,
  },
  sky: { top: '#489da5', bottom: '#b6e4dc', fog: '#92d2c8', fogDensity: 0.010 },
  terrain: { amp: 3, freq: 2, type: 'mountains' },
  waters: [],
  paths: [
    [[0, 0], [20, 72]],
    [[20, 72], [-15, 144]],
    [[-15, 144], [10, 216]],
    [[10, 216], [-20, 288]],
    [[-20, 288], [15, 330]],
    [[15, 330], [0, 0]]
  ],
  stages: [
    { 
      id: 'nhaThoDa', index: 1, 
      name: { vi: 'Nhà Thờ Đá Sa Pa', en: 'Sa Pa Stone Church' }, 
      subtitle: { vi: 'Nhà thờ đá Sa Pa', en: 'Sa Pa Stone Church' },
      checkinXp: 15,
      facts: [
        { text: "Xây năm 1895 bằng đá đẽo, kiến trúc Gothic, có tháp chuông, nằm giữa quảng trường thị trấn", source: "sunparadiseland.com; vietnambooking.com" }
      ],
      dir: [0, 0], flatR: 4.0, ground: 'paved', build: (ctx: any) => buildNhaThoDa(ctx), photos: ['1'] 
    },
    { 
      id: 'catCat', index: 2, 
      name: { vi: 'Bản Cát Cát', en: 'Cat Cat Village' }, 
      subtitle: { vi: 'Bản Cát Cát', en: 'Cat Cat Village' },
      checkinXp: 15,
      facts: [
        { text: "Nhà gỗ truyền thống H'Mông, đường lát đá, guồng nước lớn bên suối", source: "sunparadiseland.com" }
      ],
      dir: [20, 72], flatR: 4.0, ground: 'lawn', build: (ctx: any) => buildCatCat(ctx), photos: ['1'] 
    },
    { 
      id: 'muongHoa', index: 3, 
      name: { vi: 'Thung Lũng Mường Hoa', en: 'Muong Hoa Valley' }, 
      subtitle: { vi: 'Thung lũng Mường Hoa', en: 'Muong Hoa Valley & Terraces' },
      checkinXp: 15,
      facts: [
        { text: "Ruộng bậc thang trải dài theo triền núi (nguồn ghi khoảng 2.200 ha); có bãi đá cổ xen ruộng", source: "vietnamairlines.com; mia.vn" }
      ],
      dir: [-15, 144], flatR: 5.0, ground: 'terrace', build: (ctx: any) => buildMuongHoa(ctx), photos: ['1'] 
    },
    { 
      id: 'thacBac', index: 4, 
      name: { vi: 'Thác Bạc', en: 'Silver Waterfall' }, 
      subtitle: { vi: 'Thác Bạc', en: 'Silver Waterfall' },
      checkinXp: 15,
      facts: [
        { text: "Cách thị trấn khoảng 12 km, ở chân đèo Ô Quy Hồ", source: "vietnambooking.com" }
      ],
      dir: [10, 216], flatR: 4.0, ground: 'lawn', build: (ctx: any) => buildThacBac(ctx), photos: ['1'] 
    },
    { 
      id: 'congTroi', index: 5, 
      name: { vi: 'Cổng Trời Ô Quy Hồ', en: "Heaven's Gate – O Quy Ho" }, 
      subtitle: { vi: 'Cổng Trời – đèo Ô Quy Hồ', en: "Heaven's Gate – O Quy Ho Pass" },
      checkinXp: 15,
      facts: [
        { text: "Đỉnh đèo Ô Quy Hồ cao khoảng 2.228 m", source: "mytour.vn" }
      ],
      dir: [-20, 288], flatR: 4.0, ground: 'paved', build: (ctx: any) => buildCongTroi(ctx), photos: ['1'] 
    },
    { 
      id: 'fansipan', index: 6, 
      name: { vi: 'Đỉnh Fansipan', en: 'Fansipan Peak' }, 
      subtitle: { vi: 'Nóc nhà Đông Dương', en: 'Roof of Indochina' },
      checkinXp: 15,
      facts: [
        { text: "Cao 3.143 m, được gọi là Nóc nhà Đông Dương, có cáp treo", source: "mytour.vn; wanderlog.com" }
      ],
      dir: [15, 330], flatR: 4.0, ground: 'lawn', build: (ctx: any) => buildFansipan(ctx), photos: ['1'] 
    }
  ]
};

export const halong: DestinationDef = {
  id: 'loc-halong',
  name: { vi: 'Vịnh Hạ Long', en: 'Ha Long Bay' },
  blurb: {
    vi: 'Di sản thiên nhiên thế giới với hàng nghìn hòn đảo đá vôi, hang động huyền bí, và làng chài nổi giữa biển ngọc bích. 6 kỳ quan biển đảo.',
    en: 'A UNESCO World Heritage Site with thousands of limestone karsts, mysterious caves, and floating fishing villages. 6 sea wonders.'
  },
  locationLine: { vi: 'Việt Nam · 6 kỳ quan', en: 'Vietnam · 6 wonders' },
  seed: 789,
  palette: {
    ...C,
    grassLight: 0x6aad58, grassMid: 0x488a3c, grassDark: 0x2a6820,
    water: 0x2a8a8a, sand: 0xd4c49a, rock: 0x9a9080,
    leaf: [0x306a30, 0x488848, 0x60a050, 0x205820], trunk: 0x5a4030,
  },
  sky: { top: '#4ab8b5', bottom: '#a0ddd5', fog: '#7ac8c0', fogDensity: 0.016 },
  terrain: { amp: 1, freq: 3, type: 'islands' },
  waters: [
    { type: 'ocean' as any, dir: [0, 0], radius: 12, depth: 1.2 },
  ],
  paths: [
    [[0, 0], [25, 60]],
    [[25, 60], [-20, 120]],
    [[-20, 120], [15, 180]],
    [[15, 180], [-10, 240]],
    [[-10, 240], [20, 300]],
    [[20, 300], [0, 0]]
  ],
  stages: [
    { 
      id: 'trongMai', index: 1, 
      name: { vi: 'Hòn Trống Mái', en: 'Trong Mai Islets' }, 
      subtitle: { vi: 'Cặp gà biểu tượng giữa vịnh ngọc', en: 'Iconic twin islets of Ha Long' },
      checkinXp: 15,
      facts: [
        { text: "Hai đảo nhỏ cao khoảng 12 m đối diện nhau như cặp gà trống – mái", source: "vinwonders.com" }
      ],
      dir: [0, 0], flatR: 4.0, ground: 'sand', build: (ctx: any) => buildTrongMai(ctx), photos: ['1'] 
    },
    { 
      id: 'sungSot', index: 2, 
      name: { vi: 'Hang Sửng Sốt', en: 'Surprise Cave' }, 
      subtitle: { vi: 'Kiệt tác nhũ đá đảo Bồ Hòn', en: 'Stalactite wonder on Bo Hon' },
      checkinXp: 15,
      facts: [
        { text: "Nằm trên đảo Bồ Hòn, nhiều nhũ đá, lối bậc đá qua rừng", source: "sunparadiseland.com; mytour.vn" }
      ],
      dir: [25, 60], flatR: 4.0, ground: 'sand', build: (ctx: any) => buildSungSot(ctx), photos: ['1'] 
    },
    { 
      id: 'tiTop', index: 3, 
      name: { vi: 'Đảo Ti Tốp', en: 'Ti Top Island' }, 
      subtitle: { vi: 'Bãi cát vầng trăng & đài ngắm vịnh', en: 'Crescent beach & panoramic bay summit' },
      checkinXp: 15,
      facts: [
        { text: "Có điểm ngắm toàn cảnh vịnh với khoảng 400 bậc thang", source: "vietnamtourism.com" }
      ],
      dir: [-20, 120], flatR: 4.0, ground: 'sand', build: (ctx: any) => buildTiTop(ctx), photos: ['1'] 
    },
    { 
      id: 'cuaVan', index: 4, 
      name: { vi: 'Làng Chài Cửa Vạn', en: 'Cua Van Floating Village' }, 
      subtitle: { vi: 'Xóm bè thanh bình giữa vách đá', en: 'Peaceful floating fishing village' },
      checkinXp: 15,
      facts: [
        { text: "Làng chài nổi lâu đời với nhà nổi và thuyền trắng giữa núi đá vôi", source: "mytour.vn" }
      ],
      dir: [15, 180], flatR: 4.0, ground: 'sand', build: (ctx: any) => buildCuaVan(ctx), photos: ['1'] 
    },
    { 
      id: 'dauGo', index: 5, 
      name: { vi: 'Hang Đầu Gỗ', en: 'Dau Go Cave' }, 
      subtitle: { vi: 'Hang động đá vôi nghìn năm kỳ vĩ', en: 'Majestic ancient limestone cavern' },
      checkinXp: 15,
      facts: [
        { text: "Được nhắc đến là hang đá vôi lớn nhất vịnh", source: "mia.vn" }
      ],
      dir: [-10, 240], flatR: 4.0, ground: 'sand', build: (ctx: any) => buildDauGo(ctx), photos: ['1'] 
    },
    { 
      id: 'thienCung', index: 6, 
      name: { vi: 'Động Thiên Cung', en: 'Thien Cung Cave' }, 
      subtitle: { vi: 'Cung điện thạch nhũ huyền bí', en: 'Mystical stalactite palace' },
      checkinXp: 15,
      facts: [
        { text: "Hệ thống măng đá và thạch nhũ nhiều hình thù", source: "vinwonders.com" }
      ],
      dir: [20, 300], flatR: 4.0, ground: 'sand', build: (ctx: any) => buildThienCung(ctx), photos: ['1'] 
    }
  ]
};

export const hoian: DestinationDef = {
  id: 'loc-hoian',
  name: { vi: 'Hội An', en: 'Hoi An' },
  blurb: {
    vi: 'Phố cổ tường vàng rêu phong bên sông Hoài, đèn lồng nhiều sắc, chùa cầu Nhật Bản, và đêm hoa đăng lung linh. 6 góc phố cổ tích.',
    en: 'A yellow-walled ancient town along Hoai River, colorful lanterns, the Japanese Bridge, and floating lantern nights. 6 fairytale corners.'
  },
  locationLine: { vi: 'Việt Nam · 6 điểm đến', en: 'Vietnam · 6 destinations' },
  seed: 101,
  palette: {
    ...C,
    grassLight: 0xa0c858, grassMid: 0x70a040, grassDark: 0x508028,
    water: 0x4aaa98, sand: 0xe0c880, rock: 0xc0b090,
    leaf: [0x48a048, 0x60b850, 0x78c860, 0x38883a], trunk: 0x684828,
  },
  sky: { top: '#ff7e5f', bottom: '#feb47b', fog: '#e69a73', fogDensity: 0.01 },
  terrain: { amp: 0.5, freq: 1, type: 'flat' },
  waters: [
    { type: 'river' as any, dir: [5, 30], radius: 5, depth: 0.4 },
  ],
  paths: [
    [[0, 0], [18, 60]],
    [[18, 60], [-12, 130]],
    [[-12, 130], [15, 190]],
    [[15, 190], [-15, 250]],
    [[-15, 250], [10, 310]],
    [[10, 310], [0, 0]]
  ],
  stages: [
    { 
      id: 'chuaCau', index: 1, 
      name: { vi: 'Chùa Cầu', en: 'Japanese Covered Bridge' }, 
      subtitle: { vi: 'Lai Viễn Kiều trầm mặc', en: 'Historic Japanese Covered Bridge' },
      checkinXp: 15,
      facts: [
        { text: "Cầu gỗ có mái che dài khoảng 18 m, mái ngói âm dương, tượng khỉ và chó hai đầu cầu", source: "finhay.com.vn; vinwonders.com" },
        { text: "Do thương nhân Nhật xây vào đầu thế kỷ 17", source: "baomoi.com" }
      ],
      dir: [0, 0], spawnOffset: { bearing: 0, dist: 7.2 }, interactAt: { bearing: 0, dist: 4.8 }, flatR: 9.0, ground: 'paved', build: (ctx: any) => buildChuaCau(ctx), photos: ['1'] 
    },
    { 
      id: 'phoTuongVang', index: 2, 
      name: { vi: 'Phố Cổ Tường Vàng', en: 'Old Town Yellow Walls' }, 
      subtitle: { vi: 'Hồn phố cổ rủ giàn hoa giấy', en: 'Yellow walls with bougainvillea' },
      checkinXp: 15,
      facts: [
        { text: "Nhà ống 1–2 tầng, tường vàng rêu phong, mái ngói âm dương, hoa giấy bên hiên", source: "vinwonders.com" }
      ],
      dir: [18, 60], spawnOffset: { bearing: 0, dist: 7.0 }, interactAt: { bearing: 0, dist: 4.5 }, flatR: 9.0, ground: 'paved', build: (ctx: any) => buildPhoTuongVang(ctx), photos: ['1'] 
    },
    { 
      id: 'phoDenLong', index: 3, 
      name: { vi: 'Phố Đèn Lồng', en: 'Lantern Street' }, 
      subtitle: { vi: 'Lung linh đêm rằm phố Hội', en: 'Enchanting silk lantern street' },
      checkinXp: 15,
      facts: [
        { text: "Phố đèn lồng nằm trên đường Nguyễn Phúc Chu, đèn lụa ngũ sắc", source: "vinwonders.com" }
      ],
      dir: [-12, 130], spawnOffset: { bearing: 0, dist: 7.2 }, interactAt: { bearing: 0, dist: 4.8 }, flatR: 9.0, ground: 'paved', build: (ctx: any) => buildPhoDenLong(ctx), photos: ['1'] 
    },
    { 
      id: 'phucKien', index: 4, 
      name: { vi: 'Hội Quán Phúc Kiến', en: 'Fujian Assembly Hall' }, 
      subtitle: { vi: 'Tam quan tráng lệ ngói ngọc', en: 'Fujian Assembly Hall' },
      checkinXp: 15,
      facts: [
        { text: "Xây năm 1697, thờ Thiên Hậu Thánh Mẫu", source: "baomoi.com" }
      ],
      dir: [15, 190], spawnOffset: { bearing: 0, dist: 7.5 }, interactAt: { bearing: 0, dist: 5.0 }, flatR: 9.0, ground: 'paved', build: (ctx: any) => buildPhucKien(ctx), photos: ['1'] 
    },
    { 
      id: 'tanKy', index: 5, 
      name: { vi: 'Nhà Cổ Tấn Ký', en: 'Tan Ky Ancient House' }, 
      subtitle: { vi: 'Gỗ lim trăm tuổi vững chãi', en: 'Tan Ky Ancient House' },
      checkinXp: 15,
      facts: [
        { text: "Kiến trúc giao thoa Trung – Nhật – Việt, vì kèo chạm trổ, mái ngói âm dương", source: "finhay.com.vn" }
      ],
      dir: [-15, 250], spawnOffset: { bearing: 0, dist: 7.5 }, interactAt: { bearing: 0, dist: 4.8 }, flatR: 9.0, ground: 'paved', build: (ctx: any) => buildTanKy(ctx), photos: ['1'] 
    },
    { 
      id: 'songHoai', index: 6, 
      name: { vi: 'Sông Hoài Hoa Đăng', en: 'Hoai River & Lanterns' }, 
      subtitle: { vi: 'Bến đò thả hoa đăng', en: 'Hoai River & floating flower lanterns' },
      checkinXp: 15,
      facts: [
        { text: "Đi thuyền thả hoa đăng trên sông Hoài về đêm", source: "vinwonders.com" }
      ],
      dir: [10, 310], spawnOffset: { bearing: 0, dist: 7.5 }, interactAt: { bearing: 0, dist: 5.0 }, flatR: 9.0, ground: 'sand', build: (ctx: any) => buildSongHoai(ctx), photos: ['1'] 
    }
  ]
};

export const DESTINATIONS: Record<string, DestinationDef> = {
  'loc-hanoi': hanoi,
  'hanoi': hanoi,
  'loc-sapa': sapa,
  'sapa': sapa,
  'loc-halong': halong,
  'halong': halong,
  'loc-hoian': hoian,
  'hoian': hoian,
};

export function getDestination(id: string): DestinationDef {
  const d = DESTINATIONS[id] || DESTINATIONS['loc-' + id] || hanoi;
  return d;
}
