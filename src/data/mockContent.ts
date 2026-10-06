import { Location, ContentPack, PassportStamp } from "@/types/content";

export const initialPassportStamps: Record<string, PassportStamp> = {
  hanoi: {
    id: "stamp-hanoi",
    locationId: "loc-hanoi",
    title: { vi: "Dấu ấn Thăng Long", en: "Seal of Thang Long" },
    category: "history",
    symbol: "🏛️",
    landmark: { vi: "Tháp Rùa - Hồ Hoàn Kiếm", en: "Turtle Tower - Sword Lake" },
  },
  halong: {
    id: "stamp-halong",
    locationId: "loc-halong",
    title: { vi: "Huyền thoại Vịnh Rồng", en: "Legend of the Dragon Bay" },
    category: "nature",
    symbol: "🐉",
    landmark: { vi: "Hòn Trống Mái", en: "Kissing Rocks - Ha Long" },
  },
  hoian: {
    id: "stamp-hoian",
    locationId: "loc-hoian",
    title: { vi: "Ánh sáng Phố Cổ", en: "Glow of the Ancient Town" },
    category: "culture",
    symbol: "🏮",
    landmark: { vi: "Chùa Cầu & Đèn Lồng", en: "Japanese Bridge & Lanterns" },
  },
  ninhbinh: {
    id: "stamp-ninhbinh",
    locationId: "loc-ninhbinh",
    title: { vi: "Cố đô Hoa Lư", en: "Ancient Capital Hoa Lu" },
    category: "nature",
    symbol: "🛶",
    landmark: { vi: "Quần thể Tràng An", en: "Trang An Grottoes" },
  },
  sapa: {
    id: "stamp-sapa",
    locationId: "loc-sapa",
    title: { vi: "Đỉnh Mây Fansipan", en: "Summit of Clouds Fansipan" },
    category: "adventure",
    symbol: "🏔️",
    landmark: { vi: "Ruộng Bậc Thang Mù Cang Chải", en: "Terraced Rice Fields" },
  },
  hue: {
    id: "stamp-hue",
    locationId: "loc-hue",
    title: { vi: "Di sản Hoàng Triều", en: "Imperial Dynasty Heritage" },
    category: "history",
    symbol: "👑",
    landmark: { vi: "Đại Nội Huế & Sông Hương", en: "Imperial City & Perfume River" },
  },
  danang: {
    id: "stamp-danang",
    locationId: "loc-danang",
    title: { vi: "Cầu Rồng Phun Lửa", en: "Dragon Bridge Spectacle" },
    category: "beach",
    symbol: "🌉",
    landmark: { vi: "Cầu Rồng & Bán đảo Sơn Trà", en: "Dragon Bridge & Son Tra" },
  },
  dalat: {
    id: "stamp-dalat",
    locationId: "loc-dalat",
    title: { vi: "Xứ sở Ngàn Hoa", en: "City of Eternal Spring" },
    category: "nature",
    symbol: "🌸",
    landmark: { vi: "Hồ Xuân Hương & Rừng Thông", en: "Xuan Huong Lake & Pine Hills" },
  },
  hcmc: {
    id: "stamp-hcmc",
    locationId: "loc-hcmc",
    title: { vi: "Hòn ngọc Viễn Đông", en: "Pearl of the Far East" },
    category: "culture",
    symbol: "🌆",
    landmark: { vi: "Chợ Bến Thành", en: "Ben Thanh Market" },
  },
  phuquoc: {
    id: "stamp-phuquoc",
    locationId: "loc-phuquoc",
    title: { vi: "Đảo Ngọc Hoàng Hôn", en: "Sunset Pearl Island" },
    category: "beach",
    symbol: "🏖️",
    landmark: { vi: "Bãi Sao & Làng chài Hàm Ninh", en: "Sao Beach & Fishing Village" },
  },
};

