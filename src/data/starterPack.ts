import type {Group, Card} from "../types/entities";

// Special starter pack for ქეთი ❤️
export const STARTER_PACK_ID = "starter-pack-for-keti";
export const STARTER_CARDS_GROUP_ID = "motivational-german-for-keti";
export const STARTER_PACK_VERSION = "1.1"; // Update this when content changes

export const STARTER_PACK: {
  group: Omit<Group, "id" | "createdAt" | "updatedAt">;
  cards: Omit<Card, "id" | "groupId" | "createdAt" | "updatedAt">[];
} = {
  group: {
    name: "Für mein Herzchen ფისო 💕✨",
    description: `German for us, ცუნცი! These are the words that matter. Made with love for you! 🌟❤️ (v${STARTER_PACK_VERSION})`,
    studyCardCount: 15,
    cardCount: 15,
  },
  cards: [
    {
      front: "You are my everything",
      back: "Du bist mein Ein und Alles",
      hint: "ფისო, this is how I feel about you every single day 💕",
      properties: {difficulty: "medium", category: "love", motivation: "high"},
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
    {
      front: "I miss you when you're not here",
      back: "Ich vermisse dich, wenn du nicht da bist",
      hint: "Even for 5 minutes, ცუნცი! You know this feeling 🥺",
      properties: {difficulty: "medium", category: "love", motivation: "high"},
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
    {
      front: "Come here and kiss me",
      back: "Komm her und küss mich",
      hint: "The most important command in any language, ფისო! 😘",
      properties: {difficulty: "easy", category: "love", motivation: "high"},
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
    {
      front: "You make me so happy",
      back: "Du machst mich so glücklich",
      hint: "ცუნცი, truer words were never spoken! Your smile is everything 😊✨",
      properties: {difficulty: "easy", category: "love", motivation: "high"},
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
    {
      front: "I want to spend forever with you",
      back: "Ich möchte für immer mit dir zusammen sein",
      hint: "Our future plans in German, ფისო! And I mean every word 💍💕",
      properties: {difficulty: "hard", category: "love", motivation: "high"},
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
    {
      front: "You're so beautiful when you sleep",
      back: "Du bist so schön, wenn du schläfst",
      hint: "Something I want to whisper every morning, ცუნცი 🌅💕",
      properties: {difficulty: "medium", category: "intimate", motivation: "high"},
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
    {
      front: "I love your laugh",
      back: "Ich liebe dein Lachen",
      hint: "ფისო, your laugh is pure magic! It lights up my world 🥰",
      properties: {difficulty: "easy", category: "love", motivation: "high"},
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
    {
      front: "Hold me tight",
      back: "Halt mich fest",
      hint: "For those cuddle moments, ცუნცი! 🤗💕",
      properties: {difficulty: "easy", category: "intimate", motivation: "high"},
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
    {
      front: "You are my safe place",
      back: "Du bist mein sicherer Ort",
      hint: "ფისო, in your arms is where I belong 🏠❤️",
      properties: {difficulty: "medium", category: "love", motivation: "high"},
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
    {
      front: "I dream about you every night",
      back: "Ich träume jede Nacht von dir",
      hint: "Even when we sleep together, ცუნცი! You're in my dreams too 💭✨",
      properties: {difficulty: "medium", category: "intimate", motivation: "high"},
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
    {
      front: "Your eyes are like stars",
      back: "Deine Augen sind wie Sterne",
      hint: "Poetry for my ფისო! They really do sparkle ⭐💫",
      properties: {difficulty: "easy", category: "romantic", motivation: "high"},
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
    {
      front: "I can't imagine life without you",
      back: "Ich kann mir das Leben ohne dich nicht vorstellen",
      hint: "ცუნცი, this is my deepest truth 💕",
      properties: {difficulty: "hard", category: "love", motivation: "high"},
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
    {
      front: "You smell so good",
      back: "Du riechst so gut",
      hint: "For when I bury my face in your neck, ფისო! 🥰",
      properties: {difficulty: "easy", category: "intimate", motivation: "medium"},
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
    {
      front: "I'm proud to be yours",
      back: "Ich bin stolz, dein zu sein",
      hint: "ცუნცი, being yours is my greatest honor 👑💕",
      properties: {difficulty: "medium", category: "love", motivation: "high"},
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
    {
      front: "Let's make beautiful memories together",
      back: "Lass uns zusammen schöne Erinnerungen schaffen",
      hint: "ფისო, every day with you is a new beautiful memory! 📸✨",
      properties: {difficulty: "hard", category: "romantic", motivation: "high"},
      lastRating: undefined,
      lastReviewedAt: undefined,
    },
  ],
};
