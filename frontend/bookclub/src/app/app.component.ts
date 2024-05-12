import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'bookclub';
  readonly APIUrl = 'http://localhost:5002/api/bookclub/';

  constructor(private http: HttpClient) {}

  books:any = [];

  refreshBooks() {
    this.http.get(this.APIUrl+'GetBooks').subscribe(data => {
      this.books = data;
    });
  }

  ngOnInit() {
    this.refreshBooks();
  }

  addBook() {
    var newBook = {
      title: (<HTMLInputElement>document.getElementById('title')).value,
      author: (<HTMLInputElement>document.getElementById('author')).value,
      year: (<HTMLInputElement>document.getElementById('year')).value,
      genre: (<HTMLInputElement>document.getElementById('genre')).value,
      publisher: (<HTMLInputElement>document.getElementById('publisher')).value,
    }
    this.http.post(this.APIUrl+'AddBook', newBook).subscribe(data => {
      alert(data);
      this.refreshBooks();
    });
  }

  deleteBook(id:any) {
    this.http.delete(this.APIUrl+'DeleteBook?id='+id).subscribe(data => {
      alert(data);
      this.refreshBooks();
    });
  }
}