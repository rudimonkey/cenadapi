"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulletinSchema = exports.ProductSchema = void 0;
const zod_1 = require("zod");
/**
 * Product Schema - Defines the structure for individual agricultural product pricing
 */
exports.ProductSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    unit: zod_1.z.string(),
    priceMin: zod_1.z.number(),
    priceMax: zod_1.z.number(),
    mode: zod_1.z.number(),
    average: zod_1.z.number(),
    pricePerKilo: zod_1.z.number().optional(),
    volatilityIndex: zod_1.z.number(), // (max - min) / average
    category: zod_1.z.enum(['Vegetable', 'Fruit', 'Tuber', 'Protein', 'Other']).optional(),
});
/**
 * Bulletin Schema - Defines the structure for the complete pricing bulletin
 */
exports.BulletinSchema = zod_1.z.object({
    date: zod_1.z.string(),
    source: zod_1.z.literal('PIMA-CENADA'),
    products: zod_1.z.array(exports.ProductSchema),
});
