import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-card glass-nav sticky top-0 z-50">
      <div class="container px-4 md-px-6">
        <div class="navbar-nav h-20 flex justify-between items-center">
          <div class="flex items-center gap-4 md-gap-12">
            <a routerLink="/" class="flex items-center no-underline">
              <span class="text-xl md-text-2xl font-black text-primary tracking-tighter">SHAHEEN</span>
              <span class="text-xl md-text-2xl font-light text-gray-700 ml-1">EXPRESS</span>
            </a>
            
            <!-- Desktop Links -->
            <div class="hidden sm-flex nav-links gap-8">
              <a routerLink="/book" routerLinkActive="active" class="nav-link-premium">
                Book Delivery
              </a>
              <ng-container *ngIf="auth.currentUser$ | async as user">
                <a *ngIf="user.role === 'driver'" routerLink="/driver/dashboard" routerLinkActive="active" class="nav-link-premium">
                  Driver Panel
                </a>
                <a *ngIf="user.role === 'admin'" routerLink="/admin/dashboard" routerLinkActive="active" class="nav-link-premium">
                  Admin Panel
                </a>
              </ng-container>
              <a *ngIf="!(auth.currentUser$ | async)" routerLink="/login" class="nav-link-premium">
                Staff Login
              </a>
            </div>
          </div>

          <div class="flex items-center gap-2 sm-gap-4">
             <div *ngIf="auth.currentUser$ | async as user" class="flex items-center gap-2 md-gap-4">
                <span class="hidden md-block text-sm font-bold text-gray-600">Hi, {{user.name}}</span>
                <div (click)="logout()" class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer" title="Logout">
                  <span class="material-icons-outlined text-xl">logout</span>
                </div>
             </div>
             
             <!-- Login Icon for Mobile (Visible when not logged in) -->
             <div *ngIf="!(auth.currentUser$ | async)" class="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white shadow-primary cursor-pointer" routerLink="/login">
                <span class="material-icons-outlined text-xl">person</span>
             </div>

             <!-- Mobile Menu Toggle -->
             <button (click)="isMobileMenuOpen = !isMobileMenuOpen" class="sm-hidden flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                <span class="material-icons-outlined text-2xl">{{ isMobileMenuOpen ? 'close' : 'menu' }}</span>
             </button>
          </div>
        </div>

        <!-- Mobile Menu Drawer -->
        <div *ngIf="isMobileMenuOpen" class="sm-hidden py-4 border-t border-gray-100 animate-slide-in">
          <div class="flex flex-col gap-4">
            <a routerLink="/book" routerLinkActive="active" (click)="isMobileMenuOpen = false" class="nav-link-mobile">
              <span class="material-icons-outlined text-xl">local_shipping</span>
              Book Delivery
            </a>
            <ng-container *ngIf="auth.currentUser$ | async as user">
              <a *ngIf="user.role === 'driver'" routerLink="/driver/dashboard" routerLinkActive="active" (click)="isMobileMenuOpen = false" class="nav-link-mobile">
                <span class="material-icons-outlined text-xl">dashboard</span>
                Driver Panel
              </a>
              <a *ngIf="user.role === 'admin'" routerLink="/admin/dashboard" routerLinkActive="active" (click)="isMobileMenuOpen = false" class="nav-link-mobile">
                <span class="material-icons-outlined text-xl">admin_panel_settings</span>
                Admin Panel
              </a>
            </ng-container>
            <a *ngIf="!(auth.currentUser$ | async)" routerLink="/login" (click)="isMobileMenuOpen = false" class="nav-link-mobile">
              <span class="material-icons-outlined text-xl">login</span>
              Staff Login
            </a>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .glass-nav {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--gray-100);
    }
    .nav-link-premium {
      color: var(--gray-500);
      text-decoration: none;
      font-size: 0.9375rem;
      font-weight: 600;
      padding: 0.5rem 0;
      position: relative;
      transition: color 0.3s;
    }
    .nav-link-premium:hover {
      color: var(--gray-900);
    }
    .nav-link-premium::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background-color: var(--primary);
      transition: width 0.3s;
    }
    .nav-link-premium:hover::after, .nav-link-premium.active::after {
      width: 100%;
    }
    .nav-link-premium.active {
      color: var(--gray-900);
    }
    .nav-link-mobile {
      display: flex;
      items-center: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      color: var(--gray-600);
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s;
    }
    .nav-link-mobile:hover, .nav-link-mobile.active {
      background-color: var(--primary-light);
      color: var(--primary);
    }
    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .no-underline { text-decoration: none; }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
  router = inject(Router);
  isMobileMenuOpen = false;

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
