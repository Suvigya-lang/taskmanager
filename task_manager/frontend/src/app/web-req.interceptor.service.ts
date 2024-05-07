import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError,tap, switchMap, empty, Subject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebReqInterceptor implements HttpInterceptor {

  constructor(private authService : AuthService) {}
  refreshingAccessToken: boolean=false;
  accessTokenRefreshed: any= new Subject();
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    req=this.addAuthHeader(req);
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse)=>{
        if(err.status===401){
           return this.refreshAccessToken().pipe(
            switchMap(()=>{
              req=this.addAuthHeader(req);
              return next.handle(req);
            }),catchError((err)=>{
              console.log(err);
              this.authService.logout();
              return empty();
            })
          )
        }
        return throwError(err);
      })
    )
  }
  
  refreshAccessToken(){
    if(this.refreshingAccessToken){
      return new Observable(observer=>{
       this.accessTokenRefreshed.subscribe(()=>{
        observer.next();
        observer.complete();
       })   
      })
    }
    else{
    this.refreshingAccessToken=true;
    return this.authService.getNewAccessToken().pipe(
      tap(()=>{
        this.refreshingAccessToken=false;
        console.log("Access token Refreshed");
        this.accessTokenRefreshed.next();
      })
    )
  }
  

  
  
}
addAuthHeader(request :HttpRequest<any>){
  const token=this.authService.getAccessToken();
  if(token){
    return request.clone({
      setHeaders: {
          'x-access-token': token
      }
    })
  }
  return request;
}

}
