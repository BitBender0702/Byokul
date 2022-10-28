import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/root/service/auth.service';
import { ForgetPasswordModel } from 'src/root/interfaces/forget-password';


@Component({
    selector: 'reset-password',
    templateUrl: './forget-password.component.html',
    styleUrls: ['./forget-password.component.css']
  })

export class ForgetPasswordComponent implements OnInit {
    invalidForgetPassword!: boolean;

    forgotPasswordForm!:FormGroup;
    EMAIL_PATTERN = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
    isSubmitted: boolean = false;
    user: any = {};
    
    credentials: ForgetPasswordModel = {email:''};
    private _authService;
    constructor(private fb: FormBuilder,private router: Router, authService:AuthService) { 
        this._authService = authService;
    }
    ngOnInit(): void {
      this.forgotPasswordForm = this.fb.group({
        email: this.fb.control('', [Validators.required,Validators.pattern(this.EMAIL_PATTERN)])
      });
    }

    forgotPassword(){
      this.isSubmitted = true;
      if (!this.forgotPasswordForm.valid) {
        return;}
      this.user = this.forgotPasswordForm.value;
      this._authService.forgetPassword(this.user).subscribe({
                next: () => {
                  this.isSubmitted = false;
                  this.invalidForgetPassword = false; 
                  this.router.navigateByUrl("user/auth/login");
                },
                error: (err: HttpErrorResponse) => this.invalidForgetPassword = true
              })
    }
    
  }
