import { Component, computed, inject, output } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterBody } from '../../interfaces/auth.interface';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css'],
  imports: [ReactiveFormsModule, FormsModule],
})
export class RegisterFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  public registerSubmit = output<RegisterBody>();

  public registerForm = this.fb.group({
    fullname: ['', [Validators.required, Validators.minLength(4)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    terms: [false, Validators.requiredTrue],
  });

  public fullname = computed(() => this.registerForm.get('fullname'));
  public email = computed(() => this.registerForm.get('email'));
  public password = computed(() => this.registerForm.get('password'));
  public confirmPassword = computed(() => this.registerForm.get('confirmPassword'));
  public terms = computed(() => this.registerForm.get('terms'));

  public fullnameError = computed(() => {
    const fullname = this.fullname();
    if (fullname?.hasError('required') && fullname?.touched) {
      return 'El nombre completo es requerido';
    }
    if (fullname?.hasError('minlength') && fullname?.touched) {
      return 'El nombre completo debe tener al menos 4 caracteres';
    }
    return '';
  });

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

  public confirmPasswordError = computed(() => {
    const confirmPassword = this.confirmPassword();
    if (confirmPassword?.hasError('required') && confirmPassword?.touched) {
      return 'La confirmación de contraseña es requerida';
    }
    if (confirmPassword?.value !== this.password()?.value && confirmPassword?.touched) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  });

  public termsError = computed(() => {
    const terms = this.terms();
    if (terms?.hasError('requiredTrue') && terms?.touched) {
      return 'Debe aceptar los términos y condiciones';
    }
    return '';
  });

  public onSubmit(): void {
    if (!this.registerForm.valid) {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.registerForm.controls).forEach((key) => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  public goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
