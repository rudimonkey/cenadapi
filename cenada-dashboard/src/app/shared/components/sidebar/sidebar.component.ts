import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

interface NavItem {
    label: string;
    route: string;
    icon: string;
}

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, TranslateModule],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
    collapsed = signal(false);

    navItems: NavItem[] = [
        {
            label: 'COMMON.OVERVIEW',
            route: '/overview',
            icon: 'pi pi-chart-bar'
        },
        {
            label: 'COMMON.PRODUCTS',
            route: '/products',
            icon: 'pi pi-box'
        }
    ];

    constructor(public translate: TranslateService) { }

    switchLanguage(lang: string) {
        this.translate.use(lang);
    }

    toggleSidebar() {
        this.collapsed.update(val => !val);
    }
}
