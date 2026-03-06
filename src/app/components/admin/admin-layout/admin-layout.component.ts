import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    template: `
    <div class="admin-wrapper bg-gray-50 min-h-screen pt-4">
        <div class="admin-tabs-container sticky top-0 z-50 shadow-sm">
            <div class="container max-w-6xl px-6">
                <nav class="flex gap-2 overflow-x-auto scrollbar-hide">
                    <a routerLink="/admin/dashboard" routerLinkActive="active" class="admin-tab-link flex-shrink-0">
                        <span class="material-icons-outlined text-sm">dashboard</span>
                        <span>Dashboard</span>
                    </a>
                    <a routerLink="/admin/orders" routerLinkActive="active" class="admin-tab-link flex-shrink-0">
                        <span class="material-icons-outlined text-sm">receipt_long</span>
                        <span>Orders</span>
                    </a>
                    <a routerLink="/admin/drivers" routerLinkActive="active" class="admin-tab-link flex-shrink-0">
                        <span class="material-icons-outlined text-sm">people</span>
                        <span>Manage Partners</span>
                    </a>
                    <a routerLink="/admin/vehicles" routerLinkActive="active" class="admin-tab-link flex-shrink-0">
                        <span class="material-icons-outlined text-sm">local_shipping</span>
                        <span>Manage Fleet</span>
                    </a>
                    <a routerLink="/admin/pricing" routerLinkActive="active" class="admin-tab-link flex-shrink-0">
                        <span class="material-icons-outlined text-sm">payments</span>
                        <span>Manage Pricing</span>
                    </a>
                </nav>
            </div>
        </div>

        <main class="py-8">
            <router-outlet></router-outlet>
        </main>
    </div>
    `
})
export class AdminLayoutComponent { }
