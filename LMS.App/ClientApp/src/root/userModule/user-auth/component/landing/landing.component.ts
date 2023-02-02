import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from 'src/root/service/auth.service';
import { AuthenticatedResponse } from 'src/root/interfaces/auth_response';
import { MultilingualComponent } from 'src/root/root/sharedModule/Multilingual/multilingual.component';
import { finalize } from 'rxjs';

@Component({
    selector: 'landing-root',
    templateUrl: './landing.component.html',
    styleUrls: []
  })

export class LandingComponent implements OnInit {
  private _authService;
    //credentials: LoginModel = {email:'', password:'',rememberMe:false};
    // private _authService;
    constructor(authService:AuthService) { 
      this._authService = authService;
    }
  
    ngOnInit(): void {
      this._authService.loginState$.next(false);
    //   this.selectedLanguage = localStorage.getItem("selectedLanguage");

    }
  
    // login(): void {

    //   if (!this.loginForm.valid) {
    //     return;}
        
    //   this.loadingIcon = true;
    //   this.isSubmitted = true;
    //   this.user = this.loginForm.value;
    //   this._authService.loginUser(this.user).pipe(finalize(()=> this.loadingIcon= false)).subscribe({
    //     next: (response: AuthenticatedResponse) => {
    //     this.isSubmitted = false;
    //     const token = response.token;
    //     localStorage.setItem("jwt", token); 
    //     this.router.navigate(["../../createSchool"],{ relativeTo: this.route });
    //     },
    //   error: (err: HttpErrorResponse) => this.invalidLogin = true
    //   })
    // }
    
  }
