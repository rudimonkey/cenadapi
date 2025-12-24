"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pdf = __importStar(require("pdf-parse"));
const schema_zod_1 = require("./schema.zod");
const number_normalizer_1 = require("./number-normalizer");
/**
 * Path to the PDF file
 */
const PDF_PATH = path.join(__dirname, '..', '..', 'Documents', 'SIMM-Boletin de Precios PIMA-Plaza 2025-12-23.pdf');
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'assets', 'data', 'current-prices.json');
/**
 * Category mapping based on product names
 */
function categorizeProduct(name) {
    const nameLower = name.toLowerCase();
    const vegetables = ['apio', 'brocoli', 'brócoli', 'coliflor', 'repollo', 'lechuga', 'apio', 'chile', 'tomate', 'cebolla', 'zanahoria', 'vainica', 'espinaca', 'ayote', 'calabaza'];
    const fruits = ['banano', 'piña', 'papaya', 'mango', 'sandía', 'melón', 'naranja', 'limón', 'mandarina', 'fresa', 'uva', 'manzana'];
    const tubers = ['papa', 'yuca', 'camote', 'ñame', 'ñampí', 'tiquisque'];
    const proteins = ['huevo', 'carne', 'pollo', 'pescado'];
    if (vegetables.some(v => nameLower.includes(v)))
        return 'Vegetable';
    if (fruits.some(f => nameLower.includes(f)))
        return 'Fruit';
    if (tubers.some(t => nameLower.includes(t)))
        return 'Tuber';
    if (proteins.some(p => nameLower.includes(p)))
        return 'Protein';
    return 'Other';
}
/**
 * Extracts unit from a product line
 */
function extractUnit(line) {
    const unitPatterns = [
        /\b(kilo|kg)\b/i,
        /\b(mata)\b/i,
        /\b(unidad|unit)\b/i,
        /\b(caja)\b/i,
        /\b(malla\s*\(\s*\d+\s*kg\s*\))/i,
        /\b(mano)\b/i,
        /\b(racimo)\b/i,
    ];
    for (const pattern of unitPatterns) {
        const match = line.match(pattern);
        if (match)
            return match[1];
    }
    return 'Unidad';
}
/**
 * Parses a product line from the PDF
 */
function parseProductLine(line, id) {
    // Skip headers, footers, and metadata lines
    const skipPatterns = [
        /PIMA/i,
        /CENADA/i,
        /Pag\.\s*\d+/i,
        /Boletín/i,
        /Producto/i,
        /Mínimo/i,
        /Máximo/i,
        /Plaza/i,
        /Fecha/i,
        /^\s*$/,
    ];
    if (skipPatterns.some(pattern => pattern.test(line))) {
        return null;
    }
    // Extract product name (usually at the start, capitalized)
    const nameMatch = line.match(/^([A-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s\-()]+?)(?:\s+\d)/);
    if (!nameMatch)
        return null;
    const name = nameMatch[1].trim();
    // Extract numbers (prices)
    const numberPattern = /[\d,]+\.?\d*\s*[,.]?\s*\d*/g;
    const numbers = [];
    let match;
    while ((match = numberPattern.exec(line)) !== null) {
        const numStr = match[0];
        if ((0, number_normalizer_1.isValidPrice)(numStr)) {
            numbers.push((0, number_normalizer_1.normalizePrice)(numStr));
        }
    }
    // We expect at least 4 numbers: min, max, mode, average
    if (numbers.length < 4)
        return null;
    const [priceMin, priceMax, mode, average] = numbers;
    // Calculate volatility index
    const volatilityIndex = average > 0 ? ((priceMax - priceMin) / average) : 0;
    const unit = extractUnit(line);
    const category = categorizeProduct(name);
    return {
        id: `prod-${id}`,
        name,
        unit,
        priceMin,
        priceMax,
        mode,
        average,
        volatilityIndex,
        category,
    };
}
/**
 * Main parsing function
 */
async function parseBulletin() {
    try {
        console.log('📄 Reading PDF from:', PDF_PATH);
        // Check if file exists
        if (!fs.existsSync(PDF_PATH)) {
            throw new Error(`PDF file not found at: ${PDF_PATH}`);
        }
        const dataBuffer = fs.readFileSync(PDF_PATH);
        const data = await pdf(dataBuffer);
        console.log('📊 PDF parsed successfully');
        console.log(`   Pages: ${data.numpages}`);
        console.log(`   Text length: ${data.text.length} characters`);
        // Split text into lines
        const lines = data.text.split('\n');
        console.log(`   Lines: ${lines.length}`);
        // Parse products
        const products = [];
        let productId = 1;
        for (const line of lines) {
            const product = parseProductLine(line, productId);
            if (product) {
                products.push(product);
                productId++;
            }
        }
        console.log(`✅ Parsed ${products.length} products`);
        // Create bulletin object
        const bulletin = {
            date: '2025-12-23',
            source: 'PIMA-CENADA',
            products,
        };
        // Validate with Zod
        const validated = schema_zod_1.BulletinSchema.parse(bulletin);
        console.log('✅ Data validated with Zod schema');
        // Write to output file
        const outputDir = path.dirname(OUTPUT_PATH);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(validated, null, 2));
        console.log('✅ Data written to:', OUTPUT_PATH);
        console.log('\n📈 Sample products:');
        products.slice(0, 5).forEach(p => {
            console.log(`   - ${p.name} (${p.unit}): ₡${p.priceMin} - ₡${p.priceMax}`);
        });
    }
    catch (error) {
        console.error('❌ Error parsing bulletin:', error);
        throw error;
    }
}
// Run the parser
parseBulletin().catch(console.error);
