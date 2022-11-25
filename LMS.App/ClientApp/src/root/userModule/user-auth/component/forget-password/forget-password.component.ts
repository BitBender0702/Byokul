import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/root/service/auth.service';
import { ForgetPasswordModel } from 'src/root/interfaces/forget-password';
import { MultilingualComponent } from 'src/root/root/sharedModule/Multilingual/multilingual.component';
import { finalize } from 'rxjs';


@Component({
    selector: 'reset-password',
    templateUrl: './forget-password.component.html',
    styleUrls: ['./forget-password.component.css']
  })

export class ForgetPasswordComponent extends MultilingualComponent implements OnInit {
    invalidForgetPassword!: boolean;

    forgotPasswordForm!:FormGroup;
    EMAIL_PATTERN = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
    isSubmitted: boolean = false;
    user: any = {};
    loadingIcon:boolean = false;
    
    credentials: ForgetPasswordModel = {email:''};
    private _authService;
    constructor(injector: Injector,private fb: FormBuilder,private router: Router, authService:AuthService) { 
      super(injector);
        this._authService = authService;
    }
    
    back(): void {
      window.history.back();
  }
  
    ngOnInit(): void {
      this.selectedLanguage = localStorage.getItem("selectedLanguage");
      this.forgotPasswordForm = this.fb.group({
        email: this.fb.control('', [Validators.required,Validators.pattern(this.EMAIL_PATTERN)])
      });
    }

    forgotPassword(){
      this.isSubmitted = true;
      if (!this.forgotPasswordForm.valid) {
        return;}
        this.loadingIcon = true;
      this.user = this.forgotPasswordForm.value;
      this._authService.forgetPassword(this.user).pipe(finalize(()=> this.loadingIcon = false)).subscribe({
                next: () => {
                  this.isSubmitted = false;
                  this.invalidForgetPassword = false; 
                  this.router.navigateByUrl("user/auth/login");
                },
                error: (err: HttpErrorResponse) => this.invalidForgetPassword = true
              })
    }
    
  }
