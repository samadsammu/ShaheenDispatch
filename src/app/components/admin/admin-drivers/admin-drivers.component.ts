import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../../services/storage.service';
import { Driver } from '../../../models/models';

@Component({
    selector: 'app-admin-drivers',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-drivers.component.html'
})
export class AdminDriversComponent implements OnInit {
    drivers: any[] = [];
    vehicles: any[] = [];
    showModal = false;
    isEdit = false;
    driverForm: Partial<Driver> = {};

    constructor(private storage: StorageService) { }

    ngOnInit() {
        this.loadDrivers();
        this.vehicles = this.storage.getVehicles();
    }

    loadDrivers() {
        const drivers = this.storage.getDrivers();
        this.drivers = drivers.map(d => ({
            ...d,
            stats: this.storage.getDriverStats(d.id)
        }));
    }

    openModal(driver?: Driver) {
        if (driver) {
            this.isEdit = true;
            this.driverForm = { ...driver };
        } else {
            this.isEdit = false;
            this.driverForm = { status: 'Active', active: true, vehicleType: 'Bike' };
        }
        this.showModal = true;
    }

    saveDriver() {
        if (this.driverForm.name && this.driverForm.phone) {
            const driverToSave = { ...this.driverForm } as Driver;
            if (!this.isEdit) {
                driverToSave.id = this.storage.generateId('DRV');
            }
            driverToSave.status = driverToSave.active ? 'Active' : 'Inactive';
            this.storage.saveDriver(driverToSave);
            this.loadDrivers();
            this.showModal = false;
        }
    }

    toggleActive(driver: any) {
        const updated = { ...driver, active: !driver.active };
        updated.status = updated.active ? 'Active' : 'Inactive';
        this.storage.saveDriver(updated);
        this.loadDrivers();
    }

    deleteDriver(id: string) {
        if (confirm('Are you sure you want to delete this driver?')) {
            this.storage.deleteDriver(id);
            this.loadDrivers();
        }
    }
}
