import { Component, OnInit } from '@angular/core';
import { CartService } from '../utils/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  cart: any;
  message: any;

  constructor(private cartService: CartService) {
    this.cart = null;
  }

  payForBooks() {
    this.cartService.letsPay().subscribe(msg => {
      console.log(msg);
      this.cart = null;
    }, error => {
      console.log(error);
    })
  }

  ngOnInit(): void {
    this.cartService.getCart().subscribe(data => {
      this.cart = data;
      console.log(this.cart);
    }, error => {
      console.log(error);
    })
  }
}
