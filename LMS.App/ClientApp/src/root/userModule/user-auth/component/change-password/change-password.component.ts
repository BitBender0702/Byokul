import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/root/service/auth.service';
import { ChangePasswordModel } from 'src/root/interfaces/change-password';
import { MultilingualComponent } from 'src/root/root/sharedModule/Multilingual/multilingual.component';
import { BehaviorSubject, finalize } from 'rxjs';
import { MessageService } from 'primeng/api';
import { RolesEnum } from 'src/root/RolesEnum/rolesEnum';
export const changePassResponse =new BehaviorSubject <boolean>(false);  


@Component({
    selector: 'change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.css']
  })

export class ChangePasswordComponent extends MultilingualComponent implements OnInit {

    invalidPasswordChange!: boolean;
    changePasswordForm!:FormGroup;
    EMAIL_PATTERN = '[a-zA-Z0-9]+?(\\.[a-zA-Z0-9]+)*@[a-zA-Z]+\\.[a-zA-Z]{2,3}';
    PASSWORD_PATTERN = '^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*';
    isSubmitted: boolean = false;
    user: any = {};
    loadingIcon:boolean = false;
    isCurrentPasswordVisible:boolean=false;
    isNewPasswordVisible:boolean=false;
    isRepeatPasswordVisible:boolean=false;

    @ViewChild('currentPasswordInput') currentPasswordInput!: ElementRef<HTMLInputElement>;
    @ViewChild('newPasswordInput') newPasswordInput!: ElementRef<HTMLInputElement>;
    @ViewChild('repeatPasswordInput') repeatPasswordInput!: ElementRef<HTMLInputElement>;


    credentials: ChangePasswordModel = {email:'', currentPassword:'',password:'', confirmPassword:''};
    private _authService;
    constructor(injector: Injector,private fb: FormBuilder,private cd: ChangeDetectorRef,private router: Router, authService:AuthService,private route:ActivatedRoute,public messageService:MessageService) { 
      super(injector);
        this._authService = authService;
    }
    ngOnInit(): void {
     debugger;
      this._authService.loginState$.next(false);
      this._authService.loginAdminState$.next(false);
      const passwordValidators = [
        Validators.minLength(6),
        Validators.required,
        Validators.pattern(this.PASSWORD_PATTERN)
      ];

      this.changePasswordForm = this.fb.group({
        currentPassword: this.fb.control('', [Validators.required]),
        password: this.fb.control('', [...passwordValidators]),
        confirmPassword: this.fb.control('', [...passwordValidators]),
      });

    }

    onCurrentPasswordShow(){
      this.isCurrentPasswordVisible=true;
    }
  
    onCurrentPasswordHide(){
      this.isCurrentPasswordVisible=false;
    }

    onNewPasswordShow(){
      this.isNewPasswordVisible=true;
    }
  
    onNewPasswordHide(){
      this.isNewPasswordVisible=false;
    }

    onRepeatPasswordShow(){
      this.isRepeatPasswordVisible=true;
    }
  
    onRepeatPasswordHide(){
      this.isRepeatPasswordVisible=false;
    }

    matchPassword(){
      if(this.password?.value!=this.confirmPassword?.value){
        return true;
      }
      else 
      return false
    }

    matchCurrentAndNewPassword(){
      if(this.password?.value==this.currentPassword?.value){
        return true;
      }
      else 
      return false
    }

    get currentPassword() { return this.changePasswordForm.get('currentPassword'); }
    get password() { return this.changePasswordForm.get('password'); }
    get confirmPassword() { return this.changePasswordForm.get('confirmPassword'); }

    changePassword(){
      this.isSubmitted = true;
      
      if (!this.changePasswordForm.valid) {
        return;}

        if(this.matchPassword()){
          return;
        }
        if(this.matchCurrentAndNewPassword()){
          return;
        }

      this.loadingIcon = true;
      this.user = this.changePasswordForm.value;

      //this.user.passwordResetToken = this.route.snapshot.paramMap.get('id');
      this._authService.changePassword(this.user).pipe(finalize(()=> this.loadingIcon = false)).subscribe({
                next: (response:any) => {
                  if(response.result != "Success"){
                    this.changePasswordForm.setErrors({ unauthenticated: true });
                  }

                  else{
                  this.isSubmitted = false;
                  this.invalidPasswordChange = false; 
                  const token = localStorage.getItem("jwt")
                  var decodeData = this.getUserRoles(token);
                  if(decodeData.role?.indexOf(RolesEnum.SchoolAdmin) > -1){
                    this.router.navigateByUrl(`administration/adminHome`)
          
                  }
                  else{
                    this.router.navigateByUrl("user/auth/login");
                  }


                  
                  this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Password changed successfully...' });
                  changePassResponse.next(true); 
                  }
                },
                error: (err: HttpErrorResponse) => this.invalidPasswordChange = true
              })
      }

      getUserRoles(token:any): any{
        let jwtData = token.split('.')[1]
        let decodedJwtJsonData = window.atob(jwtData)
        let decodedJwtData = JSON.parse(decodedJwtJsonData)
        return decodedJwtData;
      }

    back(): void {
       window.history.back();
    }


}
