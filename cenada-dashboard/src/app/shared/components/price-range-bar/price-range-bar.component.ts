import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-price-range-bar',
    standalone: true,
    imports: [CommonModule, TooltipModule],
    template: `
        <div class="price-range-container">
            <div class="price-range-bar">
                <div class="range-fill" [style.left.%]="0" [style.width.%]="100"></div>
                <div class="mode-indicator" [style.left.%]="modePosition" 
                     [pTooltip]="modeTooltipText" 
                     tooltipPosition="top"
                     [showDelay]="300">
                    <span class="mode-value">{{ formatPrice(mode) }}</span>
                    <div class="mode-marker"></div>
                </div>
                <div class="average-marker" [style.left.%]="averagePosition" [title]="'Average: ' + formatPrice(average)">
                    <div class="marker-dot"></div>
                </div>
            </div>
            <div class="price-labels">
                <span class="min-label">{{ formatPrice(min) }}</span>
                <span class="avg-label">{{ formatPrice(average) }}</span>
                <span class="max-label">{{ formatPrice(max) }}</span>
            </div>
        </div>
    `,
    styles: [`
        .price-range-container {
            width: 100%;
            padding: 0.5rem 0;
            padding-top: 1.75rem;
        }

        .price-range-bar {
            position: relative;
            height: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            margin-bottom: 0.5rem;
            overflow: visible;
        }

        .range-fill {
            position: absolute;
            height: 100%;
            background: linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #f43f5e 100%);
            border-radius: 4px;
        }

        .mode-indicator {
            position: absolute;
            top: -28px;
            transform: translateX(-50%);
            z-index: 3;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: help;
            transition: all 0.2s ease;
        }

        .mode-indicator:hover {
            transform: translateX(-50%) scale(1.1);
        }

        .mode-value {
            font-size: 0.75rem;
            font-weight: 600;
            color: #818cf8;
            background: rgba(99, 102, 241, 0.15);
            padding: 0.125rem 0.5rem;
            border-radius: 0.375rem;
            margin-bottom: 0.25rem;
            white-space: nowrap;
            border: 1px solid rgba(99, 102, 241, 0.3);
        }

        .mode-marker {
            width: 2px;
            height: 16px;
            background: #6366f1;
            border-radius: 1px;
        }

        .average-marker {
            position: absolute;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 2;
        }

        .marker-dot {
            width: 14px;
            height: 14px;
            background: #14b8a6;
            border: 2px solid #0f172a;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(20, 184, 166, 0.5);
            cursor: help;
            transition: transform 0.2s ease;
        }

        .marker-dot:hover {
            transform: scale(1.3);
        }

        .price-labels {
            display: flex;
            justify-content: space-between;
            font-size: 0.875rem;
            font-weight: 600;
            color: #94a3b8;
        }

        .avg-label {
            font-weight: 600;
            color: #14b8a6;
        }
    `]
})
export class PriceRangeBarComponent {
    @Input() min!: number;
    @Input() max!: number;
    @Input() average!: number;
    @Input() mode!: number;

    get averagePosition(): number {
        if (this.max === this.min) return 50;
        return ((this.average - this.min) / (this.max - this.min)) * 100;
    }

    get modePosition(): number {
        if (this.max === this.min) return 50;
        return ((this.mode - this.min) / (this.max - this.min)) * 100;
    }

    get modeTooltipText(): string {
        return 'Moda (Mode): The most frequently occurring price in the market. Unlike Promedio (Average), which is the mathematical mean, Mode shows what price you are most likely to encounter.';
    }

    formatPrice(value: number): string {
        if (value === undefined || value === null || isNaN(value)) {
            return '₡0';
        }
        return `₡${value.toLocaleString('es-CR')}`;
    }
}
