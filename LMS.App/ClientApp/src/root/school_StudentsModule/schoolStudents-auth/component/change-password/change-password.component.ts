import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/root/service/auth.service';
import { ChangePasswordModel } from 'src/root/interfaces/change-password';

@Component({
    selector: 'change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.css']
  })

export class ChangePasswordComponent implements OnInit {
    invalidPasswordChange!: boolean;

    changePasswordForm!:FormGroup;
    EMAIL_PATTERN = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
    isSubmitted: boolean = false;
    user: any = {};

    credentials: ChangePasswordModel = {email:'', currentPassword:'',password:'', confirmPassword:''};
    private _authService;
    constructor(private fb: FormBuilder,private router: Router, authService:AuthService,private route:ActivatedRoute) { 
        this._authService = authService;
    }
    ngOnInit(): void {

      this.changePasswordForm = this.fb.group({
        email: this.fb.control('', [Validators.required,Validators.pattern(this.EMAIL_PATTERN)]),
        currentPassword: this.fb.control('', [Validators.required]),
        password: this.fb.control('', [Validators.required]),
        confirmPassword: this.fb.control('', [Validators.required]),
      });

    }

    changePassword(){
      this.isSubmitted = true;
      if (!this.changePasswordForm.valid) {
        return;}
      this.user = this.changePasswordForm.value;
      this.user.passwordResetToken = this.route.snapshot.paramMap.get('id');
      this._authService.changePassword(this.user).subscribe({
                next: () => {
                  this.isSubmitted = false;
                  this.invalidPasswordChange = false; 
                  this.router.navigateByUrl("user/auth/login");
                },
                error: (err: HttpErrorResponse) => this.invalidPasswordChange = true
              })
      }

    // changePassword = ( form: NgForm) => {
        
    //     if (form.valid) {
    //       this._authService.changePassword(this.credentials).subscribe({
    //         next: () => {
              
    //           this.invalidPasswordChange = false; 
    //           this.router.navigateByUrl("user/auth/login");
    //         },
    //         error: (err: HttpErrorResponse) => this.invalidPasswordChange = true
    //       })
    //     }
    //   }
  }
