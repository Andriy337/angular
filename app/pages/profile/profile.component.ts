import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User, Partner, Insurance } from '../register/auth.service';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentUser: User | Partner | null = null;
  insurances: Insurance[] = [];
  private userSubscription: Subscription;

  constructor(private authService: AuthService) {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.insurances = user?.insurances || [];
    });
  }

  async ngOnInit(): Promise<void> {
    await this.authService.checkAuthStatus();
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  // Допоміжні методи для перевірки типу
  isUser(user: User | Partner | null): user is User {
    return user !== null && 'username' in user;
  }

  isPartner(user: User | Partner | null): user is Partner {
    return user !== null && 'companyName' in user;
  }
}