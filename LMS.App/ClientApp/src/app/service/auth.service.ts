// import { HttpClient, HttpHeaders } from "@angular/common/http";
// import { Injectable } from "@angular/core"; 
// import { Router } from "@angular/router";
// import { JwtHelperService } from "@auth0/angular-jwt";
// import { Observable } from "rxjs";

// @Injectable({providedIn: 'root'})

// export class LoginService{
//     private headers!: HttpHeaders;

//     constructor(private router: Router, private http: HttpClient) { 
//         this.headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});
//     }

//     private addPointUrlForLogin: string = 'http://localhost:5220/auth/login';
//     loginUser(credentials:LoginModel): Observable<any> {
//         const headers = { 'content-type': 'application/json'} 
//         return this.http.post<AuthenticatedResponse>(`${this.addPointUrlForLogin}`, credentials, {'headers':headers});
//     }

//     private addPointUrlForRegister: string = 'http://localhost:5220/auth/register';
//     registerUser(credentials:RegisterModel): Observable<any> {
//         const headers = { 'content-type': 'application/json'} 
//         return this.http.post<AuthenticatedResponse>(`${this.addPointUrlForRegister}`, credentials, {'headers':headers});
//     }

//     private addPointUrlForChangePassword: string = 'http://localhost:5220/auth/updatePassword';
//     changePassword(credentials:ChangePasswordModel): Observable<any> {
//         const headers = { 'content-type': 'application/json'} 
//         return this.http.post<AuthenticatedResponse>(`${this.addPointUrlForChangePassword}`, credentials, {'headers':headers});
//     }

//     private addPointUrlForResetPassword: string = 'http://localhost:5220/auth/resetPassword';
//     resetPassword(credentials:ResetPasswordModel): Observable<any> {
        
//         const headers = { 'content-type': 'application/json'} 
//         return this.http.post<AuthenticatedResponse>(`${this.addPointUrlForResetPassword}`, credentials, {'headers':headers});
//     }

//     private urlBigBluebutton: string = 'http://localhost:5220/bigbluebutton/api/join?${`shi-vex-mpo-m9j`}';
//     getBigBlueButton(): Observable<any> {
        
//         const headers = { 'content-type': 'application/json'} 
//         return this.http.post<AuthenticatedResponse>(`${this.urlBigBluebutton}`, '', {'headers':headers});
//     }

//     isUserAuthenticateed(){
        
//         const helper = new JwtHelperService();
//         const token = localStorage.getItem("jwt");
//         const decodedToken = helper.decodeToken(token!);
//         const expirationDate = helper.getTokenExpirationDate(token!);
//         const isExpired = helper.isTokenExpired(token!);
//         if(isExpired){
//            return false;
//         }
//         else{
//             return true;
//         }
//     }

// }
