import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../../services/storage.service';
import { Vehicle } from '../../../models/models';

@Component({
  selector: 'app-admin-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container">
      <div class="container max-w-5xl px-6">
        <header class="mb-8 flex flex-col sm-flex-row justify-between items-start sm-items-center gap-6">
          <div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">Fleet Management</h2>
            <p class="text-xs text-gray-500 font-medium">Manage vehicle types and capacities</p>
          </div>
          <button (click)="openModal()" class="btn btn-primary btn-sm shadow-primary">
            <span class="material-icons-outlined text-sm">add</span>
            <span>New Vehicle</span>
          </button>
        </header>

        <div class="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-6">
          <div *ngFor="let v of vehicles" class="card shadow-md border-none group hover:shadow-xl transition-all">
            <div class="flex justify-between items-start mb-6">
              <div class="h-14 w-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center">
                <span class="material-icons-outlined text-3xl">{{v.icon}}</span>
              </div>
              <div class="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button (click)="openModal(v)" class="btn btn-icon btn-sm h-8 w-8">
                  <span class="material-icons-outlined text-sm">edit</span>
                </button>
                <button (click)="deleteVehicle(v.type)" class="btn btn-icon btn-sm h-8 w-8 btn-outline-danger">
                  <span class="material-icons-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
            <h3 class="text-xl font-black text-gray-900">{{v.name}}</h3>
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{{v.type}}</p>
            <div class="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-gray-600">
              <span class="material-icons-outlined text-sm text-gray-400">inventory_2</span>
              <span class="text-sm font-medium">{{v.capacity}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vehicle Modal -->
    <div *ngIf="showModal" class="modal-overlay">
      <div class="modal card p-0 max-w-md shadow-2xl border-none overflow-hidden">
        <div class="px-8 py-6 bg-gray-900 text-white flex justify-between items-center">
          <h2 class="text-xl font-black">{{isEdit ? 'Update Vehicle' : 'New Vehicle Type'}}</h2>
          <button (click)="showModal = false" class="btn btn-icon text-white/50 hover:text-white">
            <span class="material-icons-outlined">close</span>
          </button>
        </div>

        <form (ngSubmit)="saveVehicle()" class="p-8 space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-black text-gray-700">Display Name</label>
              <input type="text" name="name" [(ngModel)]="form.name" class="input" placeholder="e.g. Drone" required>
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-black text-gray-700">Type (ID)</label>
              <input type="text" name="type" [(ngModel)]="form.type" class="input" placeholder="e.g. drone" [disabled]="isEdit" required>
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-black text-gray-700">Material Icon Name</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 material-icons-outlined text-gray-400">{{form.icon || 'help_outline'}}</span>
              <input type="text" name="icon" [(ngModel)]="form.icon" class="input pl-10" placeholder="e.g. airplane_ticket" required>
            </div>
            <p class="text-[10px] text-gray-400 font-bold uppercase mt-1">Use any Google Material Icon name</p>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-black text-gray-700">Load Capacity</label>
            <input type="text" name="capacity" [(ngModel)]="form.capacity" class="input" placeholder="e.g. Up to 5kg" required>
          </div>

          <div class="flex gap-6 pt-4">
            <button type="button" (click)="showModal = false" class="btn btn-outline flex-1 py-3 font-black">Cancel</button>
            <button type="submit" class="btn btn-primary flex-1 py-3 font-black shadow-primary">Save Vehicle</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AdminVehiclesComponent implements OnInit {
  vehicles: Vehicle[] = [];
  showModal = false;
  isEdit = false;
  form: Partial<Vehicle> = {};

  constructor(private storage: StorageService) { }

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.vehicles = this.storage.getVehicles();
  }

  openModal(v?: Vehicle) {
    if (v) {
      this.isEdit = true;
      this.form = { ...v };
    } else {
      this.isEdit = false;
      this.form = { icon: 'local_shipping' };
    }
    this.showModal = true;
  }

  saveVehicle() {
    if (this.form.name && this.form.type) {
      this.storage.saveVehicle(this.form as Vehicle);
      this.loadVehicles();
      this.showModal = false;
    }
  }

  deleteVehicle(type: string) {
    if (confirm('Are you sure? This will also remove pricing for this vehicle type.')) {
      this.storage.deleteVehicle(type);
      this.loadVehicles();
    }
  }
}
