
import { prisma } from "../lib/db";

async function main() {
    const count = await prisma.tagAssessment.count({
        where: {
            date: {
                gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
        }
    });
    console.log(`Today's assessments: ${count}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
