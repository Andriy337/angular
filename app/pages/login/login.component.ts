import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../register/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  userType: 'person' | 'company' = 'person';
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.loginForm = this.fb.group({
      userType: ['person'],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      companyEmail: [''],
    });

    this.loginForm.get('userType')?.valueChanges.subscribe(value => {
      this.userType = value;
      this.updateValidators();
    });

    this.updateValidators();
  }

  updateValidators(): void {
    if (this.userType === 'person') {
      this.loginForm.get('email')?.setValidators([Validators.required, Validators.email]);
      this.loginForm.get('companyEmail')?.clearValidators();
    } else {
      this.loginForm.get('companyEmail')?.setValidators([Validators.required, Validators.email]);
      this.loginForm.get('email')?.clearValidators();
    }

    this.loginForm.get('email')?.updateValueAndValidity();
    this.loginForm.get('companyEmail')?.updateValueAndValidity();
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      console.log('Форма невалідна:', this.loginForm.errors);
      return;
    }

    const { email, companyEmail, password } = this.loginForm.value;

    if (this.userType === 'person') {
      const user = await this.authService.loginUser(email, password);
      if (user) {
        this.router.navigate(['/']);
      } else {
        this.errorMessage = 'Невірний email або пароль';
      }
    } else {
      const partner = await this.authService.loginPartner(companyEmail, password);
      if (partner) {
        this.router.navigate(['/']);
      } else {
        this.errorMessage = 'Невірний email компанії або пароль';
      }
    }
  }

  get email() { return this.loginForm.get('email'); }
  get companyEmail() { return this.loginForm.get('companyEmail'); }
  get password() { return this.loginForm.get('password'); }
}