export const mockLocations: Location[] = [
  // 1. HÀ NỘI (PLAYABLE)
  {
    id: "loc-hanoi",
    slug: "hanoi",
    nameVi: "Hà Nội",
    nameEn: "Hanoi",
    tagline: {
      vi: "Thủ đô ngàn năm văn hiến",
      en: "The Capital of Thousand-Year Heritage",
    },
    description: {
      vi: "Khám phá 36 phố phường cổ kính, thưởng thức món Phở trứ danh và lắng nghe truyền thuyết thanh gươm thần tại Hồ Hoàn Kiếm.",
      en: "Explore the 36 ancient guild streets, savor world-famous Pho, and hear the legend of the Magic Sword at Hoan Kiem Lake.",
    },
    category: ["history", "culture", "food"],
    region: "north",
    mapPosition: { x: 52, y: 18 },
    unlockRule: { type: "initial" },
    status: "published",
    isPlayableInMvp: true,
    heroImage: "/assets/locations/hanoi.jpg",
    accentColor: "from-amber-500 to-red-600",
    iconEmoji: "🏛️",
    facts: [
      {
        vi: "Hà Nội từng có tên gọi là Thăng Long, nghĩa là 'Rồng bay lên'.",
        en: "Hanoi was formerly named Thang Long, meaning 'Ascending Dragon'.",
      },
      {
        vi: "Cà phê trứng ra đời tại Hà Nội vào những năm 1940 và trở thành biểu tượng ẩm thực.",
        en: "Egg coffee was invented in Hanoi during the 1940s and became an iconic drink.",
      },
      {
        vi: "Văn Miếu - Quốc Tử Giám được thành lập năm 1070 là trường đại học đầu tiên của Việt Nam.",
        en: "The Temple of Literature, built in 1070, is Vietnam's first imperial university.",
      },
    ],
    stamps: [initialPassportStamps.hanoi],
    chapters: [
      {
        id: "chap-hanoi-01",
        locationId: "loc-hanoi",
        title: {
          vi: "Chương 1: Trái tim Thăng Long",
          en: "Chapter 1: Heart of Thang Long",
        },
        description: {
          vi: "Học từ vựng về di sản phố cổ và văn hóa ẩm thực truyền thống.",
          en: "Learn vocabulary about old quarter heritage and traditional culinary culture.",
        },
        order: 1,
        difficulty: "explorer",
        status: "published",
        lessons: [
          {
            id: "les-hanoi-01",
            chapterId: "chap-hanoi-01",
            title: {
              vi: "Khám phá 36 Phố Phường",
              en: "Exploring the 36 Old Streets",
            },
            description: {
              vi: "Cùng làm quen với các địa danh lịch sử và món ăn nức tiếng của Hà Nội.",
              en: "Get familiar with Hanoi's historical landmarks and famous delicacies.",
            },
            estimatedMinutes: 5,
            order: 1,
            status: "published",
            quests: [
              {
                id: "quest-hanoi-01",
                lessonId: "les-hanoi-01",
                title: {
                  vi: "Nhiệm vụ Thám hiểm Thủ Đô",
                  en: "Capital Explorer Quest",
                },
                description: {
                  vi: "Vượt qua 3 thử thách kiến thức và từ vựng để mở khóa huy hiệu Hà Nội Explorer!",
                  en: "Pass 3 vocabulary & fact challenges to unlock the Hanoi Explorer badge!",
                },
                order: 1,
                status: "published",
                reward: {
                  xp: 120,
                  stamp: initialPassportStamps.hanoi,
                  badge: {
                    id: "badge-hanoi-master",
                    title: { vi: "Thám hiểm Hà Nội", en: "Hanoi Explorer" },
                    icon: "🌟",
                    description: {
                      vi: "Đã hoàn thành xuất sắc chặng phiêu lưu tại Thủ đô Hà Nội!",
                      en: "Mastered the adventure milestone in the capital city of Hanoi!",
                    },
                  },
                },
                steps: [
                  // Step 1: multiple_choice
                  {
                    id: "step-hanoi-01",
                    questId: "quest-hanoi-01",
                    order: 1,
                    question: {
                      id: "q-hanoi-01",
                      type: "multiple_choice",
                      prompt: {
                        vi: "Hồ Hoàn Kiếm trong tiếng Anh thường được gọi là gì?",
                        en: "What is 'Hồ Hoàn Kiếm' called in English?",
                      },
                      subPrompt: {
                        vi: "Gợi ý: Gắn liền với truyền thuyết vua Lê Lợi trả gươm báu cho Rùa Vàng.",
                        en: "Hint: Associated with King Le Loi returning the magic sword to the Golden Turtle.",
                      },
                      difficulty: 1,
                      status: "published",
                      options: [
                        { id: "opt-1", text: { vi: "Hồ Sen Hồng", en: "Lotus Blossom Lake" } },
                        { id: "opt-2", text: { vi: "Hồ Gươm Hoàn Lại", en: "Sword Lake / Returned Sword Lake" } },
                        { id: "opt-3", text: { vi: "Hồ Mặt Trời Mọc", en: "Sunrise Sky Lake" } },
                        { id: "opt-4", text: { vi: "Hồ Rồng Xanh", en: "Blue Dragon Lake" } },
                      ],
                      correctAnswer: "opt-2",
                      explanation: {
                        vi: "Chính xác! 'Hoàn Kiếm' nghĩa là 'trả gươm' (Returned Sword), bắt nguồn từ tích Rùa Thần mượn gươm đánh đuổi giặc ngoại xâm.",
                        en: "Correct! 'Hoàn Kiếm' translates to 'Returned Sword', celebrating the legend of the Golden Turtle.",
                      },
                      resultMedia: {
                        url: "/assets/locations/hanoi.jpg",
                        caption: {
                          vi: "Hồ Hoàn Kiếm và Tháp Rùa cổ kính — Biểu tượng trái tim Thủ đô Hà Nội",
                          en: "Hoan Kiem Lake & Historic Turtle Tower in Hanoi",
                        },
                      },
                    },
                  },
                  // Step 2: picture_match
                  {
                    id: "step-hanoi-02",
                    questId: "quest-hanoi-01",
                    order: 2,
                    question: {
                      id: "q-hanoi-02",
                      type: "picture_match",
                      prompt: {
                        vi: "Món ăn nào sau đây là 'Vietnamese Noodle Soup' trứ danh?",
                        en: "Which iconic dish is celebrated worldwide as 'Vietnamese Noodle Soup'?",
                      },
                      difficulty: 2,
                      status: "published",
                      options: [
                        { id: "opt-pho", text: { vi: "Phở Hà Nội", en: "Pho (Beef / Chicken Noodle Soup)" }, icon: "🍜" },
                        { id: "opt-banhmi", text: { vi: "Bánh Mì Kẹp", en: "Banh Mi (Vietnamese Baguette)" }, icon: "🥖" },
                        { id: "opt-che", text: { vi: "Chè Đậu Đỏ", en: "Sweet Lotus Bean Dessert" }, icon: "🍧" },
                        { id: "opt-springroll", text: { vi: "Nem Rán Giòn", en: "Crispy Spring Rolls" }, icon: "🥟" },
                      ],
                      correctAnswer: "opt-pho",
                      explanation: {
                        vi: "Tuyệt vời! Phở bò và phở gà Hà Nội với nước dùng thảo mộc thơm lừng là món súp nổi tiếng toàn cầu.",
                        en: "Awesome! Pho with its fragrant spiced broth and fresh herbs is recognized globally.",
                      },
                      resultMedia: {
                        url: "/assets/answers/pho.jpg",
                        caption: {
                          vi: "Tô Phở bò Hà Nội thơm lừng — Tinh hoa ẩm thực Việt Nam vươn tầm thế giới",
                          en: "Steaming bowl of authentic Hanoi Pho noodle soup",
                        },
                      },
                    },
                  },
                  // Step 3: listen_choose
                  {
                    id: "step-hanoi-03",
                    questId: "quest-hanoi-01",
                    order: 3,
                    question: {
                      id: "q-hanoi-03",
                      type: "listen_choose",
                      prompt: {
                        vi: "Hãy bấm nghe phát âm tiếng Anh sau đây và chọn đáp án chính xác:",
                        en: "Old Quarter",
                      },
                      subPrompt: {
                        vi: "Gợi ý: Khu vực 36 phố phường sầm uất ngàn năm lịch sử của Hà Nội.",
                        en: "Listen carefully to the audio and select which historical district is spoken.",
                      },
                      difficulty: 2,
                      status: "published",
                      options: [
                        { id: "opt-oldquarter", text: { vi: "Khu Phố Cổ 36 phố phường (Old Quarter)", en: "Old Quarter" } },
                        { id: "opt-french", text: { vi: "Khu Phố Pháp (French Quarter)", en: "French Quarter" } },
                        { id: "opt-westlake", text: { vi: "Bán đảo Hồ Tây (West Lake)", en: "West Lake Peninsula" } },
                        { id: "opt-citadel", text: { vi: "Hoàng Thành Thăng Long (Imperial Citadel)", en: "Imperial Citadel" } },
                      ],
                      correctAnswer: "opt-oldquarter",
                      explanation: {
                        vi: "Chính xác! 'Old Quarter' chính là Phố Cổ Hà Nội — nơi lưu giữ linh hồn và nét văn hóa ngàn năm của người Tràng An.",
                        en: "Correct! 'Old Quarter' refers to Hanoi's historic 36 guild streets vibrant with heritage.",
                      },
                      resultMedia: {
                        url: "/assets/locations/hanoi.jpg",
                        caption: {
                          vi: "Khu Phố Cổ Hà Nội 36 phố phường lịch sử (Old Quarter)",
                          en: "Historic Hanoi Old Quarter with traditional guild streets",
                        },
                      },
                    },
                  },
                  // Step 4: multiple_choice (Ao Dai)
                  {
                    id: "step-hanoi-04",
                    questId: "quest-hanoi-01",
                    order: 4,
                    question: {
                      id: "q-hanoi-04",
                      type: "multiple_choice",
                      prompt: {
                        vi: "Trang phục truyền thống thanh lịch của người Việt Nam được gọi là gì?",
                        en: "What is the elegant traditional dress of Vietnam celebrated globally?",
                      },
                      difficulty: 1,
                      status: "published",
                      options: [
                        { id: "opt-aodai", text: { vi: "Áo Dài truyền thống (Ao Dai)", en: "Ao Dai" } },
                        { id: "opt-kimono", text: { vi: "Áo Kimono", en: "Kimono" } },
                        { id: "opt-hanbok", text: { vi: "Áo Hanbok", en: "Hanbok" } },
                        { id: "opt-sari", text: { vi: "Trang phục Sari", en: "Sari" } },
                      ],
                      correctAnswer: "opt-aodai",
                      explanation: {
                        vi: "Chính xác! 'Áo Dài' là quốc phục đầy tự hào của Việt Nam, tôn vinh nét đẹp duyên dáng và thanh lịch.",
                        en: "Spot on! 'Ao Dai' is the iconic traditional attire of Vietnam recognized worldwide.",
                      },
                      resultMedia: {
                        url: "/assets/answers/ao_dai.jpg",
                        caption: {
                          vi: "Áo Dài truyền thống Việt Nam thướt tha — Nét đẹp văn hóa nghìn năm",
                          en: "Traditional Vietnamese Ao Dai — Symbol of grace and elegance",
                        },
                      },
                    },
                  },
                  // Step 5: word_builder (HANOI)
                  {
                    id: "step-hanoi-05",
                    questId: "quest-hanoi-01",
                    order: 5,
                    question: {
                      id: "q-hanoi-05",
                      type: "word_builder",
                      prompt: {
                        vi: "Ghép các chữ cái để tạo tên Thủ đô ngàn năm văn hiến của Việt Nam:",
                        en: "Assemble the letters to spell the historic Capital of Vietnam:",
                      },
                      subPrompt: {
                        vi: "Tên gồm 5 chữ cái: H - A - N - O - I",
                        en: "A 5-letter capital city name: H - A - N - O - I",
                      },
                      difficulty: 1,
                      status: "published",
                      correctAnswer: "HANOI",
                      wordBuilderConfig: {
                        targetWord: "HANOI",
                        scrambledLetters: ["N", "I", "H", "O", "A"],
                        hintVi: "Thủ đô của Việt Nam = H - A - N - O - I",
                      },
                      explanation: {
                        vi: "Xuất sắc! HANOI chính là Thủ đô trái tim của Việt Nam, thành phố vì hòa bình với hơn 1000 năm tuổi.",
                        en: "Outstanding! HANOI is Vietnam's beloved thousand-year-old capital and city of peace.",
                      },
                      resultMedia: {
                        url: "/assets/locations/hanoi.jpg",
                        caption: {
                          vi: "Thủ đô Hà Nội (HANOI) — Trái tim thiêng liêng của Tổ quốc",
                          en: "Hanoi Capital — The historic heart of Vietnam",
                        },
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  
  // 4. SAPA (PLAYABLE)
  {
    id: "loc-sapa",
    slug: "sapa",
    nameVi: "Sapa",
    nameEn: "Sapa",
    tagline: {
      vi: "Thị trấn trong sương",
      en: "Town in the Mist",
    },
    description: {
      vi: "Khám phá bản làng H'Mông, ngắm ruộng bậc thang Mù Cang Chải và chinh phục đỉnh Fansipan.",
      en: "Explore H'Mong villages, admire terraced fields, and conquer Fansipan peak.",
    },
    category: ["nature", "culture", "adventure"],
    region: "north",
    mapPosition: { x: 30, y: 15 },
    unlockRule: { type: "previous_location", targetId: "loc-hoian" },
    status: "published",
    isPlayableInMvp: true,
    heroImage: "/assets/locations/sapa.jpg",
    accentColor: "from-blue-400 to-indigo-600",
    iconEmoji: "🏔️",
    facts: [
      {
        vi: "Đỉnh Fansipan cao 3143m, được mệnh danh là nóc nhà Đông Dương.",
        en: "Fansipan peak is 3143m high, known as the Roof of Indochina.",
      },
    ],
    stamps: [initialPassportStamps.sapa],
    chapters: [],
  },

  // 2. VỊNH HẠ LONG (PLAYABLE)
  {
    id: "loc-halong",
    slug: "halong",
    nameVi: "Vịnh Hạ Long",
    nameEn: "Ha Long Bay",
    tagline: {
      vi: "Kỳ quan thiên nhiên thế giới UNESCO",
      en: "UNESCO World Natural Wonder",
    },
    description: {
      vi: "Chiêm ngưỡng gần 2.000 hòn đảo đá vôi kỳ vĩ nhô lên giữa làn nước ngọc bích, chèo kayak qua hang luồn và khám phá hang Sửng Sốt.",
      en: "Witness nearly 2,000 limestone karst islands rising from emerald waters, kayak through tidal lagoons, and discover Sung Sot Cave.",
    },
    category: ["nature", "adventure"],
    region: "north",
    mapPosition: { x: 65, y: 22 },
    unlockRule: { type: "previous_location", targetId: "loc-hanoi" },
    status: "published",
    isPlayableInMvp: true,
    heroImage: "/assets/locations/halong.jpg",
    accentColor: "from-emerald-500 to-teal-700",
    iconEmoji: "🐉",
    facts: [
      {
        vi: "'Hạ Long' có nghĩa là 'nơi rồng đáp xuống' theo truyền thuyết bảo vệ đất nước.",
        en: "'Ha Long' translates to 'Descending Dragon', based on myths of dragons spitting jewels.",
      },
      {
        vi: "Vịnh có hơn 1.600 hòn đảo đá vôi được hình thành qua hàng triệu năm kiến tạo địa chất.",
        en: "The bay encompasses over 1,600 limestone islands sculpted over millions of years.",
      },
      {
        vi: "Hang Sửng Sốt là một trong những hang động rộng lớn và lộng lẫy bậc nhất trong vịnh.",
        en: "Sung Sot (Surprise) Cave is one of the most expansive and stunning grottos in the bay.",
      },
    ],
    stamps: [initialPassportStamps.halong],
    chapters: [
      {
        id: "chap-halong-01",
        locationId: "loc-halong",
        title: {
          vi: "Chương 1: Kỳ quan Nước Biếc",
          en: "Chapter 1: Wonders of Emerald Waters",
        },
        description: {
          vi: "Học từ vựng tiếng Anh về biển đảo, hang động và sinh thái thiên nhiên.",
          en: "Learn English vocabulary about marine islands, caves, and ecological wonders.",
        },
        order: 1,
        difficulty: "explorer",
        status: "published",
        lessons: [
          {
            id: "les-halong-01",
            chapterId: "chap-halong-01",
            title: {
              vi: "Hành trình Vịnh Rồng",
              en: "Voyage of the Dragon Bay",
            },
            description: {
              vi: "Tham gia chuyến thuyền thám hiểm các hòn đảo kỳ vĩ.",
              en: "Embark on an expedition boat cruise amidst legendary islets.",
            },
            estimatedMinutes: 5,
            order: 1,
            status: "published",
            quests: [
              {
                id: "quest-halong-01",
                lessonId: "les-halong-01",
                title: {
                  vi: "Nhiệm vụ Thủy Thủ Khám Phá",
                  en: "Island Navigator Quest",
                },
                description: {
                  vi: "Vượt qua thử thách để nhận Dấu ấn Vịnh Rồng và 140 XP!",
                  en: "Pass challenges to claim the Dragon Bay Stamp and 140 XP!",
                },
                order: 1,
                status: "published",
                reward: {
                  xp: 140,
                  stamp: initialPassportStamps.halong,
                  badge: {
                    id: "badge-halong-sailor",
                    title: { vi: "Thủy Thủ Hạ Long", en: "Bay Navigator" },
                    icon: "⛵",
                    description: {
                      vi: "Đã vượt qua chặng thám hiểm vùng vịnh kỳ quan!",
                      en: "Successfully navigated through the world wonder bay!",
                    },
                  },
                },
                steps: [
                  {
                    id: "step-halong-01",
                    questId: "quest-halong-01",
                    order: 1,
                    question: {
                      id: "q-halong-01",
                      type: "listen_choose",
                      prompt: {
                        vi: "Hãy bấm nghe phát âm tiếng Anh sau đây và chọn đáp án chính xác:",
                        en: "Emerald Green",
                      },
                      subPrompt: {
                        vi: "Gợi ý: Làn nước huyền ảo đặc trưng của Vịnh Hạ Long có màu gì?",
                        en: "Listen carefully to the audio and select what color water is described.",
                      },
                      difficulty: 2,
                      status: "published",
                      options: [
                        { id: "opt-emerald", text: { vi: "Xanh ngọc bích (Emerald Green)", en: "Emerald Green" } },
                        { id: "opt-ruby", text: { vi: "Đỏ hồng ngọc (Ruby Red)", en: "Ruby Red" } },
                        { id: "opt-purple", text: { vi: "Tím hoàng hôn (Violet Sunset)", en: "Violet Sunset" } },
                        { id: "opt-golden", text: { vi: "Vàng cát biển (Golden Sand)", en: "Golden Sand" } },
                      ],
                      correctAnswer: "opt-emerald",
                      explanation: {
                        vi: "Xuất sắc! 'Emerald Green' (Màu xanh ngọc bích) chính là sắc nước tuyệt mỹ làm say đắm hàng triệu du khách quốc tế.",
                        en: "Brilliant! 'Emerald Green' is the world-famous signature water hue of Ha Long Bay.",
                      },
                      resultMedia: {
                        url: "/assets/locations/halong.jpg",
                        caption: {
                          vi: "Làn nước xanh ngọc bích (Emerald Waters) tuyệt mỹ của Vịnh Hạ Long",
                          en: "The breathtaking emerald green waters of Ha Long Bay",
                        },
                      },
                    },
                  },
                  {
                    id: "step-halong-02",
                    questId: "quest-halong-01",
                    order: 2,
                    question: {
                      id: "q-halong-02",
                      type: "picture_match",
                      prompt: {
                        vi: "Đâu là biểu tượng 'Cặp gà đá vôi đối mặt nhau' trứ danh của Vịnh Hạ Long?",
                        en: "Which icon represents the famous 'Kissing Rocks' (Hòn Trống Mái)?",
                      },
                      difficulty: 2,
                      status: "published",
                      options: [
                        { id: "opt-kissing", text: { vi: "Hòn Trống Mái (Kissing Rocks)", en: "Kissing Rocks (Cock & Hen)" }, icon: "🪨" },
                        { id: "opt-kayak", text: { vi: "Thuyền Kayak", en: "Kayaking Cruise" }, icon: "🛶" },
                        { id: "opt-lighthouse", text: { vi: "Ngọn Hải Đăng", en: "Sea Lighthouse" }, icon: "🗼" },
                        { id: "opt-pearl", text: { vi: "Nuôi Ngọc Trai", en: "Pearl Farming Island" }, icon: "🦪" },
                      ],
                      correctAnswer: "opt-kissing",
                      explanation: {
                        vi: "Rất chính xác! Hòn Trống Mái (Fighting Cocks / Kissing Rocks) là biểu tượng in trên tờ tiền 200.000 VNĐ.",
                        en: "Spot on! The Kissing Rocks are featured on the 200,000 VND banknote.",
                      },
                      resultMedia: {
                        url: "/assets/locations/halong.jpg",
                        caption: {
                          vi: "Hòn Trống Mái (Kissing Rocks) — Biểu tượng kỳ quan thiên nhiên thế giới",
                          en: "The iconic Kissing Rocks (Fighting Cocks) of Ha Long Bay",
                        },
                      },
                    },
                  },
                  // Step 3: multiple_choice (Junk Boat)
                  {
                    id: "step-halong-03",
                    questId: "quest-halong-01",
                    order: 3,
                    question: {
                      id: "q-halong-03",
                      type: "multiple_choice",
                      prompt: {
                        vi: "Loại thuyền buồm gỗ truyền thống đặc trưng du ngoạn trên Vịnh Hạ Long được gọi là gì?",
                        en: "What is the traditional wooden sailing vessel iconic to cruising in Ha Long Bay called?",
                      },
                      difficulty: 2,
                      status: "published",
                      options: [
                        { id: "opt-junk", text: { vi: "Thuyền buồm truyền thống (Traditional Junk Boat)", en: "Traditional Junk Boat" } },
                        { id: "opt-gondola", text: { vi: "Thuyền Gondola Ý", en: "Gondola" } },
                        { id: "opt-catamaran", text: { vi: "Tàu hai thân hiện đại", en: "Catamaran" } },
                        { id: "opt-submarine", text: { vi: "Tàu ngầm đáy biển", en: "Submarine" } },
                      ],
                      correctAnswer: "opt-junk",
                      explanation: {
                        vi: "Chính xác! 'Junk Boat' là loại thuyền buồm gỗ cổ kính với cánh buồm đỏ nâu tuyệt đẹp lướt giữa hàng nghìn hòn đảo kỳ vĩ.",
                        en: "Spot on! Traditional junk boats with bat-wing sails are the quintessential sight of Ha Long Bay.",
                      },
                      resultMedia: {
                        url: "/assets/locations/halong.jpg",
                        caption: {
                          vi: "Thuyền buồm truyền thống (Junk Boat) rẽ sóng vịnh ngọc Hạ Long",
                          en: "Traditional wooden junk boat cruising through emerald waters",
                        },
                      },
                    },
                  },
                  // Step 4: picture_match (Limestone Islands)
                  {
                    id: "step-halong-04",
                    questId: "quest-halong-01",
                    order: 4,
                    question: {
                      id: "q-halong-04",
                      type: "picture_match",
                      prompt: {
                        vi: "Kỳ quan Vịnh Hạ Long được kiến tạo từ hàng nghìn thực thể địa chất tự nhiên nào?",
                        en: "Ha Long Bay's dramatic landscape is formed by thousands of which natural geological features?",
                      },
                      difficulty: 2,
                      status: "published",
                      options: [
                        { id: "opt-karst", text: { vi: "Đảo Đá Vôi (Limestone Islands)", en: "Limestone Karst Islands" }, icon: "⛰️" },
                        { id: "opt-glacier", text: { vi: "Tảng Băng Trôi (Glacier)", en: "Arctic Glacier" }, icon: "🧊" },
                        { id: "opt-volcano", text: { vi: "Núi Lửa Phun Trào (Volcano)", en: "Active Volcano" }, icon: "🌋" },
                        { id: "opt-sanddune", text: { vi: "Đồi Cát Sa Mạc (Sand Dunes)", en: "Desert Sand Dunes" }, icon: "🏜️" },
                      ],
                      correctAnswer: "opt-karst",
                      explanation: {
                        vi: "Tuyệt đỉnh! Gần 2.000 đảo đá vôi (Limestone Karsts) qua hơn 500 triệu năm tiến hóa địa chất tạo nên kỳ quan thế giới có một không hai.",
                        en: "Brilliant! Nearly 2,000 limestone karst islands formed over 500 million years form this UNESCO wonder.",
                      },
                      resultMedia: {
                        url: "/assets/locations/halong.jpg",
                        caption: {
                          vi: "Quần thể gần 2.000 đảo đá vôi xanh ngắt kỳ vĩ nhô lên giữa biển khơi",
                          en: "Magnificent limestone karst pillars rising from the sea",
                        },
                      },
                    },
                  },
                  // Step 5: word_builder (DRAGON)
                  {
                    id: "step-halong-05",
                    questId: "quest-halong-01",
                    order: 5,
                    question: {
                      id: "q-halong-05",
                      type: "word_builder",
                      prompt: {
                        vi: "Ghép các chữ cái để tạo từ tiếng Anh có nghĩa là 'Con Rồng' (Dragon):",
                        en: "Assemble the letters to spell the English word for 'Con Rồng':",
                      },
                      subPrompt: {
                        vi: "Gợi ý: Hạ Long nghĩa là 'Descending Dragon' (Rồng Giáng)",
                        en: "Hint: A mythical creature with wings and wisdom (6 letters)",
                      },
                      difficulty: 2,
                      status: "published",
                      correctAnswer: "DRAGON",
                      wordBuilderConfig: {
                        targetWord: "DRAGON",
                        scrambledLetters: ["G", "A", "D", "N", "O", "R"],
                        hintVi: "Con Rồng = D - R - A - G - O - N",
                      },
                      explanation: {
                        vi: "Hoàn hảo! 'DRAGON' nghĩa là Rồng. Vịnh Hạ Long gắn liền với truyền thuyết đàn Rồng Mẹ và Rồng Con hạ phàm giúp người Việt dựng nước.",
                        en: "Terrific! 'DRAGON' is correct. The legend tells of Mother Dragon descending to protect the realm.",
                      },
                      resultMedia: {
                        url: "/assets/locations/halong.jpg",
                        caption: {
                          vi: "Vịnh Hạ Long — Nơi Rồng đáp xuống (Descending Dragon) bảo vệ non sông",
                          en: "Ha Long Bay — Legend of the Descending Dragon protecting Vietnam",
                        },
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  // 3. HỘI AN (PLAYABLE)
  {
    id: "loc-hoian",
    slug: "hoian",
    nameVi: "Hội An",
    nameEn: "Hoi An",
    tagline: {
      vi: "Đô thị cổ đèn lồng rực rỡ",
      en: "The Radiant Lantern Ancient Town",
    },
    description: {
      vi: "Thả bộ qua những con ngõ sơn vàng rực rỡ, ngắm nhìn hàng ngàn chiếc đèn lồng lấp lánh bên sông Hoài và nếm thử món Cao Lầu đậm đà.",
      en: "Stroll along yellow-painted alleyways, admire thousands of glowing lanterns by the Hoai River, and savor savory Cao Lau noodles.",
    },
    category: ["culture", "history", "food"],
    region: "central",
    mapPosition: { x: 62, y: 48 },
    unlockRule: { type: "previous_location", targetId: "loc-halong" },
    status: "published",
    isPlayableInMvp: true,
    heroImage: "/assets/locations/hoian.jpg",
    accentColor: "from-amber-400 to-orange-600",
    iconEmoji: "🏮",
    facts: [
      {
        vi: "Vào thế kỷ 16-17, Hội An là thương cảng quốc tế sầm uất đón tàu thuyền từ Nhật Bản, Trung Hoa, Hà Lan.",
        en: "In the 16th-17th centuries, Hoi An was a bustling trading port welcoming merchants from Japan, China, and Europe.",
      },
      {
        vi: "Vào đêm rằm hàng tháng, phố cổ tắt hết đèn điện và thắp sáng toàn bộ bằng đèn lồng lung linh.",
        en: "On every full moon night, the ancient town turns off electric lights and glows purely with silk lanterns.",
      },
      {
        vi: "Món Cao Lầu chỉ có thể nấu chuẩn hương vị bằng nước lấy từ giếng cổ Bá Lễ ngàn năm tuổi.",
        en: "Authentic Cao Lau noodles are traditionally made with fresh water from the thousand-year-old Ba Le well.",
      },
    ],
    stamps: [initialPassportStamps.hoian],
    chapters: [
      {
        id: "chap-hoian-01",
        locationId: "loc-hoian",
        title: {
          vi: "Chương 1: Đêm Hội Hoa Đăng",
          en: "Chapter 1: The Festival of Floating Lights",
        },
        description: {
          vi: "Khám phá di sản kiến trúc gỗ và lễ hội hoa đăng truyền thống.",
          en: "Discover wooden architectural heritage and ancient river lanterns.",
        },
        order: 1,
        difficulty: "explorer",
        status: "published",
        lessons: [
          {
            id: "les-hoian-01",
            chapterId: "chap-hoian-01",
            title: {
              vi: "Phố Đèn Lồng Sông Hoài",
              en: "Lantern Street by Hoai River",
            },
            description: {
              vi: "Học từ vựng về đèn lồng lụa, cầu cổ và các món ăn địa phương.",
              en: "Master vocabulary about silk lanterns, ancient bridges, and culinary staples.",
            },
            estimatedMinutes: 5,
            order: 1,
            status: "published",
            quests: [
              {
                id: "quest-hoian-01",
                lessonId: "les-hoian-01",
                title: {
                  vi: "Nhiệm vụ Người Dệt Đèn Lồng",
                  en: "Lantern Weaver Quest",
                },
                description: {
                  vi: "Hoàn thành 3 câu hỏi để mở khóa Tem Hội An và nhận 150 XP!",
                  en: "Complete 3 interactive questions to unlock Hoi An Stamp and 150 XP!",
                },
                order: 1,
                status: "published",
                reward: {
                  xp: 150,
                  stamp: initialPassportStamps.hoian,
                  badge: {
                    id: "badge-hoian-lantern",
                    title: { vi: "Ánh Sáng Phố Cổ", en: "Master of Lanterns" },
                    icon: "🏮",
                    description: {
                      vi: "Đã hoàn thành xuất sắc chặng phiêu lưu Hội An!",
                      en: "Completed the magical lantern adventure in Hoi An!",
                    },
                  },
                },
                steps: [
                  {
                    id: "step-hoian-01",
                    questId: "quest-hoian-01",
                    order: 1,
                    question: {
                      id: "q-hoian-01",
                      type: "multiple_choice",
                      prompt: {
                        vi: "Cây cầu cổ có mái che bằng gỗ nổi tiếng do thương nhân người nước nào xây dựng tại Hội An?",
                        en: "The historic covered wooden bridge in Hoi An was originally constructed by merchants from which country?",
                      },
                      difficulty: 2,
                      status: "published",
                      options: [
                        { id: "opt-jp", text: { vi: "Nhật Bản (Japanese Covered Bridge)", en: "Japan (Chùa Cầu)" } },
                        { id: "opt-fr", text: { vi: "Pháp (French Colonial)", en: "France" } },
                        { id: "opt-uk", text: { vi: "Vương quốc Anh (British)", en: "United Kingdom" } },
                        { id: "opt-nl", text: { vi: "Hà Lan (Dutch Traders)", en: "The Netherlands" } },
                      ],
                      correctAnswer: "opt-jp",
                      explanation: {
                        vi: "Chính xác! Chùa Cầu (Japanese Covered Bridge) được xây dựng vào thế kỷ 17 bởi các thương nhân Nhật Bản.",
                        en: "Correct! The Japanese Covered Bridge was erected in the early 17th century by Japanese traders.",
                      },
                      resultMedia: {
                        url: "/assets/locations/hoian.jpg",
                        caption: {
                          vi: "Chùa Cầu (Japanese Covered Bridge) thế kỷ 17 — Biểu tượng linh hồn Phố cổ Hội An",
                          en: "The historic Japanese Covered Bridge across the canal in Hoi An",
                        },
                      },
                    },
                  },
                  {
                    id: "step-hoian-02",
                    questId: "quest-hoian-01",
                    order: 2,
                    question: {
                      id: "q-hoian-02",
                      type: "picture_match",
                      prompt: {
                        vi: "Vật phẩm thủ công mỹ nghệ nào thắp sáng rực rỡ khắp các tuyến phố Hội An?",
                        en: "Which traditional handcrafted craft illuminates the vibrant streets of Hoi An at night?",
                      },
                      difficulty: 1,
                      status: "published",
                      options: [
                        { id: "opt-lantern", text: { vi: "Đèn Lồng Lụa (Silk Lantern)", en: "Silk Lantern" }, icon: "🏮" },
                        { id: "opt-pottery", text: { vi: "Gốm Sứ Thanh Hà", en: "Clay Pottery" }, icon: "🏺" },
                        { id: "opt-drum", text: { vi: "Trống Đồng Cổ", en: "Bronze Drum" }, icon: "🥁" },
                        { id: "opt-fan", text: { vi: "Quạt Giấy Chàng Sơn", en: "Paper Bamboo Fan" }, icon: "🪭" },
                      ],
                      correctAnswer: "opt-lantern",
                      explanation: {
                        vi: "Chính xác! Đèn lồng lụa Hội An với nhiều hình dáng (quả trám, quả đào, đĩa bay) là đặc sản văn hóa độc nhất vô nhị.",
                        en: "Correct! Handwoven silk lanterns in various shapes are the iconic emblem of Hoi An.",
                      },
                      resultMedia: {
                        url: "/assets/answers/lantern.jpg",
                        caption: {
                          vi: "Đèn lồng lụa thủ công rực rỡ sắc màu thắp sáng dòng sông Hoài thơ mộng",
                          en: "Vibrant handcrafted silk lanterns illuminating Hoi An ancient town",
                        },
                      },
                    },
                  },
                  // Step 3: listen_choose (Ancient Town)
                  {
                    id: "step-hoian-03",
                    questId: "quest-hoian-01",
                    order: 3,
                    question: {
                      id: "q-hoian-03",
                      type: "listen_choose",
                      prompt: {
                        vi: "Hãy bấm nghe phát âm tiếng Anh sau đây và chọn đáp án chính xác:",
                        en: "Ancient Town",
                      },
                      subPrompt: {
                        vi: "Gợi ý: Danh xưng tiếng Anh quốc tế của khu phố cổ Hội An.",
                        en: "Listen carefully to the audio and select which title describes Hoi An.",
                      },
                      difficulty: 2,
                      status: "published",
                      options: [
                        { id: "opt-ancient", text: { vi: "Đô Thị Cổ (Ancient Town)", en: "Ancient Town" } },
                        { id: "opt-modern", text: { vi: "Thành phố hiện đại", en: "Modern Metropolis" } },
                        { id: "opt-harbor", text: { vi: "Thương cảng công nghiệp", en: "Industrial Harbor" } },
                        { id: "opt-resort", text: { vi: "Khu nghỉ dưỡng", en: "Beach Resort" } },
                      ],
                      correctAnswer: "opt-ancient",
                      explanation: {
                        vi: "Chính xác! Hội An được UNESCO vinh danh là Di sản văn hóa thế giới với danh hiệu 'Hoi An Ancient Town'.",
                        en: "Spot on! 'Ancient Town' is the globally renowned title recognizing Hoi An's timeless heritage.",
                      },
                      resultMedia: {
                        url: "/assets/locations/hoian.jpg",
                        caption: {
                          vi: "Phố Cổ Hội An (Ancient Town) lung linh ánh vàng bên dòng sông Hoài",
                          en: "Hoi An Ancient Town shimmering alongside the Thu Bon river",
                        },
                      },
                    },
                  },
                  // Step 4: picture_match (Cao Lau Noodles)
                  {
                    id: "step-hoian-04",
                    questId: "quest-hoian-01",
                    order: 4,
                    question: {
                      id: "q-hoian-04",
                      type: "picture_match",
                      prompt: {
                        vi: "Món mì trứ danh mang tính biểu tượng ẩm thực duy nhất chỉ có tại Hội An là gì?",
                        en: "Which iconic noodle dish is the signature culinary masterpiece unique to Hoi An?",
                      },
                      difficulty: 2,
                      status: "published",
                      options: [
                        { id: "opt-caolau", text: { vi: "Mì Cao Lầu (Cao Lau Noodles)", en: "Cao Lau Pork Noodles" }, icon: "🍜" },
                        { id: "opt-pizza", text: { vi: "Bánh Pizza Ý", en: "Italian Pizza" }, icon: "🍕" },
                        { id: "opt-sushi", text: { vi: "Sushi Nhật Bản", en: "Japanese Sushi" }, icon: "🍣" },
                        { id: "opt-tacos", text: { vi: "Bánh Tacos Mexico", en: "Mexican Tacos" }, icon: "🌮" },
                      ],
                      correctAnswer: "opt-caolau",
                      explanation: {
                        vi: "Rất xuất sắc! Mì Cao Lầu với sợi mì vàng óng ngâm tro củi cù lao Chàm và nước giếng Bá Lễ là niềm tự hào ẩm thực Hội An.",
                        en: "Outstanding! Cao Lau noodles made with Ba Le well water and ash water is Hoi An's culinary pride.",
                      },
                      resultMedia: {
                        url: "/assets/answers/pho.jpg",
                        caption: {
                          vi: "Mì Cao Lầu Hội An — Món ngon trứ danh nghìn năm của xứ Quảng",
                          en: "Authentic Hoi An Cao Lau noodles with fragrant roasted pork",
                        },
                      },
                    },
                  },
                  // Step 5: word_builder (LANTERN)
                  {
                    id: "step-hoian-05",
                    questId: "quest-hoian-01",
                    order: 5,
                    question: {
                      id: "q-hoian-05",
                      type: "word_builder",
                      prompt: {
                        vi: "Ghép các chữ cái để tạo từ tiếng Anh có nghĩa là 'Chiếc Đèn Lồng' (Lantern):",
                        en: "Assemble the letters to spell the English word for 'Chiếc Đèn Lồng':",
                      },
                      subPrompt: {
                        vi: "Từ có 7 chữ cái: L - A - N - T - E - R - N",
                        en: "A 7-letter word: L - A - N - T - E - R - N",
                      },
                      difficulty: 2,
                      status: "published",
                      correctAnswer: "LANTERN",
                      wordBuilderConfig: {
                        targetWord: "LANTERN",
                        scrambledLetters: ["N", "T", "L", "E", "A", "R", "N"],
                        hintVi: "Chiếc Đèn Lồng = L - A - N - T - E - R - N",
                      },
                      explanation: {
                        vi: "Tuyệt đỉnh! 'LANTERN' chính là chiếc đèn lồng lung linh đã làm nên thương hiệu phố cổ Hội An.",
                        en: "Outstanding! 'LANTERN' is the exact word making Hoi An an unforgettable wonderland.",
                      },
                      resultMedia: {
                        url: "/assets/answers/lantern.jpg",
                        caption: {
                          vi: "Đèn lồng (LANTERN) — Linh hồn ánh sáng của Di sản văn hóa thế giới Hội An",
                          en: "Silk Lanterns (LANTERN) — The magical soul of Hoi An World Heritage",
                        },
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  // 4. NINH BÌNH (PREVIEW / LOCKED)
  {
    id: "loc-ninhbinh",
    slug: "ninhbinh",
    nameVi: "Ninh Bình",
    nameEn: "Ninh Binh",
    tagline: {
      vi: "Vịnh Hạ Long trên cạn & Cố đô ngàn năm",
      en: "Inland Ha Long Bay & Ancient Capital",
    },
    description: {
      vi: "Chèo thuyền xuyên qua các hang động ngập nước tại Tràng An, Tam Cốc và khám phá Cố đô Hoa Lư linh thiêng.",
      en: "Glide along emerald waterways through mystical caverns at Trang An and visit ancient royal temples in Hoa Lu.",
    },
    category: ["nature", "history", "adventure"],
    region: "north",
    mapPosition: { x: 50, y: 25 },
    unlockRule: { type: "xp_threshold", requiredXp: 300 },
    status: "published",
    isPlayableInMvp: false,
    heroImage: "https://images.unsplash.com/photo-1579606032824-c134d193d567?auto=format&fit=crop&w=1200&q=80",
    accentColor: "from-lime-600 to-emerald-800",
    iconEmoji: "🛶",
    facts: [
      {
        vi: "Quần thể danh thắng Tràng An là Di sản Văn hóa và Thiên nhiên Thế giới kép đầu tiên ở Đông Nam Á.",
        en: "Trang An is Southeast Asia's first dual World Heritage Site for both nature and culture.",
      },
      {
        vi: "Hoa Lư từng là kinh đô của 3 triều đại phong kiến Việt Nam: Đinh, Tiền Lê và Lý.",
        en: "Hoa Lu served as the royal capital of three Vietnamese dynasties: Dinh, Early Le, and Ly.",
      },
    ],
    stamps: [initialPassportStamps.ninhbinh],
  },

  // 5. HUẾ (PREVIEW / LOCKED)
  {
    id: "loc-hue",
    slug: "hue",
    nameVi: "Huế",
    nameEn: "Hue",
    tagline: {
      vi: "Cố đô trầm mặc bên dòng sông Hương",
      en: "Imperial Capital by the Perfume River",
    },
    description: {
      vi: "Thăm quan Đại Nội cổ kính của triều Nguyễn, lắng nghe Nhã nhạc Cung đình và ngắm chùa Thiên Mụ soi bóng sông Hương.",
      en: "Explore the ancient Imperial Citadel of the Nguyen Dynasty and listen to Royal Court Music by the Perfume River.",
    },
    category: ["history", "culture", "food"],
    region: "central",
    mapPosition: { x: 57, y: 42 },
    unlockRule: { type: "xp_threshold", requiredXp: 500 },
    status: "published",
    isPlayableInMvp: false,
    heroImage: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80",
    accentColor: "from-purple-600 to-indigo-800",
    iconEmoji: "👑",
    facts: [
      {
        vi: "Nhã nhạc Cung đình Huế là Kiệt tác Di sản Phi vật thể đầu tiên của Việt Nam được UNESCO công nhận.",
        en: "Hue Royal Court Music is Vietnam's first UNESCO Intangible Cultural Heritage Masterpiece.",
      },
      {
        vi: "Ẩm thực Huế nổi tiếng với sự tinh tế, có hơn 1.000 món ăn cung đình lẫn dân gian truyền thống.",
        en: "Hue cuisine is famed for elegance with over 1,000 royal and street food specialties.",
      },
    ],
    stamps: [initialPassportStamps.hue],
  },

  // 7. ĐÀ NẴNG (PREVIEW / LOCKED)
  {
    id: "loc-danang",
    slug: "danang",
    nameVi: "Đà Nẵng",
    nameEn: "Da Nang",
    tagline: {
      vi: "Thành phố của những cây cầu huyền thoại",
      en: "City of Iconic Bridges & Sandy Coastlines",
    },
    description: {
      vi: "Ngắm Cầu Rồng phun lửa phun nước vào cuối tuần, tắm biển Mỹ Khê và khám phá Ngũ Hành Sơn kỳ bí.",
      en: "Watch Dragon Bridge breathe fire on weekends, relax at My Khe Beach, and explore the Marble Mountains.",
    },
    category: ["beach", "adventure", "culture"],
    region: "central",
    mapPosition: { x: 61, y: 46 },
    unlockRule: { type: "xp_threshold", requiredXp: 600 },
    status: "published",
    isPlayableInMvp: false,
    heroImage: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80",
    accentColor: "from-cyan-500 to-blue-600",
    iconEmoji: "🌉",
    facts: [
      {
        vi: "Cầu Rồng Đà Nẵng có khả năng phun lửa và phun nước vào 21:00 mỗi tối Thứ Bảy và Chủ Nhật.",
        en: "Da Nang's Dragon Bridge breathes fire and spouts water every weekend at 9:00 PM.",
      },
      {
        vi: "Bãi biển Mỹ Khê từng được tạp chí Forbes bình chọn là một trong những bãi biển quyến rũ nhất hành tinh.",
        en: "My Khe Beach was named by Forbes as one of the most attractive beaches on the planet.",
      },
    ],
    stamps: [initialPassportStamps.danang],
  },

  // 8. ĐÀ LẠT (PREVIEW / LOCKED)
  {
    id: "loc-dalat",
    slug: "dalat",
    nameVi: "Đà Lạt",
    nameEn: "Da Lat",
    tagline: {
      vi: "Thành phố ngàn hoa và sương thông cao nguyên",
      en: "City of Thousand Flowers & Highland Pines",
    },
    description: {
      vi: "Tận hưởng không khí se lạnh quanh năm trên cao nguyên Lâm Viên, đạp xe quanh hồ Xuân Hương và nếm thử bánh tráng nướng giòn tan.",
      en: "Enjoy cool crisp air on Langbiang plateau, cycle around Xuan Huong Lake, and taste crispy Vietnamese pizza.",
    },
    category: ["nature", "food", "adventure"],
    region: "central",
    mapPosition: { x: 60, y: 64 },
    unlockRule: { type: "xp_threshold", requiredXp: 700 },
    status: "published",
    isPlayableInMvp: false,
    heroImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    accentColor: "from-rose-400 to-pink-600",
    iconEmoji: "🌸",
    facts: [
      {
        vi: "Đà Lạt nằm ở độ cao 1.500m so với mực nước biển, có khí hậu mát mẻ 4 mùa trong 1 ngày.",
        en: "Situated 1,500m above sea level, Da Lat experiences four seasons in a single day.",
      },
      {
        vi: "Đây là thủ phủ trà, cà phê Arabica và dâu tây lớn nhất vùng Tây Nguyên.",
        en: "It is the premier center of fresh strawberries, tea, and premium Arabica coffee in Vietnam.",
      },
    ],
    stamps: [initialPassportStamps.dalat],
  },

  // 9. TP. HỒ CHÍ MINH (PREVIEW / LOCKED)
  {
    id: "loc-hcmc",
    slug: "hcmc",
    nameVi: "TP. Hồ Chí Minh",
    nameEn: "Ho Chi Minh City",
    tagline: {
      vi: "Đô thị năng động nhất phương Nam",
      en: "The Dynamic Vibrant Southern Metropolis",
    },
    description: {
      vi: "Khám phá nhịp sống sôi động bất tận, ghé thăm Nhà thờ Đức Bà, Bưu điện Trung tâm và thưởng thức cà phê sữa đá vỉa hè.",
      en: "Experience endless energy, visit Saigon Notre Dame Cathedral, Central Post Office, and enjoy iced milk coffee.",
    },
    category: ["culture", "food", "history"],
    region: "south",
    mapPosition: { x: 53, y: 78 },
    unlockRule: { type: "xp_threshold", requiredXp: 800 },
    status: "published",
    isPlayableInMvp: false,
    heroImage: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80",
    accentColor: "from-amber-500 to-red-500",
    iconEmoji: "🌆",
    facts: [
      {
        vi: "Bưu điện Trung tâm Sài Gòn mang phong cách kiến trúc Pháp cổ điển được xây dựng từ cuối thế kỷ 19.",
        en: "The Saigon Central Post Office is a classic French colonial masterpiece built in the late 19th century.",
      },
      {
        vi: "Cơm tấm sườn bì chả với mỡ hành giòn thơm là món ăn sáng đặc trưng nhất của người Sài Gòn.",
        en: "Broken rice (Com Tam) with grilled pork chops and scallion oil is the most iconic local breakfast.",
      },
    ],
    stamps: [initialPassportStamps.hcmc],
  },

  // 10. PHÚ QUỐC (PREVIEW / LOCKED)
  {
    id: "loc-phuquoc",
    slug: "phuquoc",
    nameVi: "Phú Quốc",
    nameEn: "Phu Quoc Island",
    tagline: {
      vi: "Đảo Ngọc nhiệt đới và hoàng hôn rực rỡ",
      en: "Tropical Pearl Island & Radiant Sunsets",
    },
    description: {
      vi: "Lặn ngắm san hô biển ngọc, ngắm sao biển đỏ tại Rạch Vẹm và thả mình trên bãi cát trắng mịn Bãi Sao.",
      en: "Snorkel in turquoise reefs, spot red starfish at Rach Vem, and lounge on powdered white sands at Sao Beach.",
    },
    category: ["beach", "nature", "adventure"],
    region: "south",
    mapPosition: { x: 34, y: 88 },
    unlockRule: { type: "xp_threshold", requiredXp: 900 },
    status: "published",
    isPlayableInMvp: false,
    heroImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
    accentColor: "from-teal-400 to-blue-500",
    iconEmoji: "🏖️",
    facts: [
      {
        vi: "Phú Quốc là hòn đảo lớn nhất của Việt Nam, nổi tiếng thế giới về nước mắm truyền thống và hồ tiêu thơm nồng.",
        en: "Phu Quoc is Vietnam's largest island, world-renowned for artisanal fish sauce and fragrant black pepper.",
      },
      {
        vi: "Cáp treo Hòn Thơm tại Phú Quốc là cáp treo 3 dây vượt biển dài nhất thế giới.",
        en: "The Hon Thom Cable Car in Phu Quoc holds the Guinness World Record for the longest 3-rope sea cable car.",
      },
    ],
    stamps: [initialPassportStamps.phuquoc],
  },
];

export const defaultPack: ContentPack = {
  id: "pack-vietnam-mvp",
  slug: "vietnam-adventure-mvp",
  name: "Vietnam Explorer MVP Pack",
  description: "Trải nghiệm khám phá Việt Nam kết hợp học tiếng Anh cho trẻ em và thanh thiếu niên.",
  status: "published",
  language: "vi-en",
  version: 1,
  locations: mockLocations,
};
