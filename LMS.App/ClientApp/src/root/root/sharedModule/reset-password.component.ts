import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/root/service/auth.service';
import { ResetPasswordModel } from 'src/root/interfaces/reset-password';
import { MultilingualComponent } from './Multilingual/multilingual.component';
import { BehaviorSubject } from 'rxjs';
export const resetPassResponse =new BehaviorSubject <boolean>(false);  

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
    loadingIcon:boolean = false;
    
  private _authService;
    constructor(injector: Injector,private fb: FormBuilder,private router: Router, authService:AuthService, private route:ActivatedRoute) { 
      super(injector);
        this._authService = authService;
    }

    switchLanguage(lang:string){
      this.translate.use(lang);
    }

    ngOnInit(): void {
      this._authService.loginState$.next(false);
      const passwordValidators = [
        Validators.minLength(6),
        Validators.required,
      ];

      this.resetPasswordForm = this.fb.group({
        newPassword: this.fb.control('', [...passwordValidators]),
        confirmPassword: this.fb.control('', [...passwordValidators])
      });

    }

    get newPassword() { return this.resetPasswordForm.get('newPassword'); }
    get confirmPassword() { return this.resetPasswordForm.get('confirmPassword'); }

    matchPassword(){
      if(this.newPassword?.value!=this.confirmPassword?.value){
        return true;
      }
      else 
      return false
    
    }

    resetPassword(){
      this.isSubmitted = true;
      if (!this.resetPasswordForm.valid) {
        return;}

        if(this.matchPassword()){
          return;
        }
      this.loadingIcon = true;
      this.user = this.resetPasswordForm.value;
      this.user.passwordResetToken = this.route.snapshot.paramMap.get('id');
      this._authService.resetPassword(this.user).subscribe({ 
                next: () => {
                  this.isSubmitted = false;
                  this.invalidPasswordReset = false; 
                  this.router.navigateByUrl("user/auth/login");
                  resetPassResponse.next(true); 
                },
                error: (err: HttpErrorResponse) => this.invalidPasswordReset = true
              })
    }

  }
