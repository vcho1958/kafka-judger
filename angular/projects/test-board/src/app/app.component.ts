import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { io, Socket } from "socket.io-client";

interface Result {
  _id: String,
  complete: Boolean,
  message: String,
  host: String
}
interface semiObject {
  [key: string]: any
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
  socket: Socket;
  indexArray: semiObject = {};
  changeDetected: Boolean = false;
  constructor(private http: HttpClient) {
    this.socket = io("http://localhost:3000", {
  withCredentials: true,
});
    http.get<Array<Result>>(`${environment.baseURL}/result`).subscribe(res => {
    this.results = res;
      this.results.forEach((v, i) => {
        let index = `${v._id}`
        this.indexArray[index] = i;
    })
    this.socket.on('judge-started', (_id) => {
      this.changeDetected = true; //
      this.results[this.indexArray[_id]].message = '채점 중'
      console.log(this.results, this.indexArray[_id]);
      this.changeDetected = false;
    })
    this.socket.on('judge-doing', (_id, message, host) => {
      this.changeDetected = true;
      this.results[this.indexArray[_id]].message = message;
      this.results[this.indexArray[_id]].host = host;
      console.log(this.results, this.indexArray[_id]);
      this.changeDetected = false;
    })
    this.socket.on('judge-ended', (_id, message) => {
      this.changeDetected = true;
      console.log(this.results, this.indexArray, this.indexArray[_id]);
      this.results[this.indexArray[_id]].complete = true;
      this.results[this.indexArray[_id]].message = message;
      console.log(this.results, this.indexArray[_id]);
      this.socket.emit('disconnect-request', _id);
      this.changeDetected = false;
    })
    });//객체 내부 값이므로 외부 변수 changDetected로 변화를 주어 뷰 새로고침
    //doCheck()에서 할 수도 있으나 그러면 불필요하게 매번 배열 전체를 순환해야해서 퍼포먼스에 좋지 않을 수 있다고 판단했음
  }
  ngOnInit() {
    this.results.forEach((v,i) => {
      if (!v.complete) {
        this.socket.emit('web-request', v._id)
      }
    })
  }
  ngOnDestroy() {
    this.socket.emit('disconnect');
  }
  addPost() {
    this.http.post<any>(`${environment.baseURL}/judge`,{}).subscribe(res => {
      if (res._id) {
        this.changeDetected = true;
        res.host = undefined;
        let index = `${res._id}`
        this.indexArray[index] = this.results.length;
        this.results.push(res);
        this.socket.emit('web-request', res._id);
        this.changeDetected = false;
      }
      else {
        alert(res);
      }
      }
    );
  }
}
