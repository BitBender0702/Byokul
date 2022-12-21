import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/root/service/auth.service';
import { ChangePasswordModel } from 'src/root/interfaces/change-password';
import { MultilingualComponent } from 'src/root/root/sharedModule/Multilingual/multilingual.component';
import { finalize } from 'rxjs';

@Component({
    selector: 'change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.css']
  })

export class ChangePasswordComponent extends MultilingualComponent implements OnInit {

    invalidPasswordChange!: boolean;
    changePasswordForm!:FormGroup;
    EMAIL_PATTERN = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
    isSubmitted: boolean = false;
    user: any = {};
    loadingIcon:boolean = false;

    credentials: ChangePasswordModel = {email:'', currentPassword:'',password:'', confirmPassword:''};
    private _authService;
    constructor(injector: Injector,private fb: FormBuilder,private router: Router, authService:AuthService,private route:ActivatedRoute) { 
      super(injector);
        this._authService = authService;
    }
    ngOnInit(): void {

      const passwordValidators = [
        Validators.minLength(6),
        Validators.required,
      ];

      this.changePasswordForm = this.fb.group({
        //email: this.fb.control('', [Validators.required,Validators.pattern(this.EMAIL_PATTERN)]),
        currentPassword: this.fb.control('', [Validators.required]),
        password: this.fb.control('', [...passwordValidators]),
        confirmPassword: this.fb.control('', [...passwordValidators]),
      });

    }

    matchPassword(){
      if(this.password?.value!=this.confirmPassword?.value){
        return true;
      }
      else 
      return false
    }

    get password() { return this.changePasswordForm.get('password'); }
    get confirmPassword() { return this.changePasswordForm.get('confirmPassword'); }

    changePassword(){
      debugger
      this.isSubmitted = true;
      if (!this.changePasswordForm.valid) {
        return;}

        if(this.matchPassword()){
          return;
        }

      this.loadingIcon = true;
      this.user = this.changePasswordForm.value;
      this.user.passwordResetToken = this.route.snapshot.paramMap.get('id');
      this._authService.changePassword(this.user).pipe(finalize(()=> this.loadingIcon = false)).subscribe({
                next: (response:any) => {
                  debugger

                  if(response.result == ""){
                    this.changePasswordForm.setErrors({ unauthenticated: true });
                  }

                  else{
                  this.isSubmitted = false;
                  this.invalidPasswordChange = false; 
                  this.router.navigateByUrl("user/auth/login");
                  }
                },
                error: (err: HttpErrorResponse) => this.invalidPasswordChange = true
              })
      }


  }
