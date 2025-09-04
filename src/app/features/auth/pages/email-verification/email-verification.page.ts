import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.page.html',
  styleUrls: ['./email-verification.page.css'],
})
export class EmailVerificationPage {
  private readonly router = inject(Router);
  // private readonly emailVerificationService = inject();
  public email = 'usuario@ejemplo.com';

  resendVerificationEmail() {
    // Lógica para reenviar el correo de verificación
    console.log('Reenviando correo de verificación...');
  }

  goToLogin() {
    // Lógica para redirigir al usuario a la página de inicio de sesión
    console.log('Redirigiendo a la página de inicio de sesión...');
  }
}
