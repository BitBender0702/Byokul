import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";
import { Observable } from "rxjs";
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

@Injectable({providedIn: 'root'})

export class AuthService{
    private headers!: HttpHeaders;

    token: JwtResult = new Object as JwtResult;
    tokenExpiration = new Date();
    currentUser: string | null = '';
    role: string[] = [];

    get apiUrl(): string {
      return environment.apiUrl;
    }


    constructor(private router: Router, private http: HttpClient) { 
        this.headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});
    }

    loginUser(credentials:LoginModel): Observable<any> {
        const headers = { 'content-type': 'application/json'} 
        return this.http.post<AuthenticatedResponse>(`${this.apiUrl}/auth/login`, credentials, {'headers':headers});
    }

    registerUser(credentials:RegisterModel): Observable<any> {
        const headers = { 'content-type': 'application/json'} 
        return this.http.post<AuthenticatedResponse>(`${this.apiUrl}/auth/register`, credentials, {'headers':headers});
    }

    changePassword(credentials:ChangePasswordModel): Observable<any> {
        const headers = { 'content-type': 'application/json'} 
        return this.http.post<AuthenticatedResponse>(`${this.apiUrl}/auth/updatePassword`, credentials, {'headers':headers});
    }

    forgetPassword(credentials:ForgetPasswordModel): Observable<any> {
        const headers = { 'content-type': 'application/json'} 
        return this.http.post<AuthenticatedResponse>(`${this.apiUrl}/auth/forgetPassword`, credentials, {'headers':headers});
    }

    getBigBlueButton(): Observable<any> {
        
        const headers = { 'content-type': 'application/json'} 
        return this.http.post<AuthenticatedResponse>(`${this.apiUrl}/bigbluebutton/api/join?${`shi-vex-mpo-m9j`}`, '', {'headers':headers});
    }

    resetPassword(credentials:ResetPasswordModel): Observable<any> {
        const headers = { 'content-type': 'application/json'} 
        return this.http.post(`${this.apiUrl}/auth/resetPassword`, credentials, {'headers':headers});
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

}
