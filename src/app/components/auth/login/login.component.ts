import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, UserRole } from '../../../services/auth.service';
import { StorageService } from '../../../services/storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm-px-6 lg-px-8 bg-gray-50">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-black text-gray-900">Sign in to your account</h2>
          <p class="mt-2 text-sm text-gray-500">Select your role to continue</p>
        </div>

        <div class="card p-8 shadow-lg border-none">
          <div class="flex gap-4 mb-8">
            <button (click)="role = 'driver'" 
                    [class]="role === 'driver' ? 'btn-primary' : 'btn-outline-primary'"
                    class="btn flex-1 py-3">
              <span class="material-icons-outlined text-sm">local_shipping</span>
              Driver
            </button>
            <button (click)="role = 'admin'" 
                    [class]="role === 'admin' ? 'btn-primary' : 'btn-outline-primary'"
                    class="btn flex-1 py-3">
              <span class="material-icons-outlined text-sm">admin_panel_settings</span>
              Admin
            </button>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <div *ngIf="role === 'driver'">
              <label class="block text-sm font-bold text-gray-700 mb-2">Driver Phone Number</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 material-icons-outlined text-gray-400">phone</span>
                <input type="text" [(ngModel)]="phone" name="phone" 
                       class="input pl-10" placeholder="Enter your registered phone">
              </div>
              <p class="text-xs text-gray-400 mt-2">Hint: Use registered phone (e.g. +91 9876543210)</p>
            </div>

            <div *ngIf="role === 'admin'">
              <label class="block text-sm font-bold text-gray-700 mb-2">Admin Email</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 material-icons-outlined text-gray-400">email</span>
                <input type="email" [(ngModel)]="email" name="email" 
                       class="input pl-10" placeholder="admin@shaheen.com">
              </div>
              <p class="text-xs text-gray-400 mt-2">Hint: Any email works for this demo</p>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 material-icons-outlined text-gray-400">lock</span>
                <input type="password" [(ngModel)]="password" name="password" 
                       class="input pl-10" placeholder="••••••••">
              </div>
            </div>

            <div *ngIf="error" class="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
              {{error}}
            </div>

            <button type="submit" class="btn btn-primary w-full py-4 text-lg font-bold shadow-primary">
              Sign In
            </button>
          </form>
        </div>
        
        <div class="text-center">
          <a routerLink="/" class="text-sm font-bold text-primary hover:text-primary-dark transition-colors">
            Back to Customer Booking
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class LoginComponent {
  role: UserRole = 'driver';
  phone: string = '';
  email: string = '';
  password: string = 'password'; // Default for demo
  error: string = '';

  constructor(
    private auth: AuthService,
    private storage: StorageService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  onSubmit() {
    this.error = '';
    if (this.role === 'admin') {
      if (this.auth.login('admin')) {
        this.redirect();
      }
    } else if (this.role === 'driver') {
      const drivers = this.storage.getDrivers();

      // Normalize: remove all non-digits
      const normalize = (p: string) => p.replace(/\D/g, '');
      const inputDigits = normalize(this.phone);

      const driver = drivers.find(d => {
        const driverDigits = normalize(d.phone);
        // Match if exact or if input is last 10 digits of driver phone
        return driverDigits === inputDigits ||
          (inputDigits.length === 10 && driverDigits.endsWith(inputDigits));
      });

      if (driver) {
        if (this.auth.login('driver', driver.id, driver.name)) {
          this.redirect();
        }
      } else {
        this.error = 'Driver not found. Please check the phone number.';
      }
    }
  }

  private redirect() {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || (this.role === 'admin' ? '/admin/dashboard' : '/driver/dashboard');
    this.router.navigateByUrl(returnUrl);
  }
}
