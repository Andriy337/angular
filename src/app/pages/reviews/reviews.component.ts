import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReviewsService, Review } from './reviews.service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {
  reviewForm: FormGroup;
  reviews: Review[] = [];
  hoverRating: number = 0;

  constructor(
    private fb: FormBuilder,
    private reviewsService: ReviewsService
  ) {
    this.reviewForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2)]],
      rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.loadReviews();
  }

  private loadReviews(): void {
    this.reviewsService.getReviews().subscribe((reviews) => {
      this.reviews = reviews;
      console.log('Відгуки завантажені в ReviewsComponent:', this.reviews);
    });
  }

  onSubmit(): void {
    if (this.reviewForm.valid) {
      const newReview: Review = {
        author: this.reviewForm.value.author,
        rating: this.reviewForm.value.rating,
        comment: this.reviewForm.value.comment,
        date: new Date()
      };
      this.reviewsService.addReview(newReview).subscribe(() => {
        this.loadReviews(); // Оновлюємо список відгуків після додавання
        this.reviewForm.reset();
      });
    }
  }

  deleteReview(id: number | undefined): void {
    if (id !== undefined) {
      this.reviewsService.deleteReview(id).subscribe(() => {
        this.loadReviews(); // Оновлюємо список відгуків після видалення
      });
    }
  }

  setHoverRating(rating: number): void {
    this.hoverRating = rating;
  }

  setRating(rating: number): void {
    this.reviewForm.get('rating')?.setValue(rating);
    this.hoverRating = rating;
  }
}