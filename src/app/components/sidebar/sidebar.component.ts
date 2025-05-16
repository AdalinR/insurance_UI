import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  template: `
    <div class="sidebar">
      <div class="logo">
        Insurance Builder
      </div>
      <nav class="nav-menu">
        <a 
          routerLink="/home" 
          routerLinkActive="active" 
          class="nav-item"
        >
          <span class="material-icons">home</span>
          Home
        </a>
        <a 
          routerLink="/template" 
          routerLinkActive="active" 
          class="nav-item"
        >
          <span class="material-icons">article</span>
          Product Template
        </a>
      </nav>
      <div class="sidebar-footer">
        <button class="btn-outline" (click)="logout()">
          <span class="material-icons">logout</span>
          Logout
        </button>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      background-color: white;
      border-right: 1px solid var(--neutral-200);
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    
    .logo {
      padding: var(--space-4);
      font-size: 18px;
      font-weight: 600;
      color: var(--primary-700);
      border-bottom: 1px solid var(--neutral-200);
    }
    
    .nav-menu {
      padding: var(--space-4);
      flex: 1;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      padding: var(--space-3) var(--space-4);
      color: var(--neutral-700);
      text-decoration: none;
      border-radius: var(--radius);
      margin-bottom: var(--space-2);
      transition: all 0.2s ease;
    }
    
    .nav-item:hover {
      background-color: var(--neutral-100);
    }
    
    .nav-item.active {
      background-color: var(--primary-50);
      color: var(--primary-700);
    }
    
    .nav-item .material-icons {
      margin-right: var(--space-3);
    }
    
    .sidebar-footer {
      padding: var(--space-4);
      border-top: 1px solid var(--neutral-200);
    }
    
    .sidebar-footer button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .sidebar-footer .material-icons {
      margin-right: var(--space-2);
    }
  `]
})
export class SidebarComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
  }
}