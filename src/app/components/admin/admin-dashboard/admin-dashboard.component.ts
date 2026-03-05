import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../../services/storage.service';
import { Order, Driver } from '../../../models/models';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
    stats = {
        totalOrders: 0,
        activeDrivers: 0,
        completedDeliveries: 0,
        totalRevenue: 0
    };

    recentOrders: Order[] = [];
    private refreshInterval: any;

    constructor(private storage: StorageService) { }

    ngOnInit() {
        this.loadStats();
        // Poll for updates every 3 seconds
        this.refreshInterval = setInterval(() => {
            this.loadStats();
        }, 3000);
    }

    ngOnDestroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    loadStats() {
        const orders = this.storage.getOrders();
        const drivers = this.storage.getDrivers();

        this.stats.totalOrders = orders.length;
        this.stats.activeDrivers = drivers.filter(d => d.active).length;
        this.stats.completedDeliveries = orders.filter(o => o.status === 'Delivered').length;
        this.stats.totalRevenue = orders
            .filter(o => o.status === 'Delivered')
            .reduce((acc, curr) => acc + curr.price, 0);

        this.recentOrders = orders.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
    }

    factoryReset() {
        if (confirm('CRITICAL: This will delete ALL orders, ALL drivers, and reset all settings to default. Are you sure you want to proceed?')) {
            this.storage.clearAllData();
            window.location.reload(); // Hard reload to reset all states
        }
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'Pending': return 'badge-warning';
            case 'Driver Assigned':
            case 'Picked Up':
            case 'On The Way': return 'badge-info';
            case 'Delivered': return 'badge-success';
            case 'Cancelled': return 'badge-danger';
            default: return '';
        }
    }
}
