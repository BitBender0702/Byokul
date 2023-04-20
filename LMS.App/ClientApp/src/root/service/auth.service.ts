import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";
import { BehaviorSubject, observable, Observable } from "rxjs";
import { AuthenticatedResponse } from "../interfaces/auth_response";
import { ChangePasswordModel } from "../interfaces/change-password";
import { JwtResult } from "../interfaces/jwtResult";
import { LoginModel } from "../interfaces/login";
import { RegisterModel } from "../interfaces/register";
import { ForgetPasswordModel } from "../interfaces/forget-password";
import jwt_decode from 'jwt-decode';
import { RolesEnum } from "../RolesEnum/rolesEnum";
import { ResetPasswordModel } from "../interfaces/reset-password";
import { environment } from "src/environments/environment";
import { Subject } from "@microsoft/signalr";
import { SetPasswordViewModel } from "../interfaces/set-password";

@Injectable({providedIn: 'root'})

export class AuthService{
    authToken:string = localStorage.getItem("jwt")?? '';
    private headers!: HttpHeaders;
    token: JwtResult = new Object as JwtResult;
    tokenExpiration = new Date();
    currentUser: string | null = '';
    role: string[] = [];

    loginState$ = new BehaviorSubject<boolean>(true);
    get apiUrl(): string {
      return environment.apiUrl;
    }


    constructor(private router: Router, private http: HttpClient) { 
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.authToken);

    }

    loginUser(credentials:LoginModel): Observable<any> {
        const headers = { 'content-type': 'application/json'} 
        return this.http.post<AuthenticatedResponse>(`${this.apiUrl}/auth/login`, credentials, {headers: this.headers});
    }

    registerUser(credentials:RegisterModel): Observable<any> {
        const headers = { 'content-type': 'application/json'} 
        return this.http.post<AuthenticatedResponse>(`${this.apiUrl}/auth/register`, credentials, {headers: this.headers});
    }

    changePassword(credentials:ChangePasswordModel): Observable<any> {
      var authToken = localStorage.getItem("jwt")?? '';
      this.headers = new HttpHeaders().set("Authorization", "Bearer " + authToken);
      return this.http.post<AuthenticatedResponse>(`${this.apiUrl}/auth/updatePassword`, credentials, {headers: this.headers});
    }

    forgetPassword(credentials:ForgetPasswordModel): Observable<any> {
        const headers = { 'content-type': 'application/json'} 
        return this.http.post<AuthenticatedResponse>(`${this.apiUrl}/auth/forgetPassword`, credentials, {headers: this.headers});
    }

    getBigBlueButton(): Observable<any> {
        
        const headers = { 'content-type': 'application/json'} 
        return this.http.post<AuthenticatedResponse>(`${this.apiUrl}/bigbluebutton/api/join?${`shi-vex-mpo-m9j`}`, '', {headers: this.headers});
    }

    resetPassword(credentials:ResetPasswordModel): Observable<any> {
        const headers = { 'content-type': 'application/json'} 
        return this.http.post(`${this.apiUrl}/auth/resetPassword`, credentials, {headers: this.headers});
    }

    isUserAuthenticateed(){
        const helper = new JwtHelperService();
        const token = localStorage.getItem("jwt");
        const decodedToken = helper.decodeToken(token!);
        const expirationDate = helper.getTokenExpirationDate(token!);
        const isExpired = helper.isTokenExpired(token!);
        if(isExpired){
           return false;
        }
        else{
            return true;
        }
    }

    get loginRequired(): boolean {
        var validToken = localStorage.getItem("jwt");
        if (validToken == null) {
          return true;
        }
        const decodeToken:any = jwt_decode(validToken);
        this.role = decodeToken["role"];
        return validToken.length === 0;
      }

      roleUser(userRole:any) {
        var check:Boolean = false;
          if (this.role == userRole) {
            check = true;
          }
          else
          {
            check = false;
          }
        return check;
    
      }

    confirmEmail(token:string,email:string):Observable<any>{
      
      let queryParams = new HttpParams().append("token",token).append("email",email);
      return this.http.get(`${this.apiUrl}/auth/confirmEmail`, {params:queryParams, headers:this.headers});
    }

    setPassword(model:SetPasswordViewModel): Observable<any> {
      return this.http.post(`${this.apiUrl}/auth/setPassword`, model,{headers: this.headers});
  }
}
