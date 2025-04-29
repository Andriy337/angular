import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ReviewsService, Review } from '../reviews/reviews.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  reviews: Review[] = [];
  currentIndex: number = 0;
  private autoSlideInterval: any;
  cardsPerView: number = 3;
  totalGroups: number = 0;

  insuranceForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private reviewsService: ReviewsService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.insuranceForm = this.fb.group({
      selectedCountry: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      numberOfPeople: [0, [Validators.required, Validators.min(1), Validators.max(10)]]
    });
  }

  ngOnInit(): void {
    this.loadReviews();
  }

  private loadReviews(): void {
    this.reviewsService.getReviews().subscribe((reviews) => {
      this.reviews = reviews;
      this.totalGroups = Math.ceil(this.reviews.length / this.cardsPerView);
      document.documentElement.style.setProperty('--total-cards', this.reviews.length.toString());
      this.startAutoSlide();
    });
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  setCurrentIndex(index: number): void {
    this.currentIndex = index;
    this.stopAutoSlide();
    this.startAutoSlide();
  }

  startAutoSlide(): void {
    if (this.totalGroups > 1) {
      this.autoSlideInterval = setInterval(() => {
        this.currentIndex = (this.currentIndex + 1) % this.totalGroups;
      }, 3000);
    }
  }

  stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  getTransformStyle(): string {
    const offset = -this.currentIndex * 1080;
    return `translateX(${offset}px)`;
  }

  getDotsArray(): number[] {
    return Array(this.totalGroups).fill(0).map((_, i) => i);
  }

  onSubmit(): void {
    console.log('Дані форми перед перевіркою:', this.insuranceForm.value);

    if (this.insuranceForm.invalid) {
      console.log('Помилка: Усі поля мають бути заповнені!');
      this.errorMessage = 'Будь ласка, заповніть усі поля форми.';
      return;
    }

    this.errorMessage = null;

    const formValue = this.insuranceForm.value;
    const queryParams = {
      selectedCountry: formValue.selectedCountry,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      numberOfPeople: formValue.numberOfPeople.toString()
    };

    console.log('Формуємо URL із queryParams:', queryParams);

    this.router.navigate(['/insurance-result'], { queryParams })
      .then(success => {
        if (success) {
          console.log('Перенаправлення успішне!');
          console.log('Поточний URL після перенаправлення:', this.router.url);
        } else {
          console.log('Перенаправлення не вдалося!');
        }
      })
      .catch(error => {
        console.error('Помилка при перенаправленні:', error);
      });
  }
}