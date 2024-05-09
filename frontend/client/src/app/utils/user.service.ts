import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  register(username: string, password: string) {
    return this.http.post(environment.serverUrl + 'user', {username: username, password: password}, {withCredentials: true});
  }

  modifyUser(password: string) {
    return this.http.put(environment.serverUrl + 'user', {password: password}, {withCredentials: true});
  }
}
