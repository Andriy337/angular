import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { AuthService, Insurance } from '../register/auth.service';

@Component({
  selector: 'app-insurance-result',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './insurance-result.component.html',
  styleUrls: ['./insurance-result.component.scss']
})
export class InsuranceResultComponent implements OnInit {
  selectedCountry: string | null = null;
  startDate: string | null = null;
  endDate: string | null = null;
  numberOfPeople: number = 0;
  insuredPersonsForm: FormGroup;
  days: number | null = null;
  costResult: number | null = null;
  discountApplied: boolean = false;
  errorMessage: string | null = null;
  insuredName: string = 'Невідомий замовник';
  isFormSubmitted: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.insuredPersonsForm = this.fb.group({
      insuredPersons: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadUser();
    this.loadInsuranceParams();
  }

  async loadUser(): Promise<void> {
    try {
      const user = await this.authService.getCurrentUser();
      if (user) {
        if ('username' in user) {
          this.insuredName = user.username;
        } else if ('companyName' in user) {
          this.insuredName = user.companyName;
          this.discountApplied = true;
        }
      }
    } catch (error) {
      console.error('Помилка при завантаженні замовника:', error);
      this.insuredName = 'Невідомий замовник';
    }
  }

  loadInsuranceParams(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedCountry = params['selectedCountry'] || null;
      this.startDate = params['startDate'] || null;
      this.endDate = params['endDate'] || null;
      this.numberOfPeople = params['numberOfPeople'] ? +params['numberOfPeople'] : 0;

      if (this.startDate && this.endDate) {
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        this.days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      this.updateInsuredPersons(this.numberOfPeople);
    });
  }

  get insuredPersons(): FormArray {
    return this.insuredPersonsForm.get('insuredPersons') as FormArray;
  }

  updateInsuredPersons(count: number): void {
    const insuredPersons = this.insuredPersons;
    insuredPersons.clear();

    for (let i = 0; i < count; i++) {
      insuredPersons.push(this.fb.group({
        lastName: ['', Validators.required],
        firstName: ['', Validators.required],
        middleName: ['', Validators.required],
        birthDate: ['', Validators.required]
      }));
    }
  }

  calculateCost(): void {
    if (!this.selectedCountry || !this.startDate || !this.endDate || this.numberOfPeople <= 0) {
      this.errorMessage = 'Будь ласка, заповніть усі поля форми на головній сторінці.';
      return;
    }

    const baseCostPerDay = 5;
    const costPerPerson = this.days! * baseCostPerDay;
    let totalCost = costPerPerson * this.numberOfPeople;

    if (this.discountApplied) {
      totalCost = totalCost * 0.75;
    }

    this.costResult = Math.round(totalCost * 100) / 100;
  }

  onSubmitInsuredPersons(): void {
    if (this.insuredPersonsForm.invalid) {
      this.errorMessage = 'Будь ласка, заповніть дані всіх застрахованих осіб.';
      return;
    }

    this.errorMessage = null;
    this.isFormSubmitted = true;
    this.calculateCost();
  }

  editInsuredPersons(): void {
    this.isFormSubmitted = false;
    this.errorMessage = null;
  }

  async proceedToCheckout(): Promise<void> {
    // Генеруємо текстовий документ (імітація PDF)
    const documentContent = `
      СТРАХОВИЙ ПОЛІС №12345
      ---------------------------------
      Замовник страхування: ${this.insuredName}
      Країна: ${this.selectedCountry}
      Період страхування: ${this.startDate} - ${this.endDate} (${this.days} дні)
      Кількість застрахованих осіб: ${this.numberOfPeople}
      
      Застраховані особи:
      ${this.insuredPersons.value.map((person: any, index: number) => 
        `${index + 1}. ${person.lastName} ${person.firstName} ${person.middleName} (Дата народження: ${person.birthDate})`
      ).join('\n')}
      
      Політика страхування:
      - Медичні витрати: до 100 000 USD/EUR
      - Лікування COVID-19: включено
      - Скасування поїздки: до 5 000 USD
      - Онлайн-консультація лікаря: 24/7
      
    
      Вартість: $${this.costResult}
      Дата оформлення: ${new Date().toISOString().split('T')[0]}
    `;

    const insurance: Insurance = {
      policyNumber: '12345',
      insuredName: this.insuredName,
      country: this.selectedCountry!,
      startDate: this.startDate!,
      endDate: this.endDate!,
      days: this.days!,
      numberOfPeople: this.numberOfPeople,
      insuredPersons: this.insuredPersons.value,
      cost: this.costResult!,
      discountApplied: this.discountApplied,
      document: documentContent.trim()
    };

    // Зберігаємо страхування в профіль
    try {
      await this.authService.saveInsuranceToProfile(insurance);
      console.log('Страхування успішно додано до профілю');
      // Перенаправляємо на сторінку профілю
      await this.router.navigate(['/profile']);
    } catch (error) {
      this.errorMessage = 'Виникла помилка при збереженні страхування. Спробуйте ще раз.';
      // Перенаправляємо на головну сторінку у разі помилки
      await this.router.navigate(['/']);
    }
  }
}