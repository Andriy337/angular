import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Observable, from } from 'rxjs';

export interface Review {
  id?: number;
  author: string;
  rating: number;
  comment: string;
  date: Date | string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewsService extends Dexie {
  reviews!: Table<Review>;

  constructor() {
    super('InsuranceReviewsDB');
    this.version(1).stores({
      reviews: '++id,author,rating,comment,date'
    });

    this.seedInitialReviews();
  }

  private async seedInitialReviews(): Promise<void> {
    const count = await this.reviews.count();
    if (count === 0) {
      console.log('База даних порожня, заповнюю початковими відгуками...');
      const initialReviews: Review[] = [
        { author: 'Андрій', rating: 4, comment: 'Супер компанія, задоволений', date: '2025-04-19T07:33:00' },
        { author: 'Олена', rating: 5, comment: 'Дуже задоволена сервісом! Рекомендую всім.', date: '2025-03-15T14:20:00' },
        { author: 'Максим', rating: 5, comment: 'Все швидко і надійно, дякую!', date: '2025-02-10T09:45:00' },
        { author: 'Софія', rating: 4, comment: 'Хороший сервіс, але хотілося б швидше оформлення.', date: '2025-01-25T16:10:00' },
        { author: 'Ігор', rating: 5, comment: 'Найкраща страхова компанія! Все на вищому рівні.', date: '2024-12-30T11:55:00' }
      ];
      await this.reviews.bulkAdd(initialReviews);
      console.log('Початкові відгуки додано до бази даних.');
    }
  }

  getReviews(): Observable<Review[]> {
    return from(this.reviews.toArray());
  }

  addReview(review: Review): Observable<number> {
    return from(this.reviews.add(review));
  }

  deleteReview(id: number): Observable<void> {
    return from(this.reviews.delete(id));
  }
}