import { z } from "zod";

export const CEFRSchema = z.enum(["A1", "A2", "B1", "B2", "C1"]);

export const QuestionOptionSchema = z.object({
  id: z.string(),
  textVi: z.string().min(1, "Phương án tiếng Việt không được để trống"),
  textEn: z.string().min(1, "Phương án tiếng Anh không được để trống"),
  image: z.string().optional(),
  audio: z.string().optional(),
});

export const GeneratedQuestionSchema = z.object({
  id: z.string(),
  type: z.enum([
    "multiple_choice",
    "picture_match",
    "fill_blank",
    "listen_select",
    "match_pair",
    "word_order",
    "dialogue_select",
    "true_false"
  ]),
  promptVi: z.string().min(3, "Nội dung câu hỏi quá ngắn"),
  promptEn: z.string().min(3, "English prompt too short"),
  options: z.array(QuestionOptionSchema).min(2, "Cần tối thiểu 2 lựa chọn"),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  explanationVi: z.string(),
  explanationEn: z.string(),
  cefrLevel: CEFRSchema,
  landmarkId: z.string(),
  topicTags: z.array(z.string()),
  factCheckNeeded: z.boolean().default(false),
  generatedByAI: z.boolean().default(true),
  generationModel: z.string().default("Gemini-3.6-Pro-Education"),
});

export const GeneratedVocabSchema = z.object({
  id: z.string(),
  word: z.string().min(1),
  ipa: z.string(),
  partOfSpeech: z.enum(["noun", "verb", "adjective", "adverb", "phrase"]),
  meaningVi: z.string().min(1),
  exampleEn: z.string().min(3),
  exampleVi: z.string().min(3),
  level: CEFRSchema,
  landmarkId: z.string(),
  tags: z.array(z.string()),
});

export const GeneratedDialogueLineSchema = z.object({
  id: z.string(),
  speaker: z.string(),
  textEn: z.string(),
  textVi: z.string(),
  audioUrl: z.string().optional(),
});

export const GeneratedDialogueSchema = z.object({
  id: z.string(),
  titleVi: z.string(),
  titleEn: z.string(),
  contextVi: z.string(),
  contextEn: z.string(),
  level: CEFRSchema,
  landmarkId: z.string(),
  lines: z.array(GeneratedDialogueLineSchema).min(2),
});

export const AIGenerateRequestSchema = z.object({
  locationId: z.string(),
  locationName: z.string(),
  landmarkId: z.string(),
  landmarkName: z.string(),
  cefrLevel: CEFRSchema,
  contentType: z.enum(["quiz", "vocab", "dialogue", "short_reading"]),
  quantity: z.number().min(1).max(10).default(3),
  topic: z.string().min(2),
});

export type AIGenerateRequest = z.infer<typeof AIGenerateRequestSchema>;
export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;
export type GeneratedVocab = z.infer<typeof GeneratedVocabSchema>;
export type GeneratedDialogue = z.infer<typeof GeneratedDialogueSchema>;

// Auto-audit Helper: Checks for dates/numbers (facts needing verification), single correct answer, and duplicates
export function autoAuditQuestion(
  q: GeneratedQuestion,
  existingPrompts: string[] = []
): { factCheckNeeded: boolean; isDuplicate: boolean; hasSingleCorrect: boolean } {
  // Fact check detection: contains years (1070, 1886, etc.) or specific numbers/proper nouns
  const numberOrYearRegex = /\b(1\d{3}|20\d{2}|\d{2,}\s?m|\d{2,}\s?km|\d+\s?tầng)\b/i;
  const factCheckNeeded = numberOrYearRegex.test(q.promptVi) || numberOrYearRegex.test(q.explanationVi);

  // Duplicate check
  const isDuplicate = existingPrompts.some(
    (ep) => ep.trim().toLowerCase() === q.promptVi.trim().toLowerCase()
  );

  // Single correct option validation
  let hasSingleCorrect = true;
  if (typeof q.correctAnswer === "string") {
    hasSingleCorrect = q.options.some((o) => o.id === q.correctAnswer);
  } else if (Array.isArray(q.correctAnswer)) {
    hasSingleCorrect = q.correctAnswer.length > 0;
  }

  return { factCheckNeeded, isDuplicate, hasSingleCorrect };
}
