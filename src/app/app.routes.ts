import { Routes } from '@angular/router';
import { BookingComponent } from './components/booking/booking.component';
import { TrackingComponent } from './components/tracking/tracking.component';
import { DriverDashboardComponent } from './components/driver/driver-dashboard/driver-dashboard.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminOrdersComponent } from './components/admin/admin-orders/admin-orders.component';
import { AdminDriversComponent } from './components/admin/admin-drivers/admin-drivers.component';
import { AdminPricingComponent } from './components/admin/admin-pricing/admin-pricing.component';
import { AdminVehiclesComponent } from './components/admin/admin-vehicles/admin-vehicles.component';
import { LoginComponent } from './components/auth/login/login.component';
import { authGuard } from './guards/auth.guard';

import { AdminLayoutComponent } from './components/admin/admin-layout/admin-layout.component';

export const routes: Routes = [
    { path: '', redirectTo: 'book', pathMatch: 'full' },
    { path: 'book', component: BookingComponent },
    { path: 'login', component: LoginComponent },
    { path: 'track/:orderId', component: TrackingComponent },
    {
        path: 'driver/dashboard',
        component: DriverDashboardComponent,
        canActivate: [authGuard],
        data: { role: 'driver' }
    },
    {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [authGuard],
        data: { role: 'admin' },
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: AdminDashboardComponent },
            { path: 'orders', component: AdminOrdersComponent },
            { path: 'drivers', component: AdminDriversComponent },
            { path: 'pricing', component: AdminPricingComponent },
            { path: 'vehicles', component: AdminVehiclesComponent },
        ]
    },
    { path: '**', redirectTo: 'book' }
];
