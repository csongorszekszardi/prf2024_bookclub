import { Component, OnInit } from '@angular/core';
import { BookService } from '../utils/book.service';
import { CartService } from '../utils/cart.service';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {

  constructor(private bookService: BookService, private cartService: CartService) { }

  books: any;

  addBookToCart(ISBN: string) {
    this.cartService.addBookToCart(ISBN).subscribe(msg => {
      console.log(msg);
    }, error => {
      console.log(error);
    });
  }

  ngOnInit(): void {
    this.bookService.getBooks().subscribe(data => {
      console.log(data);
      this.books = data;
    }, error => {
      console.log(error);
    })
  }
}
