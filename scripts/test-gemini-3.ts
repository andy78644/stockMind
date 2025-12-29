
import "dotenv/config";
import { generateOverallAnalysis } from "../lib/gemini";
// dotenv.config() is now handled by the import above


async function runTest() {
    try {
        console.log("Testing generateOverallAnalysis with 'Tesla (TSLA)'...");
        const result = await generateOverallAnalysis("Tesla (TSLA)", ["FSD V13 Release", "Robotaxi Updates"]);
        console.log("\n--- RESULT Start ---\n");
        console.log(result);
        console.log("\n--- RESULT End ---\n");
    } catch (error) {
        console.error("Test Failed:", error);
    }
}

runTest();
