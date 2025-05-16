import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Insurance Template Builder</h2>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Username</label>
            <input 
              type="text" 
              id="username" 
              [(ngModel)]="username" 
              name="username" 
              required
            >
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              [(ngModel)]="password" 
              name="password" 
              required
            >
          </div>
          <button type="submit" class="btn-primary">Login</button>
        </form>
      </div>
    </div>
  `,
  styles: [`
 .login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to right, #e0eafc, #cfdef3); /* Soft gradient */
}
    .login-card {
      background: white;
      padding: var(--space-6);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 400px;
    }
    
    h2 {
      text-align: center;
      margin-bottom: var(--space-6);
      color: var(--primary-700);
    }
    
    .form-group {
      margin-bottom: var(--space-4);
    }
    
    label {
      display: block;
      margin-bottom: var(--space-2);
      font-weight: 500;
    }
    
    input {
      width: 100%;
      padding: var(--space-3);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius);
      margin-bottom: var(--space-2);
    }
    
    button {
      width: 100%;
      padding: var(--space-3);
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit() {
    console.log(this.username, this.password);
    
    if (this.authService.login(this.username, this.password)) {
      this.router.navigate(['/home']);
    }
  }
}