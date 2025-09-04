import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Routes } from '../../../../core/constants/routes.constant';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { LoginBody } from '../../interfaces/auth.interface';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.css'],
  imports: [CommonModule, LoginFormComponent],
})
export class LoginPage {
  private readonly authService = inject(AuthenticationService);
  private readonly router = inject(Router);

  public onLoginSubmit(loginData: LoginBody): void {
    this.authService.login(loginData).subscribe({
      next: (response) => {
        // Manejar la respuesta exitosa
        console.log('Login successful:', response);
        this.authService.setToken(response.data.accessToken);
        this.router.navigate([Routes.HOME]);
      },
      error: (error) => {
        // Manejar el error
        console.error('Error during login:', error);
      },
      complete: () => {
        // Acción al completar la solicitud
        console.log('Login request completed');
      },
    });
  }
}
