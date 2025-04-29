import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../register/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  users: any[] = [];
  partners: any[] = [];
  userType: 'person' | 'company' = 'person';
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.registerForm = this.fb.group({
      userType: ['person'],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      companyName: [''],
      contactPerson: [''],
      companyEmail: [''],
      phone: ['']
    }, { validators: this.passwordMatchValidator });

    this.loadUsersAndPartners();

    this.registerForm.get('userType')?.valueChanges.subscribe(value => {
      this.userType = value;
      this.updateValidators();
    });

    this.updateValidators();
  }

  async loadUsersAndPartners(): Promise<void> {
    this.users = await this.authService.getAllUsers();
    this.partners = await this.authService.getAllPartners();
  }

  updateValidators(): void {
    if (this.userType === 'person') {
      this.registerForm.get('username')?.setValidators([Validators.required, Validators.minLength(3)]);
      this.registerForm.get('email')?.setValidators([Validators.required, Validators.email]);
      this.registerForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.registerForm.get('confirmPassword')?.setValidators([Validators.required]);
      this.registerForm.get('companyName')?.clearValidators();
      this.registerForm.get('contactPerson')?.clearValidators();
      this.registerForm.get('companyEmail')?.clearValidators();
      this.registerForm.get('phone')?.clearValidators();
    } else {
      this.registerForm.get('companyName')?.setValidators([Validators.required, Validators.minLength(3)]);
      this.registerForm.get('contactPerson')?.setValidators([Validators.required]);
      this.registerForm.get('companyEmail')?.setValidators([Validators.required, Validators.email]);
      this.registerForm.get('phone')?.setValidators([Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]);
      this.registerForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.registerForm.get('confirmPassword')?.setValidators([Validators.required]);
      this.registerForm.get('username')?.clearValidators();
      this.registerForm.get('email')?.clearValidators();
    }

    this.registerForm.get('username')?.updateValueAndValidity();
    this.registerForm.get('email')?.updateValueAndValidity();
    this.registerForm.get('companyName')?.updateValueAndValidity();
    this.registerForm.get('contactPerson')?.updateValueAndValidity();
    this.registerForm.get('companyEmail')?.updateValueAndValidity();
    this.registerForm.get('phone')?.updateValueAndValidity();
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  async onSubmit() {
    console.log('onSubmit triggered');
    console.log('Form status:', this.registerForm.status);
    console.log('Form value:', this.registerForm.value);
    console.log('Form errors:', this.registerForm.errors);

    if (this.registerForm.invalid) {
      console.log('Форма невалідна:', this.registerForm.errors);
      this.errorMessage = 'Будь ласка, заповніть усі обов’язкові поля коректно.';
      return;
    }

    this.errorMessage = null;

    const formValue = this.registerForm.value;

    try {
      if (this.userType === 'person') {
        const user = {
          username: formValue.username,
          email: formValue.email,
          password: formValue.password
        };
        console.log('Registering user:', user);
        await this.authService.registerUser(user);
        console.log('User registered, logging in...');
        const loginResult = await this.authService.loginUser(formValue.email, formValue.password);
        if (!loginResult) {
          this.errorMessage = 'Не вдалося увійти після реєстрації. Спробуйте увійти вручну.';
          return;
        }
      } else {
        const partner = {
          companyName: formValue.companyName,
          contactPerson: formValue.contactPerson,
          companyEmail: formValue.companyEmail,
          phone: formValue.phone,
          password: formValue.password
        };
        console.log('Registering partner:', partner);
        await this.authService.registerPartner(partner);
        console.log('Partner registered, logging in...');
        const loginResult = await this.authService.loginPartner(formValue.companyEmail, formValue.password);
        if (!loginResult) {
          this.errorMessage = 'Не вдалося увійти після реєстрації. Спробуйте увійти вручну.';
          return;
        }
      }

      await this.loadUsersAndPartners();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error during registration:', error);
      this.errorMessage = 'Виникла помилка під час реєстрації. Спробуйте ще раз.';
    }
  }

  get username() { return this.registerForm.get('username'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get companyName() { return this.registerForm.get('companyName'); }
  get contactPerson() { return this.registerForm.get('contactPerson'); }
  get companyEmail() { return this.registerForm.get('companyEmail'); }
  get phone() { return this.registerForm.get('phone'); }
}