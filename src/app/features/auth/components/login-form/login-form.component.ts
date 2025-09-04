import { CommonModule } from '@angular/common';
import { Component, computed, inject, output } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginBody } from '../../interfaces/auth.interface';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css'],
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
})
export class LoginFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  public loginSubmit = output<LoginBody>();

  public loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  public email = computed(() => this.loginForm.get('email'));
  public password = computed(() => this.loginForm.get('password'));

  public emailError = computed(() => {
    const email = this.email();
    if (email?.hasError('required') && email?.touched) {
      return 'El correo electrónico es requerido';
    }

    if (email?.hasError('email') && email?.touched) {
      return 'Ingrese un correo electrónico válido';
    }

    return '';
  });

  public passwordError = computed(() => {
    const password = this.password();
    if (password?.hasError('required') && password?.touched) {
      return 'La contraseña es requerida';
    }
    if (password?.hasError('minlength') && password?.touched) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    return '';
  });

  public onSubmit(): void {
    if (this.loginForm.valid) {
      const formData: LoginBody = {
        email: this.loginForm.value.email ?? '',
        password: this.loginForm.value.password ?? '',
      };

      this.loginSubmit.emit(formData);
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  public goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
