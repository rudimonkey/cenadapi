import * as fs from 'fs';
import * as path from 'path';
import { BulletinSchema, Product } from './schema.zod';
import { normalizePrice, isValidPrice } from './number-normalizer';
import { categorizeProduct, extractWeightKg } from './category-config';

const pdfParse = require('pdf-parse');

/**
 * Path to the PDF file
 */
const PDF_PATH = 'C:\\Users\\JimRD\\Desktop\\SIMM-Boletin de Precios PIMA-Plaza 2025-12-23.pdf';
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'assets', 'data', 'current-prices.json');

/**
 * Extracts unit from a product line
 */
function extractUnit(line: string): string {
    // Match full Malla/Caja patterns with weight first
    const mallaMatch = line.match(/malla\s*\(\s*\d+\s*kg\s*\)/i);
    if (mallaMatch) return mallaMatch[0];

    const cajaMatch = line.match(/caja\s*\(\s*\d+\s*kg\s*\)/i);
    if (cajaMatch) return cajaMatch[0];

    // Simple unit patterns
    const unitPatterns = [
        /\b(kilo|kg)\b/i,
        /\b(mata)\b/i,
        /\b(unidad|unit)\b/i,
        /\b(caja)\b/i,
        /\b(malla)\b/i,
        /\b(mano)\b/i,
        /\b(racimo)\b/i,
    ];

    for (const pattern of unitPatterns) {
        const match = line.match(pattern);
        if (match) return match[1];
    }

    return 'Unidad';
}

/**
 * State machine parser for multi-line product entries
 */
function parseProductsWithStateMachine(lines: string[]): Product[] {
    const products: Product[] = [];
    let productId = 1;

    // Skip patterns for headers/footers
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
    ];

    const shouldSkipLine = (line: string): boolean => {
        return skipPatterns.some(pattern => pattern.test(line)) || line.trim() === '';
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (shouldSkipLine(line)) continue;

        // Detect product start: capitalized word at beginning
        const nameMatch = line.match(/^([A-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s\-()\/]+?)(?:\s+\d)/);
        if (!nameMatch) continue;

        let fullLine = line;
        let name = nameMatch[1].trim();

        // Check if next line might be a continuation (doesn't start with capital or is numeric)
        while (i + 1 < lines.length) {
            const nextLine = lines[i + 1].trim();
            if (nextLine === '' || shouldSkipLine(nextLine)) break;
            if (/^[A-ZÁÉÍÓÚÑ]/.test(nextLine)) break; // Next product started
            if (/^\d/.test(nextLine)) break; // Just numbers, not part of name

            // Continuation line
            fullLine += ' ' + nextLine;
            i++;
        }

        // Extract numbers (prices)
        const numberPattern = /[\d,]+\.?\d*\s*[,.]?\s*\d*/g;
        const numbers: number[] = [];
        let match;

        while ((match = numberPattern.exec(fullLine)) !== null) {
            const numStr = match[0];
            if (isValidPrice(numStr)) {
                const normalized = normalizePrice(numStr);
                if (normalized > 0) {
                    numbers.push(normalized);
                }
            }
        }

        // We expect at least 4 numbers: min, max, mode, average
        if (numbers.length < 4) continue;

        const [priceMin, priceMax, mode, average] = numbers;

        // Validate parsed numbers make sense
        if (priceMin > priceMax || average <= 0) continue;

        // Calculate volatility index
        const volatilityIndex = average > 0 ? ((priceMax - priceMin) / average) : 0;

        const unit = extractUnit(fullLine);
        const category = categorizeProduct(name);
        const weightKg = extractWeightKg(unit);

        // Calculate pricePerKilo if we have weight
        let pricePerKilo: number | undefined;
        if (weightKg && weightKg > 0) {
            pricePerKilo = average / weightKg;
        }

        products.push({
            id: `prod-${productId}`,
            name,
            unit,
            priceMin,
            priceMax,
            mode,
            average,
            volatilityIndex,
            category,
            ...(weightKg && { weightKg }),
            ...(pricePerKilo && { pricePerKilo }),
        });

        productId++;
    }

    return products;
}

/**
 * Main parsing function
 */
async function parseBulletin(): Promise<void> {
    try {
        console.log('📄 Reading PDF from:', PDF_PATH);

        // Check if file exists
        if (!fs.existsSync(PDF_PATH)) {
            throw new Error(`PDF file not found at: ${PDF_PATH}`);
        }

        const dataBuffer = fs.readFileSync(PDF_PATH);
        const data = await pdfParse(dataBuffer);

        console.log('📊 PDF parsed successfully');
        console.log(`   Pages: ${data.numpages}`);
        console.log(`   Text length: ${data.text.length} characters`);

        // Split text into lines
        const lines = data.text.split('\n');
        console.log(`   Lines: ${lines.length}`);

        // Parse products with state machine
        const products = parseProductsWithStateMachine(lines);

        console.log(`✅ Parsed ${products.length} products`);

        // Create bulletin object
        const bulletin = {
            date: '2025-12-23',
            source: 'PIMA-CENADA' as const,
            products,
        };

        // Validate with Zod
        const validated = BulletinSchema.parse(bulletin);

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
            console.log(`   - ${p.name} (${p.unit}): ₡${p.priceMin} - ₡${p.priceMax} | Avg: ₡${p.average}`);
            if (p.pricePerKilo) {
                console.log(`     Per Kilo: ₡${p.pricePerKilo.toFixed(2)}`);
            }
        });

    } catch (error) {
        console.error('❌ Error parsing bulletin:', error);
        throw error;
    }
}

// Run the parser
parseBulletin().catch(console.error);

