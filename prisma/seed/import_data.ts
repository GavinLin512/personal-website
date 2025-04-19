// src/importData.ts
import { type Prisma, PrismaClient } from "@prisma/client";

import type { ProductHierarchy } from "@/lib/types";
import slug from "slug";
import { faker } from "@faker-js/faker/locale/zh_TW";

const prisma = new PrismaClient();

// 定義產品變體的結構（與層次結構匹配）
interface VariantData {
	gender: string;
	baseColour: string;
	year?: number | null; // 匹配 schema 的可選性
	season?: string | null; // 匹配 schema 的可選性
	usage?: string | null; // 匹配 schema 的可選性
	image: string;
}

export async function importData(hierarchy: ProductHierarchy) {
	console.log("開始導入資料...");
	let masterCategoryCount = 0;
	let subCategoryCount = 0;
	let articleTypeCount = 0;
	let productCount = 0;
	let variantCount = 0;
	let variantSkipped = 0;

	try {
		// 遍歷主分類
		for (const masterCategoryName in hierarchy) {
			const masterCategory = await prisma.category.upsert({
				where: {
					slug: slug(masterCategoryName),
					level: 1,
				},
				update: {
					name: masterCategoryName,
					// slug: slug(category),
					description: faker.lorem.paragraph({
						min: 1,
						max: 3,
					}),
				},
				create: {
					name: masterCategoryName,
					slug: slug(masterCategoryName),
					description: faker.lorem.paragraph({
						min: 1,
						max: 3,
					}),
					level: 1,
				},
			});
			masterCategoryCount++;
			console.log(
				`已更新主分類: ${masterCategory.name} (ID: ${masterCategory.id})`,
			);

			const subCategoryMap = hierarchy[masterCategoryName];

			// 遍歷子分類
			for (const subCategoryName in subCategoryMap) {
				const subCategorySlug = slug(
					`${masterCategory.slug}-${subCategoryName}`,
				);
				const subCategory = await prisma.category.upsert({
					where: {
						slug: subCategorySlug,
						level: 2,
					},
					update: {
						name: subCategoryName,
						// slug: subCategorySlug,
						description: faker.lorem.paragraph({
							min: 1,
							max: 3,
						}),
						parent: {
							connect: {
								slug: masterCategory.slug,
								level: 1,
							},
						},
					},
					create: {
						name: subCategoryName,
						slug: subCategorySlug,
						description: faker.lorem.paragraph({
							min: 1,
							max: 3,
						}),
						level: 2,
						parent: {
							connect: {
								slug: masterCategory.slug,
								level: 1,
							},
						},
					},
				});
				subCategoryCount++;
				console.log(
					`已更新子分類: ${subCategory.name} (ID: ${subCategory.id})`,
				);

				const articleTypeMap = subCategoryMap[subCategoryName];

				// 遍歷商品類型
				for (const articleTypeName in articleTypeMap) {
					const articleTypeSlug = slug(
						`${masterCategory.slug}-${subCategory.slug}-${articleTypeName}`,
					);
					const articleType = await prisma.category.upsert({
						where: {
							slug: articleTypeSlug, // 確保唯一值
							level: 3,
						},
						update: {
							name: articleTypeName,
							// slug: articleTypeSlug,
							description: faker.lorem.paragraph({
								min: 1,
								max: 3,
							}),
							parent: {
								connect: {
									slug: subCategory.slug,
									level: 2,
								},
							},
						},
						create: {
							name: articleTypeName,
							slug: articleTypeSlug,
							description: faker.lorem.paragraph({
								min: 1,
								max: 3,
							}),
							level: 3,
							parent: {
								connect: {
									slug: subCategory.slug,
									level: 2,
								},
							},
						},
					});
					articleTypeCount++;
					console.log(
						`已更新商品類型: ${articleType.name} (ID: ${articleType.id})`,
					);

					const productMap = articleTypeMap[articleTypeName];

					// 遍歷產品
					for (const productName in productMap) {
						const productData = productMap[productName];
						const productSlug = slug(`${productName}`);
						const product = await prisma.product.upsert({
							where: {
								slug: productSlug,
							},
							update: {
								name: productName,
								sku: productSlug,
								// slug: productSlug,
								description: faker.lorem.paragraph({ min: 1, max: 3 }),
								price: Number.parseInt(
									faker.commerce.price({ min: 100, max: 10000 }),
								),
								salePrice: Number.parseInt(
									faker.commerce.price({ min: 100, max: 10000 }),
								),
								stock: Number.parseInt(
									faker.commerce.price({ min: 50, max: 1000 }),
								),
								category: {
									connect: {
										slug: articleType.slug,
									},
								},
							},
							create: {
								name: productName,
								sku: productSlug,
								slug: productSlug,
								description: faker.lorem.paragraph({ min: 1, max: 3 }),
								price: Number.parseInt(
									faker.commerce.price({ min: 100, max: 10000 }),
								),
								salePrice: Number.parseInt(
									faker.commerce.price({ min: 100, max: 10000 }),
								),
								stock: Number.parseInt(
									faker.commerce.price({ min: 50, max: 1000 }),
								),
								category: {
									connect: {
										slug: articleType.slug,
									},
								},
							},
						});
						productCount++;
						console.log(`已更新產品: ${product.name} (ID: ${product.id})`);

						// 遍歷變體
						const images: string[] = [];
						for (const variantSlug in productData.variants) {
							const variantData: VariantData =
								productData.variants[variantSlug];
							const variantJson: Prisma.JsonArray = [
								{
									gender: variantData.gender,
									baseColour: variantData.baseColour,
									year: variantData.year,
									season: variantData.season,
									usage: variantData.usage,
									image: variantData.image,
								},
							];

							// 使用 upsert 根據唯一的 'image' 欄位更新變體
							try {
								images.push(variantData.image);
								await prisma.productVariant.upsert({
									where: {
										sku: variantSlug,
										productId: product.id,
									},
									update: {
										price: Number.parseInt(
											faker.commerce.price({ min: 100, max: 10000 }),
										),
										salePrice: Number.parseInt(
											faker.commerce.price({ min: 100, max: 10000 }),
										),
										stock: Number.parseInt(
											faker.commerce.price({ min: 100, max: 10000 }),
										),
										attributes: variantJson,
										image: variantData.image,
										product: {
											connect: {
												id: product.id,
											},
										},
									},
									create: {
										sku: variantSlug,
										price: Number.parseInt(
											faker.commerce.price({ min: 100, max: 10000 }),
										),
										salePrice: Number.parseInt(
											faker.commerce.price({ min: 100, max: 10000 }),
										),
										stock: Number.parseInt(
											faker.commerce.price({ min: 100, max: 10000 }),
										),
										attributes: variantJson,
										image: variantData.image,
										product: {
											connect: {
												id: product.id,
											},
										},
									},
								});
								variantCount++;
							} catch (error) {
								// 處理變體更新期間可能發生的錯誤，例如約束違規
								// 如果 'image' 唯一性假設錯誤或發生其他問題
								console.error(
									`無法更新變體 (圖片: ${variantData.image}, 產品: ${product.name}):`,
									error,
								);
								variantSkipped++;
							}
							for (const productAttribute in variantData) {
								if (productAttribute !== "image") {
									const attributeValue =
										variantData[
											productAttribute as keyof typeof variantData
										]?.toString();
									if (attributeValue) {
										const existProductAttribute =
											await prisma.productAttribute.findUnique({
												where: {
													productId_name_value: {
														name: productAttribute,
														value: attributeValue,
														productId: product.id,
													},
												},
											});
										if (existProductAttribute) {
											console.log(
												`跳過導入商品屬性 ${productAttribute}:${attributeValue} 屬於 ${product.slug}`,
											);
											continue;
										}
										console.log(
											`準備導入商品屬性 ${productAttribute}:${attributeValue} 屬於 ${product.slug}`,
										);
										await prisma.productAttribute.upsert({
											where: {
												productId_name_value: {
													name: productAttribute,
													value: attributeValue,
													productId: product.id,
												},
											},
											update: {
												name: productAttribute,
												value: attributeValue,
												product: {
													connect: {
														id: product.id,
													},
												},
											},
											create: {
												name: productAttribute,
												value: attributeValue,
												product: {
													connect: {
														id: product.id,
													},
												},
											},
										});
									}
								}
							}
						}
						// 更新產品所有圖片
						await prisma.product.update({
							where: {
								id: product.id,
							},
							data: {
								images: images,
							},
						});
						// 可選：記錄每個產品的進度
						if (productCount % 50 === 0) {
							console.log(
								`已處理 ${productCount} 個產品，${variantCount} 個變體...`,
							);
						}
					}
				}
			}
			// 可選：記錄每個主分類的進度
			console.log(`已完成處理主分類: ${masterCategory.name}`);
		}

		console.log("\n=== 導入摘要 ===");
		console.log(`已處理主分類: ${masterCategoryCount}`);
		console.log(`已處理子分類:    ${subCategoryCount}`);
		console.log(`已處理商品類型:     ${articleTypeCount}`);
		console.log(`已處理產品:          ${productCount}`);
		console.log(`已處理變體:          ${variantCount}`);
		console.log(`因錯誤跳過的變體: ${variantSkipped}`);
		console.log("====================\n");
	} catch (error) {
		console.error("導入過程中發生錯誤:", error);
	} finally {
		await prisma.$disconnect();
		console.log("資料庫連接已關閉。");
	}
}
