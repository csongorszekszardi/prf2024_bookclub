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

  bookOfMonth: any = null;
  
  clubs:any = [];

  memberships: any = [];

  ngOnInit() {
    this.refreshBooks();
    this.checkSession();
    this.getBookOfMonth();
    this.refreshBookClubs();
  }

  refreshBooks() {
    this.http.get<any[]>(this.APIUrl+'GetBooks', { withCredentials: true }).subscribe({
      next: (data: any[]) => {
        this.books = data;
      },
      error: (error: any) => {
        if (error.status === 401) {
          alert('Unauthorized. Please log in.');
        }
      }
    });
  }

  getBookOfMonth() {
    this.http.get(this.APIUrl + 'GetBookOfMonth', { withCredentials: true }).subscribe({
      next: (data: any) => {
        this.bookOfMonth = data;
      },
      error: (error: any) => {
        if (error.status === 404) {
          this.bookOfMonth = null;
        }
      }
    });
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

  deleteBook(id:string) {
    this.http.delete(this.APIUrl+'DeleteBook?id=' + id, { withCredentials: true }).subscribe({
      next: (data: any) => {
        alert(data);
        this.refreshBooks();
      },
      error: (error: any) => {
        alert('Failed to delete book');
      }
    });
  }

  saveBook(book:any) {
    this.http.put(this.APIUrl+'EditBook', book).subscribe({
      next: (data: any) => {
        alert(data);
        this.refreshBooks();
      },
      error: (error: any) => {
        alert('Failed to delete book');
      }
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

    this.http.post(this.APIUrl+'Register', newUser).subscribe({
      next: (data: any) => {
        alert(data);
      },
      error: (error: any) => {
        if (error.status === 400 || error.status === 500) {
          alert(error.error.message);
        } else {
          alert('Failed to register user');
        }
      }
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
      },
      error: (error: any) => {
        this.loggedIn = false;
        if (error.status === 400 || error.status === 500) {
          alert(error.error.message);
        } else {
          alert('Login failed');
        }
      }
    });
  }

  checkSession() {
    this.http.get(this.APIUrl + 'CheckSession', { withCredentials: true }).subscribe({
      next: (data: any) => {
        this.loggedIn = true;
        this.isAdmin = data.isAdmin;
      },
      error: (error: any) => {
        this.loggedIn = false;
        this.isAdmin = false;
        if (error.status === 400 || error.status === 500) {
          alert(error.error.message);
        }
      }
    });
  }

  logoutUser() {
    this.http.post(this.APIUrl + 'Logout', {}, { withCredentials: true }).subscribe({
      next: (data: any) => {
        alert(data);
        this.loggedIn = false;
        this.isAdmin = false;
      },
      error: (error: any) => {
        if (error.status === 400 || error.status === 500) {
          alert(error.error.message);
        }
      }
    });
  }

  setBookOfMonth(bookId:string) {
    this.http.post(this.APIUrl + 'SetBookOfMonth', { bookId }, { withCredentials: true }).subscribe({
      next: (data: any) => {
        alert(data);
        this.getBookOfMonth();
        this.refreshBooks();
      },
      error: (error: any) => {
        if (error.status === 400 || error.status === 500) {
          alert(error.error.message);
        } else {
          alert('Failed to set book of the month');
        }
      }
    });
  }

  refreshBookClubs() {
    this.http.get<any[]>(this.APIUrl + 'GetBookClubs', { withCredentials: true }).subscribe({
      next: (data: any[]) => {
        this.clubs = data;
      },
      error: (error: any) => {
        if (error.status === 400 || error.status === 500) {
          alert(error.error.message);
        } else {
          alert('Failed to fetch book clubs');
        }
      }
    });
  }

  addBookClub() {
    const name = (<HTMLInputElement>document.getElementById('clubName')).value;

    this.http.post(this.APIUrl + 'CreateBookClub', { name }, { withCredentials: true }).subscribe({
      next: (data: any) => {
        alert(data);
        this.refreshBookClubs();
      },
      error: (error: any) => {
        if (error.status === 400 || error.status === 500) {
          alert(error.error.message);
        } else {
          alert('Failed to create book club');
        }
      }
    });
  }

  editBookClub(id:string) {
    const name = prompt("Enter new name for the book club:");

    if (name) {
      this.http.put(this.APIUrl + 'EditBookClub', { clubId: id, clubName: name }, { withCredentials: true }).subscribe({
        next: (data: any) => {
          alert(data);
          this.refreshBookClubs();
        },
        error: (error: any) => {
          if (error.status === 400 || error.status === 500) {
            alert(error.error.message);
          } else {
            alert('Failed to update book club');
          }
        }
      });
    }
  }

  deleteBookClub(id:string) {
    this.http.delete(this.APIUrl + 'DeleteBookClub?id=' + id, { withCredentials: true }).subscribe({
      next: (data: any) => {
        alert(data);
        this.refreshBookClubs();
      },
      error: (error: any) => {
        if (error.status === 400 || error.status === 500) {
          alert(error.error.message);
        } else {
          alert('Failed to delete book club');
        }
      }
    });
  }

  joinBookClub(clubId: string) {
    this.http.post(this.APIUrl + 'JoinBookClub', { clubId }, { withCredentials: true }).subscribe({
      next: (data: any) => {
        alert(data);
        this.refreshMemberships();
        this.refreshBookClubs();
      },
      error: (error: any) => {
        if (error.status === 400 || error.status === 500) {
          alert(error.error.message);
        } else {
          alert('Failed to join club');
        }
      }
    });
  }

  leaveBookClub(clubId: string) {
    this.http.post(this.APIUrl + 'LeaveBookClub', { clubId }, { withCredentials: true }).subscribe({
      next: (data: any) => {
        alert(data);
        this.refreshMemberships();
        this.refreshBookClubs();
      },
      error: (error: any) => {
        if (error.status === 400 || error.status === 500) {
          alert(error.error.message);
        } else {
          alert('Failed to leave club');
        }
      }
    });
  }

  refreshMemberships() {
    this.http.get<any[]>(this.APIUrl + 'GetUserMemberships', { withCredentials: true }).subscribe({
      next: (data: any[]) => {
        this.memberships = data;
        this.checkMemberships();
      },
      error: (error: any) => {
        if (error.status === 400 || error.status === 500) {
          alert(error.error.message);
        } else {
          alert('Failed to fetch memberships');
        }
      }
    });
  }

  checkMemberships() {
    this.clubs.forEach((club: any) => {
      club.isMember = this.memberships.some((membership: any) => membership.clubId === club.id);
    });
  }
}