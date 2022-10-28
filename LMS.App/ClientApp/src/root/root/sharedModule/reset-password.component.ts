import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/root/service/auth.service';
import { ResetPasswordModel } from 'src/root/interfaces/reset-password';

@Component({
    selector: 'change-password',
    templateUrl: './reset-password.component.html',
    styleUrls: []
  })

export class ResetPasswordComponent implements OnInit {
    invalidPasswordReset!: boolean;

    resetPasswordForm!:FormGroup;
    isSubmitted: boolean = false;
    user: any;
    
    //credentials: ResetPasswordModel = {newPassword:'', confirmPassword:''};
    private _authService;
    constructor(private fb: FormBuilder,private router: Router, authService:AuthService, private route:ActivatedRoute) { 
        this._authService = authService;
    }
    ngOnInit(): void {

      this.resetPasswordForm = this.fb.group({
        newPassword: this.fb.control('', [Validators.required]),
        confirmPassword: this.fb.control('', [Validators.required])
      });

    }

    resetPassword(){
      this.isSubmitted = true;
      if (!this.resetPasswordForm.valid) {
        return;}
      this.user = this.resetPasswordForm.value;
      this.user.passwordResetToken = this.route.snapshot.paramMap.get('id');
      this._authService.resetPassword(this.user).subscribe({ 
                next: () => {
                  this.isSubmitted = false;
                  this.invalidPasswordReset = false; 
                  this.router.navigateByUrl("user/auth/login");
                },
                error: (err: HttpErrorResponse) => this.invalidPasswordReset = true
              })
    }

    // resetPassword = ( form: NgForm) => {
    //     if (form.valid) {
    //       this._authService.resetPassword(this.credentials).subscribe({ 
    //         next: () => {
    //           this.invalidPasswordReset = false; 
    //           this.router.navigateByUrl("school-Teachers/auth/login");
    //         },
    //         error: (err: HttpErrorResponse) => this.invalidPasswordReset = true
    //       })
    //     }
    //   }
  }
