import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { map } from 'rxjs/operators'
import * as io from 'socket.io-client';
interface Result {
  _id: String,
  offset: String,
  complete: Boolean,
  message: String,
}

export interface Response<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})


export class AppComponent {
  results: Array<Result> = [];
  constructor(private http: HttpClient) {
    http.get<Array<Result>>(`${environment.baseURL}/result`).subscribe(res => { this.results = res;});
  }

  addPost(result: Result) {
    this.http.post<Response<Result>>(`${environment.baseURL}/judge`, result).subscribe(res=> this.results.push(res.data));
  }
}
