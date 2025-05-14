import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User, Partner } from 'D:/agency/src/app/pages/register/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  currentUser: User | Partner | null = null;
  showDropdown: boolean = false;
  private authSubscription!: Subscription;
  private userSubscription!: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.checkAuthStatus();

    this.authSubscription = this.authService.authStatus$.subscribe(status => {
      this.isLoggedIn = status;
    });

    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    console.log('Dropdown toggled:', this.showDropdown);
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.showDropdown = false;
    this.router.navigate(['/login']);
    console.log('Logout clicked');
  }

  getUserName(): string {
    if (!this.currentUser) return 'Користувач';
    if ('username' in this.currentUser) {
      return this.currentUser.username;
    } else if ('companyName' in this.currentUser) {
      return this.currentUser.companyName;
    }
    return 'Користувач';
  }
}