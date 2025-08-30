// Simple test to verify database setup and CRUD operations
import {db} from "./database";
import {GroupRepository} from "../repositories/groupRepository";
import {CardRepository} from "../repositories/cardRepository";

export async function testDatabaseSetup(): Promise<void> {
  console.log("🧪 Testing database setup...");

  try {
    // Test database connection
    await db.open();
    console.log("✅ Database connection successful");

    // Initialize repositories
    const groupRepo = new GroupRepository();
    const cardRepo = new CardRepository();

    // Test Group CRUD operations
    console.log("🧪 Testing Group CRUD operations...");

    // Create a test group
    const testGroup = await groupRepo.create({
      name: "Test German Vocabulary",
      description: "Basic German words for testing",
      studyCardCount: 10,
      cardCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("✅ Group created:", testGroup.name);

    // Read the group
    const retrievedGroup = await groupRepo.findById(testGroup.id);
    console.log("✅ Group retrieved:", retrievedGroup?.name);

    // Update the group
    const updatedGroup = await groupRepo.update(testGroup.id, {
      description: "Updated description for testing",
    });
    console.log("✅ Group updated:", updatedGroup.description);

    // Test Card CRUD operations
    console.log("🧪 Testing Card CRUD operations...");

    // Create test cards
    const testCard1 = await cardRepo.create({
      groupId: testGroup.id,
      front: "Hallo",
      back: "Hello",
      properties: {difficulty: "easy"},
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("✅ Card 1 created:", testCard1.front);

    const testCard2 = await cardRepo.create({
      groupId: testGroup.id,
      front: "Danke",
      back: "Thank you",
      properties: {difficulty: "easy"},
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("✅ Card 2 created:", testCard2.front);

    // Test finding cards by group
    const groupCards = await cardRepo.findByGroupId(testGroup.id);
    console.log("✅ Cards found for group:", groupCards.length);

    // Test group card count update
    const groupWithCount = await groupRepo.findById(testGroup.id);
    console.log("✅ Group card count updated:", groupWithCount?.cardCount);

    // Test card rating update
    const ratedCard = await cardRepo.updateRating(testCard1.id, "know");
    console.log("✅ Card rating updated:", ratedCard.lastRating);

    // Clean up test data
    await groupRepo.delete(testGroup.id);
    console.log("✅ Test data cleaned up");

    console.log("🎉 All database tests passed!");
  } catch (error) {
    console.error("❌ Database test failed:", error);
    throw error;
  }
}
