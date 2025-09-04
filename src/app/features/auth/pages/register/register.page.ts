import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Routes } from '../../../../core/constants/routes.constant';
import { RegisterFormComponent } from '../../components/register-form/register-form.component';
import { RegisterBody } from '../../interfaces/auth.interface';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.css'],
  imports: [RegisterFormComponent],
})
export class RegisterPage {
  private readonly authService = inject(AuthenticationService);
  private readonly router = inject(Router);
  public onRegisterSubmit(registerData: RegisterBody): void {
    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('Register successful:', response);

        // Guardar tokens - el guard se encargará de verificar si el email está verificado
        this.authService.setToken(response.data.accessToken);
        this.authService.setRefreshToken(response.data.refreshToken);

        this.router.navigate([Routes.EMAIL_VERIFICATION]);
      },
      error: (error) => {
        // Manejar el error
        console.error('Error during registration:', error);
      },
    });
  }
}
