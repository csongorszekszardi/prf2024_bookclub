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
  loggedIn: boolean = false;
  isAdmin: boolean = false;

  constructor(private http: HttpClient) {}

  books:any = [];

  refreshBooks() {
    this.http.get(this.APIUrl+'GetBooks').subscribe(data => {
      this.books = data;
    });
  }

  checkSession() {
    this.http.get(this.APIUrl + 'checkSession', { withCredentials: true }).subscribe({
      next: (data: any) => {
        this.loggedIn = data.loggedIn;
      }
    });
  }

  ngOnInit() {
    this.refreshBooks();
    //this.checkSession();
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

  saveBook(book:any) {
    this.http.put(this.APIUrl+'EditBook', book).subscribe(data => {
      alert(data);
      this.refreshBooks();
    });
  }

  editBook(book:any) {
    book.editing = true;
  }

  cancelEdit(book:any) {
    book.editing = false;
    this.refreshBooks();
  }

  registerUser() {
    var newUser = {
      username: (<HTMLInputElement>document.getElementById('reg-username')).value,
      password: (<HTMLInputElement>document.getElementById('reg-password')).value
    };

    this.http.post(this.APIUrl+'Register', newUser).subscribe(data => {
      alert(data);
    });
  }

  loginUser() {
    const loginUser = {
      username: (<HTMLInputElement>document.getElementById('login-username')).value,
      password: (<HTMLInputElement>document.getElementById('login-password')).value
    };

    this.http.post(this.APIUrl + 'Login', loginUser, { withCredentials: true }).subscribe({
      next: (data: any) => {
        alert('Login successful');
        this.loggedIn = true;
        this.isAdmin = data.isAdmin;
        this.refreshBooks();
      }, error: () => {
        this.loggedIn = false;
        alert('Login failed');
      }
    });
  }

  logoutUser() {
    this.http.post(this.APIUrl + 'Logout', {}, { withCredentials: true }).subscribe({
      next: (data: any) => {
        alert(data);
        this.loggedIn = false;
        this.isAdmin = false;
      }
    });
  }

}