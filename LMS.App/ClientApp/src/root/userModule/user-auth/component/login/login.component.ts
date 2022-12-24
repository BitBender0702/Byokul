import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import axios from 'axios';
import { AuthService } from 'src/root/service/auth.service';
import { AuthenticatedResponse } from 'src/root/interfaces/auth_response';
import { LoginModel } from 'src/root/interfaces/login';
import { RolesEnum } from 'src/root/RolesEnum/rolesEnum';
import { MultilingualComponent } from 'src/root/root/sharedModule/Multilingual/multilingual.component';
import { finalize } from 'rxjs';

@Component({
    selector: 'login-root',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
  })

export class LoginComponent extends MultilingualComponent implements OnInit {
    invalidLogin!: boolean;
    loginForm!:FormGroup;
    EMAIL_PATTERN = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
    isSubmitted: boolean = false;
    user: any = {};
    selectedLanguage:any;
    loadingIcon:boolean = false;

    //credentials: LoginModel = {email:'', password:'',rememberMe:false};
    private _authService;
    constructor(injector: Injector,private fb: FormBuilder,private router: Router, private http: HttpClient,authService:AuthService,private route: ActivatedRoute) { 
      super(injector);
      this._authService = authService;
    }
  
    ngOnInit(): void {
      this.selectedLanguage = localStorage.getItem("selectedLanguage");
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
        
      this.isSubmitted = true;
      if (!this.loginForm.valid) {
        return;}
      this.loadingIcon = true;
      this.user = this.loginForm.value;
      this._authService.loginUser(this.user).pipe(finalize(()=> this.loadingIcon= false)).subscribe({
        next: (response: AuthenticatedResponse) => {
          if(response.token == ""){

            this.loginForm.setErrors({ unauthenticated: true });
          }
          else{
            this.isSubmitted = false;
            this.loadingIcon = false;
        const token = response.token;
        localStorage.setItem("jwt", token); 
        var roles = this.getUserRoles(token);
        if(roles?.indexOf(RolesEnum.SchoolAdmin) > -1){
          this.router.navigateByUrl(`admin/adminHome`)

        }
        else{

        this.router.navigate(["../../myEarnings"],{ relativeTo: this.route });
        }
          }
        
        },
      error: (err: HttpErrorResponse) => this.invalidLogin = true
      })
    }

    getUserRoles(token:string): any{
      let jwtData = token.split('.')[1]
      let decodedJwtJsonData = window.atob(jwtData)
      let decodedJwtData = JSON.parse(decodedJwtJsonData)
      return decodedJwtData.role;
    }
    
  }
