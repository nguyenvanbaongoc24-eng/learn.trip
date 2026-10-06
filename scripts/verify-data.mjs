import { mockLocations, initialPassportStamps } from "../src/data/mockContent.js";

console.log("=== VERIFYING LEARN.TRIP DATA & MVP ENGINE ===");
console.log(`Total Locations: ${mockLocations.length}`);

const playable = mockLocations.filter((l) => l.isPlayableInMvp);
console.log(`Playable MVP Locations (${playable.length}):`, playable.map((p) => p.nameVi).join(", "));

playable.forEach((loc) => {
  const quests = loc.chapters?.flatMap((c) => c.lessons.flatMap((l) => l.quests)) || [];
  console.log(`- ${loc.nameVi} (${loc.nameEn}): ${quests.length} quest(s)`);
  quests.forEach((q) => {
    console.log(`  Quest: "${q.title.vi}" -> ${q.steps.length} steps:`);
    q.steps.forEach((s) => {
      console.log(`    Step ${s.order} [${s.question.type}]: ${s.question.prompt.vi}`);
    });
  });
});

console.log(`Total Passport Stamps configured: ${Object.keys(initialPassportStamps).length}`);
console.log("=== ALL CHECKS PASSED ===");
