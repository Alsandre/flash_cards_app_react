import type { Group, Card } from "../types/entities";

// Special starter pack for ქეთი ❤️
export const STARTER_PACK_ID = "starter-pack-for-keti";
export const STARTER_CARDS_GROUP_ID = "motivational-german-for-keti";

export const STARTER_PACK: {
  group: Omit<Group, "id" | "createdAt" | "updatedAt">;
  cards: Omit<Card, "id" | "groupId" | "createdAt" | "updatedAt">[];
} = {
  group: {
    name: "Du schaffst das, ფისო! 💪✨",
    description: "Your journey to German fluency starts here, ცუნცი! Every word you learn is a step closer to your dreams. You're stronger than you think! 🌟",
    studyCardCount: 10,
    cardCount: 10,
  },
  cards: [
    {
      front: "Hello, my love!",
      back: "Hallo, meine Liebe!",
      hint: "The most important phrase for ფისო to know! 💕",
      properties: { difficulty: "easy", category: "love", motivation: "high" },
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
    {
      front: "I believe in myself",
      back: "Ich glaube an mich",
      hint: "ცუნცი, this is your daily mantra! You've got this! 🌟",
      properties: { difficulty: "medium", category: "motivation", motivation: "high" },
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
    {
      front: "I am learning German",
      back: "Ich lerne Deutsch",
      hint: "Yes you are, ფისო! And you're doing amazing! 📚✨",
      properties: { difficulty: "easy", category: "learning", motivation: "high" },
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
    {
      front: "I am proud of my progress",
      back: "Ich bin stolz auf meinen Fortschritt",
      hint: "Every small step counts, ცუნცი! Celebrate your wins! 🎉",
      properties: { difficulty: "medium", category: "motivation", motivation: "high" },
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
    {
      front: "Coffee makes everything better",
      back: "Kaffee macht alles besser",
      hint: "For our coffee-loving ფისო! ☕ (Just like you make everything better!)",
      properties: { difficulty: "easy", category: "daily", motivation: "medium" },
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
    {
      front: "I can do difficult things",
      back: "Ich kann schwierige Dinge tun",
      hint: "ცუნცი, you've already proven this so many times! 💪",
      properties: { difficulty: "medium", category: "motivation", motivation: "high" },
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
    {
      front: "My boyfriend is the best",
      back: "Mein Freund ist der Beste",
      hint: "Well, someone had to teach you this one! 😄❤️",
      properties: { difficulty: "easy", category: "love", motivation: "high" },
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
    {
      front: "I am getting better every day",
      back: "Ich werde jeden Tag besser",
      hint: "This is so true, ფისო! Your growth is incredible! 🌱",
      properties: { difficulty: "medium", category: "motivation", motivation: "high" },
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
    {
      front: "Mistakes help me learn",
      back: "Fehler helfen mir beim Lernen",
      hint: "ცუნცი, be kind to yourself! Every mistake is progress! 🤗",
      properties: { difficulty: "medium", category: "learning", motivation: "high" },
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
    {
      front: "I am capable of amazing things",
      back: "Ich bin zu erstaunlichen Dingen fähig",
      hint: "The truest statement ever, ფისო! You amaze me every day! ✨🌟",
      properties: { difficulty: "hard", category: "motivation", motivation: "high" },
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
  ],
};
