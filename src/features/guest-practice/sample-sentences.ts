export type GuestPracticeSentence = {
  arabicTranslation: string;
  english: string;
  id: string;
  level: "A1" | "A2";
  wordMeanings?: Record<string, string>;
};

export const guestPracticeSentences: GuestPracticeSentence[] = [
  {
    arabicTranslation: "أشرب الماء كل صباح.",
    english: "I drink water every morning.",
    id: "guest-a1-water",
    level: "A1",
    wordMeanings: {
      drink: "يشرب",
      every: "كل",
      morning: "صباح"
    }
  },
  {
    arabicTranslation: "هذا كتابي.",
    english: "This is my book.",
    id: "guest-a1-book",
    level: "A1",
    wordMeanings: {
      book: "كتاب"
    }
  },
  {
    arabicTranslation: "الباب مفتوح.",
    english: "The door is open.",
    id: "guest-a1-door",
    level: "A1",
    wordMeanings: {
      door: "باب",
      open: "مفتوح"
    }
  },
  {
    arabicTranslation: "هل يمكنك مساعدتي في العثور على المحطة؟",
    english: "Can you help me find the station?",
    id: "guest-a2-station",
    level: "A2",
    wordMeanings: {
      help: "يساعد",
      find: "يعثر على",
      station: "محطة"
    }
  },
  {
    arabicTranslation: "عادة أستمع إلى الموسيقى بعد العمل.",
    english: "I usually listen to music after work.",
    id: "guest-a2-music",
    level: "A2",
    wordMeanings: {
      usually: "عادة",
      listen: "يستمع",
      work: "عمل"
    }
  }
];
