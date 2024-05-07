import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { shareReplay, tap } from 'rxjs';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private webService :WebRequestService, private router :Router,private http: HttpClient) {
    }

    login(email: string,password: string){
      return this.webService.login(email,password).pipe(
        shareReplay(),
        tap((res :HttpResponse<any>)=>{
          // the auth tokens will be in the header of the response
          this.setSession(res.body._id,String(res.headers.get('x-access-token')),String(res.headers.get('x-refresh-token')));
          console.log("Logged in");
        })
      );

    }
    signup(email :string,password:string){
      return this.webService.singup(email,password).pipe(
        shareReplay(),
        tap((res :HttpResponse<any>)=>{
          // the auth tokens will be in the header of the response
          this.setSession(res.body._id,String(res.headers.get('x-access-token')),String(res.headers.get('x-refresh-token')));
          console.log("Signed Up");
        })
      );
    }
    private setSession(userId :string,accessToken: string,refreshToken :string){

      localStorage.setItem('user-Id',userId);
      localStorage.setItem('x-refresh-token',refreshToken);
      localStorage.setItem('x-access-token',accessToken);

    }
    private removeSession(){

      localStorage.removeItem('user-Id');
      localStorage.removeItem('x-refresh-token');
      localStorage.removeItem('x-access-token')
    }
    logout(){
      this.removeSession();
      this.router.navigateByUrl('/login')
    }
    getUserId(){
      return localStorage.getItem('user-Id')
    }
    getAccessToken(){
      return localStorage.getItem('x-access-token');
    }
    getRefreshToken(){
      return localStorage.getItem('x-refresh-token');
    }
    setAccessToken(accessToken: string){
      localStorage.setItem('x-access-token',accessToken)
    }
    getNewAccessToken(){
      return this.http.get(`${this.webService.ROOT_URL}/users/me/access-token`,{
        headers:{
          'x-refresh-token': String(this.getRefreshToken()),
          '_id': String(this.getUserId())
        },
        observe: 'response'
      }).pipe((
        tap((res: HttpResponse<any>)=>{
          this.setAccessToken(String(res.headers.get('x-access-token')));
        })
      ))
    }
  }

