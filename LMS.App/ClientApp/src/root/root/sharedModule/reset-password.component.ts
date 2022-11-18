import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/root/service/auth.service';
import { ResetPasswordModel } from 'src/root/interfaces/reset-password';
import { MultilingualComponent } from './Multilingual/multilingual.component';

@Component({
    selector: 'change-password',
    templateUrl: './reset-password.component.html',
    styleUrls: []
  })

export class ResetPasswordComponent extends MultilingualComponent implements OnInit {
    invalidPasswordReset!: boolean;

    resetPasswordForm!:FormGroup;
    isSubmitted: boolean = false;
    user: any;
    
  private _authService;
    constructor(injector: Injector,private fb: FormBuilder,private router: Router, authService:AuthService, private route:ActivatedRoute) { 
      super(injector);
        this._authService = authService;
    }

    switchLanguage(lang:string){
      this.translate.use(lang);
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

  }
