import { Injectable } from '@angular/core';
import { Order, Driver, Pricing, DEFAULT_PRICING, VEHICLES, Vehicle } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private ORDERS_KEY = 'shaheen_orders';
    private DRIVERS_KEY = 'shaheen_drivers';
    private PRICING_KEY = 'shaheen_pricing';

    private defaultDrivers: Driver[] = [
        { id: 'DRV001', name: 'Rahul Sharma', phone: '+91 9876543210', vehicleType: 'Bike', status: 'Active', active: true },
        { id: 'DRV002', name: 'Amit Singh', phone: '+91 8765432109', vehicleType: 'Auto', status: 'Active', active: true },
        { id: 'DRV003', name: 'Vikram Patel', phone: '+91 7654321098', vehicleType: 'Mini Truck', status: 'Active', active: true },
    ];

    constructor() {
        this.initData();
    }

    private initData() {
        if (!localStorage.getItem(this.DRIVERS_KEY)) {
            localStorage.setItem(this.DRIVERS_KEY, JSON.stringify(this.defaultDrivers));
        }
        if (!localStorage.getItem(this.PRICING_KEY)) {
            localStorage.setItem(this.PRICING_KEY, JSON.stringify(DEFAULT_PRICING));
        }
        if (!localStorage.getItem(this.ORDERS_KEY)) {
            localStorage.setItem(this.ORDERS_KEY, JSON.stringify([]));
        }
        if (!localStorage.getItem('shaheen_vehicles')) {
            localStorage.setItem('shaheen_vehicles', JSON.stringify(VEHICLES));
        }
    }

    clearAllData() {
        localStorage.removeItem(this.ORDERS_KEY);
        localStorage.removeItem(this.DRIVERS_KEY);
        localStorage.removeItem(this.PRICING_KEY);
        localStorage.removeItem('shaheen_vehicles');
        this.initData();
    }

    // Vehicles
    getVehicles(): Vehicle[] {
        const data = localStorage.getItem('shaheen_vehicles');
        return data ? JSON.parse(data) : VEHICLES;
    }

    saveVehicle(vehicle: Vehicle) {
        const vehicles = this.getVehicles();
        const index = vehicles.findIndex(v => v.type === vehicle.type);
        if (index > -1) {
            vehicles[index] = vehicle;
        } else {
            vehicles.push(vehicle);
            // Also initialize pricing for new vehicle
            const pricing = this.getPricing();
            if (!pricing.find(p => p.vehicleType === vehicle.type)) {
                pricing.push({ vehicleType: vehicle.type, baseFare: 50, perKm: 15 });
                this.updatePricing(pricing);
            }
        }
        localStorage.setItem('shaheen_vehicles', JSON.stringify(vehicles));
    }

    deleteVehicle(type: string) {
        const vehicles = this.getVehicles().filter(v => v.type !== type);
        localStorage.setItem('shaheen_vehicles', JSON.stringify(vehicles));

        // Cleanup pricing
        const pricing = this.getPricing().filter(p => p.vehicleType !== type);
        this.updatePricing(pricing);
    }

    // Orders
    getOrders(): Order[] {
        const data = localStorage.getItem(this.ORDERS_KEY);
        return data ? JSON.parse(data) : [];
    }

    getOrderById(id: string): Order | undefined {
        return this.getOrders().find(o => o.id === id);
    }

    saveOrder(order: Order) {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id === order.id);
        if (index > -1) {
            orders[index] = order;
        } else {
            orders.push(order);
        }
        localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
    }

    // Drivers
    getDrivers(): Driver[] {
        const data = localStorage.getItem(this.DRIVERS_KEY);
        return data ? JSON.parse(data) : [];
    }

    saveDriver(driver: Driver) {
        const drivers = this.getDrivers();
        const index = drivers.findIndex(d => d.id === driver.id);
        if (index > -1) {
            drivers[index] = { ...drivers[index], ...driver };
        } else {
            drivers.push(driver);
        }
        localStorage.setItem(this.DRIVERS_KEY, JSON.stringify(drivers));
    }

    deleteDriver(id: string) {
        const drivers = this.getDrivers().filter(d => d.id !== id);
        localStorage.setItem(this.DRIVERS_KEY, JSON.stringify(drivers));
    }

    getDriverStats(driverId: string) {
        const orders = this.getOrders();
        const driverOrders = orders.filter(o => o.driverId === driverId && (o.status as any) === 'Delivered');
        const totalEarnings = driverOrders.reduce((sum, o) => sum + (o.price * 0.8), 0); // 80% to driver

        return {
            completedOrders: driverOrders.length,
            totalEarnings,
            todayEarnings: totalEarnings * 0.3 // Mocking daily as 30% of total for demo
        };
    }

    // Pricing
    getPricing(): Pricing[] {
        const data = localStorage.getItem(this.PRICING_KEY);
        return data ? JSON.parse(data) : JSON.parse(JSON.stringify(DEFAULT_PRICING));
    }

    updatePricing(pricing: Pricing[]) {
        localStorage.setItem(this.PRICING_KEY, JSON.stringify(pricing));
    }

    // Helpers
    generateId(prefix: string): string {
        return `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
    }
}
