import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor(private http: HttpClient) { }

  getCart() {
    return this.http.get(environment.serverUrl + 'cart', {withCredentials: true});
  }

  addBookToCart(ISBN: string) {
    return this.http.post(environment.serverUrl + 'cart', {ISBN: ISBN}, {withCredentials: true});
  }

  letsPay() {
    return this.http.post(environment.serverUrl + 'payment', {}, {withCredentials: true});
  }
}
