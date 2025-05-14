import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { BehaviorSubject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
  insurances?: Insurance[];
}

export interface Partner {
  id?: number;
  companyName: string;
  contactPerson: string;
  companyEmail: string;
  phone: string;
  password: string;
  insurances?: Insurance[];
}

export interface Insurance {
  policyNumber: string;
  insuredName: string;
  country: string;
  startDate: string;
  endDate: string;
  days: number;
  numberOfPeople: number;
  insuredPersons: { lastName: string, firstName: string, middleName: string, birthDate: string }[];
  cost: number;
  discountApplied: boolean;
  document: string;
}

export interface AuthToken {
  token: string;
  userId: number;
  userType: 'user' | 'partner';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService extends Dexie {
  users!: Table<User>;
  partners!: Table<Partner>;
  authTokens!: Table<AuthToken>;
  private authStatus = new BehaviorSubject<boolean>(false);
  authStatus$ = this.authStatus.asObservable();
  private currentUserSubject = new BehaviorSubject<User | Partner | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    super('insuranceAppDB_v2');

    this.version(7).stores({
      users: '++id, email, username, password, [email+password]',
      partners: '++id, companyEmail, companyName, contactPerson, phone, password, [companyEmail+password]',
      authTokens: 'token, userId, userType'
    });
  }

  async checkAuthStatus(): Promise<void> {
    const tokenRecord = await this.authTokens.toArray();
    const authToken = tokenRecord[0];
    let user: User | Partner | null = null;

    if (authToken?.userId && authToken?.userType) {
      if (authToken.userType === 'user') {
        user = await this.users.get(authToken.userId) ?? null;
      } else if (authToken.userType === 'partner') {
        user = await this.partners.get(authToken.userId) ?? null;
      }
    }

    const isLoggedIn = !!user;
    this.authStatus.next(isLoggedIn);
    this.currentUserSubject.next(user);
    console.log('Auth status checked:', { isLoggedIn, user, authToken });
  }

  async registerUser(user: User): Promise<void> {
    const id = await this.users.add(user);
    console.log('Користувач зареєстрований в базі:', { ...user, id });
  }

  async registerPartner(partner: Partner): Promise<void> {
    const id = await this.partners.add(partner);
    console.log('Партнер зареєстрований в базі:', { ...partner, id });
  }

  async loginUser(email: string, password: string): Promise<User | null> {
    console.log('Login user called with:', { email, password });
    const user = await this.users.where({ email, password }).first();
    if (user) {
      const token = uuidv4();
      await this.authTokens.clear();
      await this.authTokens.add({ token, userId: user.id!, userType: 'user' });
      this.authStatus.next(true);
      this.currentUserSubject.next(user);
      console.log('Користувач увійшов:', user);
      return user;
    }
    console.log('Користувач не знайдений:', { email, password });
    return null;
  }

  async loginPartner(companyEmail: string, password: string): Promise<Partner | null> {
    console.log('Login partner called with:', { companyEmail, password });
    const partner = await this.partners.where({ companyEmail, password }).first();
    if (partner) {
      const token = uuidv4();
      await this.authTokens.clear();
      await this.authTokens.add({ token, userId: partner.id!, userType: 'partner' });
      this.authStatus.next(true);
      this.currentUserSubject.next(partner);
      console.log('Партнер увійшов:', partner);
      return partner;
    }
    console.log('Партнер не знайдений:', { companyEmail, password });
    return null;
  }

  async logout(): Promise<void> {
    await this.authTokens.clear();
    this.authStatus.next(false);
    this.currentUserSubject.next(null);
    console.log('Користувач або партнер вийшов');
  }

  async getCurrentUser(): Promise<User | Partner | null> {
    const tokenRecord = await this.authTokens.toArray();
    const authToken = tokenRecord[0];
    let user: User | Partner | null = null;

    if (authToken?.userId && authToken?.userType) {
      if (authToken.userType === 'user') {
        user = await this.users.get(authToken.userId) ?? null;
      } else if (authToken.userType === 'partner') {
        user = await this.partners.get(authToken.userId) ?? null;
      }
    }

    console.log('Поточний користувач:', user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.users.toArray();
    console.log('Усі користувачі:', users);
    return users;
  }

  async getAllPartners(): Promise<Partner[]> {
    const partners = await this.partners.toArray();
    console.log('Усі партнери:', partners);
    return partners;
  }

  async saveInsuranceToProfile(insurance: Insurance): Promise<void> {
    const tokenRecord = await this.authTokens.toArray();
    const authToken = tokenRecord[0];

    console.log('authToken in saveInsuranceToProfile:', authToken);

    if (!authToken?.userId || !authToken?.userType) {
      throw new Error('Користувач не авторизований');
    }

    if (authToken.userType === 'user') {
      const user = await this.users.get(authToken.userId);
      console.log('User before saving insurance:', user);
      if (user) {
        if (!user.insurances) {
          user.insurances = [];
        }
        user.insurances.push(insurance);
        await this.users.update(authToken.userId, { insurances: user.insurances });
        this.currentUserSubject.next(user);
        console.log('Страхування додано до профілю користувача:', user);
      } else {
        throw new Error('Користувач не знайдений');
      }
    } else if (authToken.userType === 'partner') {
      const partner = await this.partners.get(authToken.userId);
      console.log('Partner before saving insurance:', partner);
      if (partner) {
        if (!partner.insurances) {
          partner.insurances = [];
        }
        partner.insurances.push(insurance);
        await this.partners.update(authToken.userId, { insurances: partner.insurances });
        this.currentUserSubject.next(partner);
        console.log('Страхування додано до профілю партнера:', partner);
      } else {
        throw new Error('Партнер не знайдений');
      }
    }
  }
}