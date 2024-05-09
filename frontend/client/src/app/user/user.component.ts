import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../utils/user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  username: string
  password: string

  constructor(private userService: UserService, public router: Router) {
    this.username = '';
    this.password = '';
  }

  register() {
    this.userService.register(this.username, this.password).subscribe(msg => {
      console.log(msg);
      this.router.navigate(['/login']);
    }, error => {
      console.log(error);
    });
  }

  modifyUser() {
    this.userService.modifyUser(this.password).subscribe(msg => {
      console.log(msg);
      this.router.navigate(['/getBooks']);
    }, error => {
      console.log(error);
    })
  }

  ngOnInit(): void {
  }

}
