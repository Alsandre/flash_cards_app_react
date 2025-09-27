import type {Group} from "../types/group-schema";
import type {Card} from "../types/card-schema";
import {DEFAULT_CARD_VALUES} from "../types/card-schema";

// Special starter pack for ქეთი ❤️ - Using fixed UUIDs for consistency
export const STARTER_PACK_ID = "00000000-0000-0000-0000-000000000001";
export const STARTER_CARDS_GROUP_ID = "00000000-0000-0000-0000-000000000002";
export const STARTER_PACK_VERSION = "1.2"; // Update this when content changes

export const STARTER_PACK: {
  group: Omit<Group, "id" | "createdAt" | "updatedAt">;
  cards: Omit<Card, "id" | "groupId" | "createdAt" | "updatedAt">[];
} = {
  group: {
    name: "Für mein Herzchen ფისო 💕✨",
    description: `German for us, ცუนცი! These are the words that matter. Made with love for you! 🌟❤️ (v${STARTER_PACK_VERSION})`,
    studyCardCount: 15,
    cardCount: 15,
    tags: [],
    isActive: true,
    source: "starter_pack" as const,
  },
  cards: [
    {
      ...DEFAULT_CARD_VALUES,
      content: "You are my everything",
      answer: "Du bist mein Ein und Alles",
      hint: "ფისო, this is how I feel about you every single day 💕",
      tags: ["love", "medium"],
      source: "starter_pack" as const,
    },
    {
      ...DEFAULT_CARD_VALUES,
      content: "I miss you when you're not here",
      answer: "Ich vermisse dich, wenn du nicht da bist",
      hint: "Even for 5 minutes, ცუნცი! You know this feeling 🥺",
      tags: ["love", "medium"],
      source: "starter_pack" as const,
    },
    {
      ...DEFAULT_CARD_VALUES,
      content: "Come here and kiss me",
      answer: "Komm her und küss mich",
      hint: "The most important command in any language, ფისო! 😘",
      tags: ["love", "easy"],
      source: "starter_pack" as const,
    },
    {
      ...DEFAULT_CARD_VALUES,
      content: "You make me so happy",
      answer: "Du machst mich so glücklich",
      hint: "ცუნცი, truer words were never spoken! Your smile is everything 😊✨",
      tags: ["love", "easy"],
      source: "starter_pack" as const,
    },
    {
      ...DEFAULT_CARD_VALUES,
      content: "I want to spend forever with you",
      answer: "Ich möchte für immer mit dir zusammen sein",
      hint: "Our future plans in German, ფისო! And I mean every word 💍💕",
      tags: ["love", "hard"],
      source: "starter_pack" as const,
    },
    {
      ...DEFAULT_CARD_VALUES,
      content: "You're so beautiful when you sleep",
      answer: "Du bist so schön, wenn du schläfst",
      hint: "Something I want to whisper every morning, ცუნცი 🌅💕",
      tags: ["intimate", "medium"],
      source: "starter_pack" as const,
    },
    {
      ...DEFAULT_CARD_VALUES,
      content: "I love your laugh",
      answer: "Ich liebe dein Lachen",
      hint: "ფისო, your laugh is pure magic! It lights up my world 🥰",
      tags: ["love", "easy"],
      source: "starter_pack" as const,
    },
    {
      ...DEFAULT_CARD_VALUES,
      content: "Hold me tight",
      answer: "Halt mich fest",
      hint: "For those cuddle moments, ცუნცი! 🤗💕",
      tags: ["intimate", "easy"],
      source: "starter_pack" as const,
    },
    {
      ...DEFAULT_CARD_VALUES,
      content: "You are my safe place",
      answer: "Du bist mein sicherer Ort",
      hint: "ფისო, in your arms is where I belong 🏠❤️",
      tags: ["love", "medium"],
      source: "starter_pack" as const,
    },
    {
      ...DEFAULT_CARD_VALUES,
      content: "I dream about you every night",
      answer: "Ich träume jede Nacht von dir",
      hint: "Even when we sleep together, ცუნცი! You're in my dreams too 💭✨",
      tags: ["intimate", "medium"],
      source: "starter_pack" as const,
    },
    {
      ...DEFAULT_CARD_VALUES,
      content: "Your eyes are like stars",
      answer: "Deine Augen sind wie Sterne",
      hint: "Poetry for my ფისო! They really do sparkle ⭐💫",
      tags: ["romantic", "easy"],
      source: "starter_pack" as const,
    },
    {
      ...DEFAULT_CARD_VALUES,
      content: "I can't imagine life without you",
      answer: "Ich kann mir das Leben ohne dich nicht vorstellen",
      hint: "ცუნცი, this is my deepest truth 💕",
      tags: ["love", "hard"],
      source: "starter_pack" as const,
    },
    {
      ...DEFAULT_CARD_VALUES,
      content: "You smell so good",
      answer: "Du riechst so gut",
      hint: "For when I bury my face in your neck, ფისო! 🥰",
      tags: ["intimate", "easy"],
      source: "starter_pack" as const,
    },
    {
      ...DEFAULT_CARD_VALUES,
      content: "I'm proud to be yours",
      answer: "Ich bin stolz, dein zu sein",
      hint: "ცუნცი, being yours is my greatest honor 👑💕",
      tags: ["love", "medium"],
      source: "starter_pack" as const,
    },
    {
      ...DEFAULT_CARD_VALUES,
      content: "Let's make beautiful memories together",
      answer: "Lass uns zusammen schöne Erinnerungen schaffen",
      hint: "ფისო, every day with you is a new beautiful memory! 📸✨",
      tags: ["romantic", "hard"],
      source: "starter_pack" as const,
    },
  ],
};
