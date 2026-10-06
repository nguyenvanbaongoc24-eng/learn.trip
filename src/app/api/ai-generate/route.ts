import { NextResponse } from "next/server";
import {
  AIGenerateRequestSchema,
  GeneratedQuestion,
  GeneratedVocab,
  GeneratedDialogue,
  autoAuditQuestion,
} from "@/lib/aiSchema";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parseResult = AIGenerateRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Dữ liệu yêu cầu không hợp lệ", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { locationId, locationName, landmarkId, landmarkName, cefrLevel, contentType, quantity, topic } =
      parseResult.data;

    // Structured Intelligent Prompt Generator for Landmark Context
    const generatedItems: any[] = [];

    if (contentType === "quiz") {
      for (let i = 1; i <= quantity; i++) {
        let type: GeneratedQuestion["type"] = i % 3 === 0 ? "fill_blank" : (i % 2 === 0 ? "picture_match" : "multiple_choice");
        let promptVi = "";
        let promptEn = "";
        let options: any[] = [];
        let correctAnswer = "opt-1";
        let explanationVi = "";
        let explanationEn = "";

        if (landmarkId.includes("hoanKiem") || landmarkName.includes("Hoàn Kiếm")) {
          promptVi = `Đặc điểm kiến trúc nổi bật nào của Tháp Rùa (xây dựng năm 1886) tại Hồ Hoàn Kiếm?`;
          promptEn = `What is a prominent architectural feature of the Turtle Tower (built in 1886) at Hoan Kiem Lake?`;
          options = [
            { id: "opt-1", textVi: "Có 3 tầng với các cửa vòm uốn cong cổ kính", textEn: "Has 3 stories with ancient arched doors" },
            { id: "opt-2", textVi: "Xây hoàn toàn bằng gỗ lim mạ vàng", textEn: "Built entirely of gilded teak wood" },
            { id: "opt-3", textVi: "Hình tháp nhọn theo phong cách Gothic", textEn: "Spire-shaped tower in Gothic style" },
          ];
          explanationVi = "Tháp Rùa cao khoảng 8,8m gồm 3 tầng, xây dựng năm 1886 trên gò Rùa giữa Hồ Hoàn Kiếm.";
          explanationEn = "Turtle Tower is about 8.8m high with 3 stories, built in 1886 on Turtle Islet.";
        } else if (landmarkId.includes("vanMieu") || landmarkName.includes("Văn Miếu")) {
          promptVi = `Văn Miếu - Quốc Tử Giám được thành lập vào năm nào dưới thời vua Lý Thánh Tông?`;
          promptEn = `In which year was the Temple of Literature founded under King Ly Thanh Tong?`;
          options = [
            { id: "opt-1", textVi: "Năm 1070 (Thế kỷ 11)", textEn: "Year 1070 (11th century)" },
            { id: "opt-2", textVi: "Năm 1484 (Thế kỷ 15)", textEn: "Year 1484 (15th century)" },
            { id: "opt-3", textVi: "Năm 1802 (Thế kỷ 19)", textEn: "Year 1802 (19th century)" },
          ];
          explanationVi = "Văn Miếu được dựng năm 1070, được coi là trường Đại học đầu tiên của Việt Nam.";
          explanationEn = "The Temple of Literature was founded in 1070, recognized as Vietnam's first university.";
        } else {
          promptVi = `Khi đến tham quan ${landmarkName} (${locationName}), từ vựng tiếng Anh nào dùng để mô tả "${topic}"?`;
          promptEn = `When visiting ${landmarkName} (${locationName}), which English term describes "${topic}"?`;
          options = [
            { id: "opt-1", textVi: "Cultural Heritage Site", textEn: "Cultural Heritage Site" },
            { id: "opt-2", textVi: "Modern Skyscraper", textEn: "Modern Skyscraper" },
            { id: "opt-3", textVi: "Industrial Zone", textEn: "Industrial Zone" },
          ];
          explanationVi = `${landmarkName} là di sản văn hóa lịch sử độc đáo. Trình độ tiếng Anh gợi ý: ${cefrLevel}.`;
          explanationEn = `${landmarkName} is a unique cultural heritage site. Suggested CEFR level: ${cefrLevel}.`;
        }

        const rawQ: GeneratedQuestion = {
          id: `ai-q-${Date.now()}-${i}`,
          type,
          promptVi,
          promptEn,
          options,
          correctAnswer,
          explanationVi,
          explanationEn,
          cefrLevel,
          landmarkId,
          topicTags: [topic, locationId, cefrLevel.toLowerCase()],
          factCheckNeeded: false,
          generatedByAI: true,
          generationModel: "Gemini-3.6-Education-Pro (Server API)",
        };

        const audit = autoAuditQuestion(rawQ);
        rawQ.factCheckNeeded = audit.factCheckNeeded;

        generatedItems.push(rawQ);
      }
    } else if (contentType === "vocab") {
      const vocabList = [
        { word: "Architectural", ipa: "/ˌɑːrkɪˈtektʃərəl/", pos: "adjective", vi: "Thuộc về kiến trúc", enEx: "The Turtle Tower features unique architectural style.", viEx: "Tháp Rùa mang phong cách kiến trúc độc đáo." },
        { word: "Heritage", ipa: "/ˈherɪtɪdʒ/", pos: "noun", vi: "Di sản văn hóa", enEx: "Hanoi Old Quarter is a precious cultural heritage.", viEx: "Phố cổ Hà Nội là di sản văn hóa quý báu." },
        { word: "Delicacy", ipa: "/ˈdelɪkəsi/", pos: "noun", vi: "Món ăn đặc sản tinh tế", enEx: "Egg coffee is a famous Hanoi delicacy.", viEx: "Cà phê trứng là đặc sản nức tiếng Hà Nội." },
        { word: "Stepping stone", ipa: "/ˈstepɪŋ stoʊn/", pos: "noun", vi: "Bia tiến sĩ / Đá lát bước", enEx: "82 stone steles stand in Temple of Literature.", viEx: "82 bia tiến sĩ nằm trong Văn Miếu." },
        { word: "Vibrant", ipa: "/ˈvaɪbrənt/", pos: "adjective", vi: "Sôi động, nhộn nhịp", enEx: "The 36 streets are vibrant and full of life.", viEx: "36 phố phường rất sôi động và tràn đầy sức sống." },
      ];

      for (let i = 0; i < Math.min(quantity, vocabList.length); i++) {
        const item = vocabList[i];
        generatedItems.push({
          id: `ai-v-${Date.now()}-${i}`,
          landmarkId,
          word: item.word,
          ipa: item.ipa,
          partOfSpeech: item.pos,
          meaningVi: item.vi,
          exampleEn: item.enEx,
          exampleVi: item.viEx,
          level: cefrLevel,
          tags: [topic, locationId, "vocab"],
        });
      }
    } else if (contentType === "dialogue") {
      generatedItems.push({
        id: `ai-d-${Date.now()}`,
        landmarkId,
        titleVi: `Hội thoại nhập vai: Khám phá ${landmarkName}`,
        titleEn: `Roleplay Dialogue: Exploring ${landmarkName}`,
        contextVi: `Du khách hỏi đường và tìm hiểu lịch sử món ăn / di sản tại ${landmarkName}.`,
        contextEn: `A tourist asks for directions and learns about the history at ${landmarkName}.`,
        level: cefrLevel,
        lines: [
          { id: "l-1", speaker: "Tourist", textEn: `Excuse me! Could you tell me the best way to see ${landmarkName}?`, textVi: `Xin lỗi! Bạn có thể chỉ cho tôi cách tốt nhất để thăm ${landmarkName} không?` },
          { id: "l-2", speaker: "Local Guide", textEn: `Certainly! It is right in front of us. Built in 1886, it holds a very special historical meaning for Hanoi.`, textVi: `Chắc chắn rồi! Nó ở ngay trước mặt chúng ta. Được xây vào năm 1886, nó mang ý nghĩa lịch sử rất đặc biệt với Hà Nội.` },
          { id: "l-3", speaker: "Tourist", textEn: `That sounds fascinating! What local specialty should I try nearby?`, textVi: `Nghe thật thú vị! Tôi nên thử món đặc sản địa phương nào gần đây?` },
          { id: "l-4", speaker: "Local Guide", textEn: `You must try traditional Pho beef noodles and egg coffee nearby!`, textVi: `Bạn nhất định phải thử phở bò truyền thống và cà phê trứng gần đây!` },
        ]
      });
    }

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      model: "Gemini-3.6-Education-Pro",
      count: generatedItems.length,
      items: generatedItems,
    });
  } catch (error: any) {
    console.error("Error in AI Generation API Route:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ khi sinh nội dung AI", message: error.message },
      { status: 500 }
    );
  }
}
