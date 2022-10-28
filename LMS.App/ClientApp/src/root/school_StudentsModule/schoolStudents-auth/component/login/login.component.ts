import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import axios from 'axios';
import { AuthService } from 'src/root/service/auth.service';
import { AuthenticatedResponse } from 'src/root/interfaces/auth_response';
import { LoginModel } from 'src/root/interfaces/login';
import { RolesEnum } from 'src/root/RolesEnum/rolesEnum';

@Component({
    selector: 'login-root',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
  })

export class LoginComponent implements OnInit {
    invalidLogin!: boolean;
    loginForm!:FormGroup;
    EMAIL_PATTERN = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
    isSubmitted: boolean = false;
    user: any = {};

    //credentials: LoginModel = {email:'', password:'',rememberMe:false};
    private _authService;
    constructor(private fb: FormBuilder,private router: Router, private http: HttpClient,authService:AuthService,private route: ActivatedRoute) { 
        this._authService = authService;
    }
  
    ngOnInit(): void {
      
      this.loginForm = this.fb.group({
        email: this.fb.control('', [Validators.required,Validators.pattern(this.EMAIL_PATTERN)]),
        password: this.fb.control('', [Validators.required]),
        rememberMe: this.fb.control(false),
      });

      try {
        var result = this._authService.getBigBlueButton();
        console.log(result);
      } catch (error) {
         console.log(error);   
      }
    }
  
    login(): void {
      debugger;
      this.isSubmitted = true;
      if (!this.loginForm.valid) {
        return;}
      this.user = this.loginForm.value;
      this._authService.loginUser(this.user).subscribe({
        next: (response: AuthenticatedResponse) => {
        this.isSubmitted = false;
        const token = response.token;
        localStorage.setItem("jwt", token); 
        this.router.navigate(["../../userHome"],{ relativeTo: this.route });
        },
      error: (err: HttpErrorResponse) => this.invalidLogin = true
      })
    }
    
  }
