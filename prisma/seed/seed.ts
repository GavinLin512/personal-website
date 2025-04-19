import { PrismaClient } from "@prisma/client";
import { importData } from "./import_data";
import { processCsvData } from "./transfer_data";

const prisma = new PrismaClient();

async function main() {
	await prisma.$transaction(
		async (prisma) => {
			await prisma.category.deleteMany();
			await prisma.product.deleteMany();
			await prisma.productAttribute.deleteMany();
			await prisma.productVariant.deleteMany();
		},
		{
			maxWait: 15000, // Optional: How long Prisma waits to get a connection
			timeout: 90000, // timeout 90s
		},
	);
	// --- Execution ---
	const csvFilePath = "./data/styles.csv";
	await processCsvData(csvFilePath)
		.then(async (data) => {
			if (!data) {
				throw new Error("資料不存在，無法匯入");
			}
			await importData(data);
			console.log("\n匯入資料成功");
		})
		.catch((error) => {
			console.error("\n匯入程序錯誤:", error);
			process.exit(1); // Exit with error code
		});
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
