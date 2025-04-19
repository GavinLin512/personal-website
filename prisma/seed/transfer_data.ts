import type { Row, ProductHierarchy, MasterCategoryMap } from "@/lib/types";
import { parse } from "csv-parse/sync";
import slug from "slug";

// --- 常數 ---
const LOGGING_INTERVAL = 100; // 每處理 N 筆記錄就記錄進度

// --- 輔助函數 ---

/**
 * 將 CSV 內容解析為 Row 物件陣列。
 * 處理可能的解析錯誤。
 * @param csvContent 原始 CSV 字串內容。
 * @returns Row 物件陣列。
 * @throws 如果解析失敗則拋出錯誤。
 */
function parseCsvContent(csvContent: string): Row[] {
	try {
		// 在此使用同步解析器以簡化程式碼，因為原始程式碼等待整個陣列
		// 對於非常大的檔案，考慮使用 csv-parse 的非同步串流 API
		const records: Row[] = parse(csvContent, {
			columns: true, // 將第一行視為標題
			skip_empty_lines: true,
			delimiter: ",",
			quote: '"',
			escape: "\\",
			relax_column_count: true, // 允許不同的欄位數量
			relax_quotes: true, // 允許未轉義的引號
			cast: (value, context) => {
				// 根據標題進行基本型別轉換
				if (context.column === "id" || context.column === "year") {
					const num = Number.parseInt(value, 10);
					return Number.isNaN(num) ? null : num; // 如果轉換失敗則返回 null
				}
				// 如果需要，可以在此添加更多特定的轉換（例如：布林值、日期）
				return value;
			},
			on_record: (record: Row, context) => {
				// 如果需要，對每筆記錄進行驗證
				// 範例：確保必要欄位存在
				if (!record.id || !record.productDisplayName) {
					console.warn(
						`跳過第 ${context.lines} 行的記錄：缺少必要欄位（id 或 productDisplayName）`,
					);
					return null; // 跳過此記錄
				}
				// 確保數值欄位為數字
				if (typeof record.id !== "number" || typeof record.year !== "number") {
					console.warn(
						`跳過第 ${context.lines} 行的記錄：id 或 year 的數值無效。記錄：`,
						record,
					);
					return null; // 跳過此記錄
				}
				return record as Row; // 如果有效則轉換為 Row
			},
		});
		// 過濾掉被 on_record 跳過的任何 null 記錄
		return records.filter((record) => record !== null);
	} catch (error) {
		console.error("CSV 解析致命錯誤：", error);
		throw new Error("解析 CSV 檔案失敗。"); // 重新拋出以停止執行
	}
}

/**
 * 處理單筆記錄並將其添加到產品層級結構中。
 * @param record 要處理的 Row 物件。
 * @param hierarchy 要更新的 ProductHierarchy 物件。
 */
function addRecordToHierarchy(record: Row, hierarchy: ProductHierarchy): void {
	// 使用邏輯 OR 賦值 (||=) 確保巢狀物件存在，使程式碼更簡潔
	hierarchy[record.masterCategory] ||= {};
	const subCategoryMap = hierarchy[record.masterCategory];

	subCategoryMap[record.subCategory] ||= {};
	const articleTypeMap = subCategoryMap[record.subCategory];

	articleTypeMap[record.articleType] ||= {};
	const productMap = articleTypeMap[record.articleType];

	productMap[record.productDisplayName] ||= { variants: {} };
	const product = productMap[record.productDisplayName];

	// 為此特定變體創建唯一 slug
	// 移除了可選鏈式調用 (?)，假設 year/season/usage 在有效的 Row 中始終存在
	// 如果它們可能從 CSV 中缺失/為 null，請調整 Row 類型並在此處理可能的 null 值
	const variantSlug = slug(
		`${record.gender} ${record.baseColour} ${record.year} ${record.season} ${record.usage} ${record.id}`,
	);

	// 如果變體不存在，則添加它
	if (!product.variants[variantSlug]) {
		product.variants[variantSlug] = {
			gender: record.gender,
			baseColour: record.baseColour,
			year: record.year,
			season: record.season,
			usage: record.usage,
			image: record.id.toString(), // 使用 id 作為圖片識別符
		};
	} else {
		// 記錄重複的變體
		console.warn(`檢測到產品 "${record.productDisplayName}" 的重複變體 slug：${variantSlug}`);
	}
}

// --- 主要處理邏輯 ---

export async function processCsvData(
	filePath: string,
): Promise<MasterCategoryMap | undefined> {
	console.log(`讀取 CSV 檔案，路徑: ${filePath}`);
	const csvContent = await Bun.file(filePath).text();

	console.log("正在解析 CSV 內容...");
	const records = parseCsvContent(csvContent);
	const totalRecords = records.length;
	console.log(`成功解析 ${totalRecords} 筆有效記錄。`);

	if (totalRecords === 0) {
		console.log("沒有有效記錄可處理。退出。");
		return;
	}

	console.log("正在處理記錄並建立產品層級結構...");

	let processedCount = 0; // 重命名以提高清晰度
	let errorCount = 0;
	const productHierarchy: ProductHierarchy = {}; // 使用定義的類型

	// 遍歷記憶體中的陣列 - 這裡不需要 'await'
	for (const record of records) {
		processedCount++;
		try {
			// 定期記錄進度
			if (
				processedCount % LOGGING_INTERVAL === 0 ||
				processedCount === totalRecords
			) {
				console.log(
					`正在處理記錄 ${processedCount} / ${totalRecords} (${((processedCount / totalRecords) * 100).toFixed(2)}%)...`,
				);
			}

			addRecordToHierarchy(record, productHierarchy);
		} catch (recordError) {
			errorCount++;
			console.error(`處理記錄 #${processedCount} 時發生錯誤：`, recordError);
			// 記錄有問題的記錄數據以便調試
			try {
				console.error("有問題的記錄數據：", JSON.stringify(record));
			} catch {
				console.error("有問題的記錄數據（無法轉換為字串）：", record);
			}
			// 決定是否繼續處理其他記錄或停止
			// continue; // 取消註釋以在發生錯誤時繼續處理下一筆記錄
			break; // 取消註釋以在發生第一個錯誤時停止處理
		}
	}

	console.log("\n=== 數據處理摘要 ===");
	console.log(`解析的記錄總數：${totalRecords}`);
	console.log(`成功處理的記錄數：${processedCount - errorCount}`);
	console.log(`處理過程中失敗的記錄數：${errorCount}`);
	console.log("=============================\n");

	return productHierarchy;
}
