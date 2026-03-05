import { Component, OnInit, OnDestroy, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Order } from '../../models/models';
import { StorageService } from '../../services/storage.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="tracking-container py-12">
      <div class="container max-w-3xl">
        <div *ngIf="order; else notFound" class="space-y-8">
          
          <div class="card tracking-card overflow-hidden">
            <div class="tracking-header bg-primary p-6 text-white text-center">
              <h1 class="text-2xl font-bold">Tracking Order #{{order.id}}</h1>
              <p class="opacity-80">Placed on {{order.createdAt | date:'short'}}</p>
            </div>

            <div class="p-8">
              <!-- Stepper -->
              <div class="stepper-wrapper mb-12 relative">
                <div class="stepper-line"></div>
                <div class="stepper-progress transition-all duration-1000" 
                  [style.width.%]="getProgressWidth()"></div>
                
                <div class="stepper-steps flex justify-between">
                  <div *ngFor="let step of statuses; let i = index" class="step-item flex flex-col items-center">
                    <div [class.completed]="isStepComplete(step)" 
                         class="step-dot flex items-center justify-center text-white font-bold transition-all">
                      <span *ngIf="isStepComplete(step)" class="material-icons-outlined text-sm">check</span>
                      <span *ngIf="!isStepComplete(step)">{{i + 1}}</span>
                    </div>
                    <span class="step-label mt-2 text-xs font-bold" 
                          [class.active]="isStepComplete(step)">{{step}}</span>
                  </div>
                </div>
              </div>

              <div class="grid md-grid-cols-2 gap-8 mt-12">
                <div class="space-y-4">
                  <div class="info-group">
                    <h3 class="info-label text-xs uppercase tracking-wider">Status</h3>
                    <p class="info-value text-xl font-bold">{{order.status}}</p>
                  </div>
                  <div class="info-group">
                    <h3 class="info-label text-xs uppercase tracking-wider">Vehicle</h3>
                    <p class="info-value text-lg font-medium">{{order.vehicleType}}</p>
                  </div>
                  <div class="info-group" *ngIf="order.driverName">
                    <h3 class="info-label text-xs uppercase tracking-wider">Driver</h3>
                    <p class="info-value text-lg font-medium">{{order.driverName}}</p>
                  </div>
                </div>

                <div class="space-y-4">
                  <div class="info-group">
                    <h3 class="info-label text-xs uppercase tracking-wider">Pickup</h3>
                    <p class="info-text text-sm">{{order.pickup.address}}</p>
                  </div>
                  <div class="info-group">
                    <h3 class="info-label text-xs uppercase tracking-wider">Drop</h3>
                    <p class="info-text text-sm">{{order.drop.address}}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Real Leaflet Map -->
          <div class="map-wrapper card overflow-hidden">
            <div id="map" style="height: 400px; width: 100%;"></div>
            
            <div class="map-labels-overlay flex gap-2">
                <span class="map-badge badge-pickup">
                  <div class="dot dot-mini bg-primary"></div>
                  <span>Pickup</span>
                </span>
                <span class="map-badge badge-drop">
                  <div class="dot dot-mini dot-outline"></div>
                  <span>Drop</span>
                </span>
             </div>
          </div>

        </div>

        <ng-template #notFound>
          <div class="text-center py-20">
             <h2 class="text-2xl font-bold text-gray-900">Order Not Found</h2>
             <p class="text-gray-500 mt-2">We couldn't find the order ID you're looking for.</p>
             <button routerLink="/book" class="btn btn-link mt-6">Book a delivery now</button>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .tracking-container { background-color: var(--gray-50); min-height: 100vh; }
    .max-w-3xl { max-width: 48rem; margin: 0 auto; }
    .tracking-card { padding: 0; }
    .bg-primary { background-color: var(--primary); }
    .opacity-80 { opacity: 0.8; }
    
    /* Stepper */
    .stepper-line { position: absolute; top: 1.25rem; left: 0; width: 100%; height: 6px; background-color: var(--gray-100); z-index: 1; border-radius: 3px; }
    .stepper-progress { position: absolute; top: 1.25rem; left: 0; height: 6px; background: linear-gradient(to right, var(--primary-dark), var(--primary)); z-index: 2; border-radius: 3px; box-shadow: 0 2px 4px rgba(229, 57, 53, 0.2); }
    .stepper-steps { position: relative; z-index: 3; }
    .step-dot { width: 2.75rem; height: 2.75rem; border-radius: 50%; background-color: var(--white); border: 2px solid var(--gray-200); box-shadow: var(--shadow-sm); color: var(--gray-400); font-size: 0.875rem; }
    .step-dot.completed { background-color: var(--primary); border-color: var(--primary); color: var(--white); box-shadow: var(--shadow-primary); }
    .step-label { color: var(--gray-400); font-size: 0.75rem; letter-spacing: 0.025em; transition: color 0.3s; }
    .step-label.active { color: var(--gray-900); font-weight: 800; }

    /* Info Groups */
    .info-label { color: var(--gray-400); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
    .info-value { color: var(--gray-900); }
    .info-text { color: var(--gray-600); }

    /* Map */
    .map-wrapper { 
        position: relative; 
        border: 1px solid var(--gray-200); 
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md); 
        margin-top: 2rem;
    }
    #map { background: var(--gray-100); border-radius: var(--radius-lg); }
    .map-labels-overlay { position: absolute; top: 1.25rem; right: 1.25rem; z-index: 1000; }
    .map-badge { 
        display: flex; 
        align-items: center; 
        gap: 0.625rem; 
        background: rgba(255, 255, 255, 0.9); 
        backdrop-filter: blur(8px);
        padding: 0.625rem 1rem; 
        border-radius: var(--radius); 
        font-size: 0.75rem; 
        font-weight: 800; 
        color: var(--gray-800); 
        box-shadow: var(--shadow-lg); 
        border: 1px solid rgba(255,255,255,0.5);
    }
    .dot-mini { width: 0.625rem; height: 0.625rem; border-radius: 50%; }
    .dot-outline { border: 2px solid var(--primary); background: white; }
    
    .btn-link { color: var(--primary); background: none; border: none; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
    .btn-link:hover { opacity: 0.8; }
  `]
})
export class TrackingComponent implements OnInit, OnDestroy, AfterViewInit {
  order: Order | undefined;
  statuses = ['Pending', 'Driver Assigned', 'Arrived at Pickup', 'Picked Up', 'On The Way', 'Delivered'];

  private map: L.Map | undefined;
  private pickupMarker: L.Marker | undefined;
  private dropMarker: L.Marker | undefined;
  private driverMarker: L.Marker | undefined;
  private polyline: L.Polyline | undefined;

  mockDriverPos = { lat: 0, lng: 0 };
  private moveInterval: any;

  constructor(
    private route: ActivatedRoute,
    private storage: StorageService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.order = this.storage.getOrderById(params['orderId']);
      if (this.order) {
        if (this.order.status === 'On The Way') {
          this.startDriverMovement();
        }
        this.initMapData();
      }
    });

    // Periodically refresh order status for demo
    setInterval(() => {
      if (this.order) {
        const updatedOrder = this.storage.getOrderById(this.order.id);
        if (updatedOrder && updatedOrder.status !== this.order.status) {
          this.order = updatedOrder;
          if (this.order.status === 'On The Way' && !this.moveInterval) {
            this.startDriverMovement();
          } else if (this.order.status === 'Delivered' || this.order.status === 'Cancelled') {
            this.stopDriverMovement();
          }
          this.updateMarkers();
        }
      }
    }, 2000);
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    this.stopDriverMovement();
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap() {
    if (this.map) return;

    this.map = L.map('map', {
      zoomControl: false
    }).setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    this.initMapData();
  }

  private initMapData() {
    if (!this.map || !this.order) return;

    const pickupIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: var(--primary); width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    const dropIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: white; width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--primary); box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    this.pickupMarker = L.marker([this.order.pickup.lat, this.order.pickup.lng], { icon: pickupIcon })
      .addTo(this.map)
      .bindPopup('Pickup: ' + this.order.pickup.address);

    this.dropMarker = L.marker([this.order.drop.lat, this.order.drop.lng], { icon: dropIcon })
      .addTo(this.map)
      .bindPopup('Drop: ' + this.order.drop.address);

    this.polyline = L.polyline([
      [this.order.pickup.lat, this.order.pickup.lng],
      [this.order.drop.lat, this.order.drop.lng]
    ], { color: 'var(--primary)', weight: 3, opacity: 0.6, dashArray: '5, 10' }).addTo(this.map);

    this.updateMarkers();

    // Fit bounds
    const bounds = L.latLngBounds([
      [this.order.pickup.lat, this.order.pickup.lng],
      [this.order.drop.lat, this.order.drop.lng]
    ]);
    this.map.fitBounds(bounds, { padding: [50, 50] });
  }

  private updateMarkers() {
    if (!this.map || !this.order) return;

    if (this.order.status === 'On The Way' || this.order.status === 'Picked Up' ||
      this.order.status === 'Arrived at Pickup' || this.order.status === 'Driver Assigned') {
      const driverIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: var(--primary); width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 0 10px var(--primary);"><span class="material-icons-outlined" style="font-size: 16px;">local_shipping</span></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const pos = this.order.status === 'On The Way' ?
        [this.mockDriverPos.lat, this.mockDriverPos.lng] :
        [this.order.pickup.lat, this.order.pickup.lng];

      if (!this.driverMarker) {
        this.driverMarker = L.marker(pos as L.LatLngExpression, { icon: driverIcon }).addTo(this.map);
      } else {
        this.driverMarker.setLatLng(pos as L.LatLngExpression);
      }
    } else if (this.driverMarker) {
      this.driverMarker.remove();
      this.driverMarker = undefined;
    }
  }

  startDriverMovement() {
    if (!this.order) return;

    // Start slightly offset from pickup
    this.mockDriverPos = {
      lat: this.order.pickup.lat,
      lng: this.order.pickup.lng
    };

    this.moveInterval = setInterval(() => {
      if (this.order && this.order.status === 'On The Way') {
        const step = 0.0005;
        const dLat = this.order.drop.lat - this.mockDriverPos.lat;
        const dLng = this.order.drop.lng - this.mockDriverPos.lng;

        const dist = Math.sqrt(dLat * dLat + dLng * dLng);
        if (dist > step) {
          this.mockDriverPos.lat += (dLat / dist) * step;
          this.mockDriverPos.lng += (dLng / dist) * step;
          this.updateMarkers();
        } else {
          this.stopDriverMovement();
        }
      }
    }, 1000);
  }

  stopDriverMovement() {
    if (this.moveInterval) {
      clearInterval(this.moveInterval);
      this.moveInterval = null;
    }
  }

  isStepComplete(step: string): boolean {
    if (!this.order) return false;
    const currentIndex = this.statuses.indexOf(this.order.status as any);
    const stepIndex = this.statuses.indexOf(step as any);
    return stepIndex <= currentIndex;
  }

  getProgressWidth(): number {
    if (!this.order) return 0;
    const index = this.statuses.indexOf(this.order.status as any);
    return (index / (this.statuses.length - 1)) * 100;
  }
}
