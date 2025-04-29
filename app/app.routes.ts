import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ReviewsComponent } from './pages/reviews/reviews.component';
import { PartnersComponent } from './pages/partners/partners.component';
import { InsuranceResultComponent } from './pages/insurance-result/insurance-result.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
    {component: HomeComponent, path:"home"},
    {component: ReviewsComponent, path:"reviews", canActivate: [AuthGuard]},
    {component: PartnersComponent, path:"partners"},
    {component: InsuranceResultComponent, path:"insurance-result", canActivate: [AuthGuard]},
    {component: RegisterComponent, path:"register" },
    {component: LoginComponent, path: 'login'},
    {component: ProfileComponent, path: 'profile', canActivate: [AuthGuard]},
        { path: '**', component: HomeComponent}
];
