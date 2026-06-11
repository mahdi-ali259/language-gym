import type { PracticeSentence } from "@/lib/practice/session";

export const dailyWorkoutSentences: PracticeSentence[] = [
  {
    id: "daily-a1-water",
    levelCode: "A1",
    targetText: "I drink water every morning.",
    translationText: "أشرب الماء كل صباح.",
    wordMeanings: {
      drink: "يشرب",
      every: "كل",
      morning: "صباح"
    }
  },
  {
    id: "daily-a1-book",
    levelCode: "A1",
    targetText: "This is my book.",
    translationText: "هذا كتابي.",
    wordMeanings: {
      book: "كتاب"
    }
  },
  {
    id: "daily-a1-door",
    levelCode: "A1",
    targetText: "The door is open.",
    translationText: "الباب مفتوح.",
    wordMeanings: {
      door: "باب",
      open: "مفتوح"
    }
  },
  {
    id: "daily-a2-station",
    levelCode: "A2",
    targetText: "Can you help me find the station?",
    translationText: "هل يمكنك مساعدتي في العثور على المحطة؟",
    wordMeanings: {
      find: "يعثر على",
      help: "يساعد",
      station: "محطة"
    }
  },
  {
    id: "daily-a2-music",
    levelCode: "A2",
    targetText: "I usually listen to music after work.",
    translationText: "عادة أستمع إلى الموسيقى بعد العمل.",
    wordMeanings: {
      listen: "يستمع",
      usually: "عادة",
      work: "عمل"
    }
  }
];
