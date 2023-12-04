import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/root/service/auth.service';
import { AuthenticatedResponse } from 'src/root/interfaces/auth_response';
import { RolesEnum } from 'src/root/RolesEnum/rolesEnum';
import { MultilingualComponent } from 'src/root/root/sharedModule/Multilingual/multilingual.component';
import { BehaviorSubject, finalize, Subject, Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { SignalrService } from 'src/root/service/signalr.service';
import { UserService } from 'src/root/service/user.service';
import { registrationResponse } from '../register/register.component';
import { forgotPassResponse } from '../forget-password/forget-password.component';
import { confirmEmailResponse } from '../confirmEmail/confirmEmail.component';
import { resetPassResponse } from 'src/root/root/sharedModule/reset-password.component';
import { changePassResponse } from '../change-password/change-password.component';
import { setPassResponse } from '../set-password/set-password.component';
import { TranslateService } from '@ngx-translate/core';
import { ResendEmailModel } from 'src/root/interfaces/resendEmailModel';
export const dashboardResponse =new Subject<{token:string}>(); 
export const feedState =new BehaviorSubject <string>('myFeed');  
declare var $: any;


@Component({
    selector: 'login-root',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    providers: [MessageService]
  })

export class LoginComponent extends MultilingualComponent implements OnInit, OnDestroy{
    invalidLogin!: boolean;
    loginForm!:FormGroup;
    EMAIL_PATTERN = '[a-zA-Z0-9]+?(\\.[a-zA-Z0-9]+)*@[a-zA-Z]+\\.[a-zA-Z]{2,3}';
    isSubmitted: boolean = false;
    user: any = {};
    selectedLanguage:any;
    loadingIcon:boolean = false;
    isRegister!:boolean;
    isConfirmEmail!:boolean;
    private _authService;
    isForgotPassSent!: boolean;
    isResetpassword!: boolean;
    isSetPassword!: boolean;
    isChangePassword!: boolean;
    isPasswordVisible:boolean=false;
    confirmEmailSubscription!:Subscription;
    registrationSubscription!:Subscription;
    forgotPasswordSubscription!: Subscription;
    resetPasswordSubscription!:Subscription;
    changePasswordSubscription!: Subscription;
    setPasswordSubscription!: Subscription;
    confirmedEmail: string = "";
    @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;
  


    constructor(injector: Injector, public translateService: TranslateService, public messageService:MessageService,private fb: FormBuilder,private router: Router,private signalRService: SignalrService, 
      private userService: UserService,
      private http: HttpClient,authService:AuthService,private route: ActivatedRoute,private cd: ChangeDetectorRef) { 
      super(injector);
      this._authService = authService;
      this.route.queryParams.subscribe(params => {
        this.confirmedEmail = params['confirmedEmail'];
      });
    }
  
    ngOnInit(): void {   
      if(localStorage.getItem("jwt")){
        this.router.navigate([`/user/userFeed`]);
      }
      this._authService.loginState$.next(false);
      this.selectedLanguage = localStorage.getItem("selectedLanguage");
      if(this.selectedLanguage == null || this.selectedLanguage == ""){
        localStorage.setItem("selectedLanguage","en");
      }
      this.loginForm = this.fb.group({
        email: this.fb.control('', [Validators.required,Validators.pattern(this.EMAIL_PATTERN)]),
        password: this.fb.control('', [Validators.required])
      });

      try {
        var result = this._authService.getBigBlueButton();
        console.log(result);
      } catch (error) {
         console.log(error);   
      }


      if(this.confirmedEmail == "true"){
        setTimeout(() => {
        const translatedMessage = this.translateService.instant('EmailConfirmedSuccessfully');
        const translatedSummary = this.translateService.instant('Success');
        this.messageService.add({severity: 'success',summary: translatedSummary,life: 3000,detail: translatedMessage});      
        this.cd.detectChanges();
        },100)
      }
      if (!this.confirmEmailSubscription) {
        this.confirmEmailSubscription = confirmEmailResponse.subscribe(response => {
           this.cd.detectChanges();
           if(response != ''){
             this.isConfirmEmail = true;
             this.loginForm.controls.email.setValue(response);     
           }
           else{
             this.isConfirmEmail = false;
           }
         });
      }

       if (!this.registrationSubscription) {
        this.registrationSubscription = registrationResponse.subscribe(response => {
        this.isRegister = response;
       });
      }

      if (!this.forgotPasswordSubscription) {
        this.forgotPasswordSubscription =
      forgotPassResponse.subscribe(response => {
        this.isForgotPassSent = response;
      });
    }

    if (!this.resetPasswordSubscription) {
      this.resetPasswordSubscription = resetPassResponse.subscribe(response => {
        this.cd.detectChanges();
        this.isResetpassword = response;
        if(this.isResetpassword){
          const translatedMessage = this.translateService.instant('PasswordResetSuccessfully');
          const translatedSummary = this.translateService.instant('Success');
          this.messageService.add({severity: 'success',summary: translatedSummary,life: 3000,detail: translatedMessage,
          });        
        }
      });
    }

    if (!this.changePasswordSubscription) {
      this.changePasswordSubscription = changePassResponse.subscribe(response => {
        this.cd.detectChanges();
        this.isChangePassword = response.isPasswordChange;
        if(this.isChangePassword){
          const translatedMessage = this.translateService.instant('PasswordChangedSuccessfully');
          const translatedSummary = this.translateService.instant('Success');
          this.messageService.add({severity: 'success',summary: translatedSummary,life: 3000,detail: translatedMessage,
          });        
        }
      });
    }

      if (!this.setPasswordSubscription) {
        this.setPasswordSubscription = setPassResponse.subscribe(response => {
        this.cd.detectChanges();
        this.isSetPassword = response;
        if(this.isSetPassword){
          const translatedMessage = this.translateService.instant('PasswordSetSuccessfully');
          const translatedSummary = this.translateService.instant('Success');
          this.messageService.add({severity: 'success',summary: translatedSummary,life: 3000,detail: translatedMessage,
          });       
        }
      });
    }
  }

    ngOnDestroy(): void {
      if (this.confirmEmailSubscription) {
        this.confirmEmailSubscription.unsubscribe();
      }
      if (this.registrationSubscription) {
        this.registrationSubscription.unsubscribe();
      }
      if (this.forgotPasswordSubscription) {
        this.forgotPasswordSubscription.unsubscribe();
      }
      if (this.resetPasswordSubscription) {
        this.resetPasswordSubscription.unsubscribe();
      }
      if (this.changePasswordSubscription) {
        this.changePasswordSubscription.unsubscribe();
      }
      if (this.setPasswordSubscription) {
        this.setPasswordSubscription.unsubscribe();
      }
    }
  
    onPasswordShow(){
      this.isPasswordVisible=true;
    }
  
    onPasswordHide(){
      this.isPasswordVisible=false;
    }
    
    login(): void {
      this.isSubmitted = true;
      if (!this.loginForm.valid) {
        return;}
      this.loadingIcon = true;
      this.user = this.loginForm.value;
      this._authService.loginUser(this.user).pipe(finalize(()=> this.loadingIcon= false)).subscribe({
        next: (response: AuthenticatedResponse) => {
          if(response.errorMessage == "This email is not registered"){
            this._authService.loginState$.next(false);
            this.loginForm.setErrors({ unauthenticated: true });
          }

          if(response.errorMessage == "The password you entered is incorrect"){
            this._authService.loginState$.next(false);
            this.loginForm.setErrors({ incorrectPassword: true });
          }

          if(response.errorMessage == "Email is not confirmed"){
            localStorage.setItem("email",this.user.email);
            $("#resend-email").modal('show');
            this._authService.loginState$.next(false);
            this.loginForm.setErrors({ emailNotConfirmed: true });
            
          }
          if(response.errorMessage != "This email is not registered" && response.errorMessage != "email not confirm" && response.errorMessage != "The password you entered is incorrect"){
            this.isSubmitted = false;
            this.loadingIcon = false;
            this._authService.loginState$.next(true);
        const token = response.token;
        localStorage.setItem("jwt", token); 
        const userpermissions = response.userPermissions;
        localStorage.setItem("userPermissions", JSON.stringify(userpermissions));
        dashboardResponse.next({token:token});
        this.signalRService.initializeConnection(token);
        this.signalRService.startConnection();
        setTimeout(() => {
          this.signalRService.askServerListener();
        }, 500);
        var decodeData = this.getUserRoles(token);
        if(decodeData.role?.indexOf(RolesEnum.SchoolAdmin) > -1){
          this.router.navigateByUrl(`administration/adminHome`)

        }
        else{
          if(decodeData.isBan == 'True'){
            this._authService.loginState$.next(false);
            this.loginForm.setErrors({ banUserMessage: true });
            localStorage.removeItem("jwt"); 
          }

          else{
            this.router.navigate(["../../userFeed"],{ relativeTo: this.route });
          }
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
        var freetrialInfo = {
          trialSchoolCreationDate: decodedJwtData.trialSchoolCreationDate,
          userSchoolsCount: decodedJwtData.userSchoolsCount
        }
        localStorage.setItem("freeTrialInfo", JSON.stringify(freetrialInfo));
      return decodedJwtData;
    }
    connectSignalR() : void {
      let token = localStorage.getItem("jwt"); 
      if(!token)
        return;
      this.signalRService.startConnection();
      setTimeout(() => {
              this.signalRService.askServerListener();
              this.signalRService.askServer(this.getUserRoles(token!).jti);
            }, 500);
    }
    

    sendMail:ResendEmailModel = new Object as ResendEmailModel;
    invalidRegister:boolean=true;
    resendEmailToUser(){
      var email = localStorage.getItem("email")
        if(email){
          this.sendMail.email = email;
        }
      this._authService.resendEmail(this.sendMail).pipe(finalize(()=> this.loadingIcon = false)).subscribe({
          next: (response: AuthenticatedResponse) => {
          if(response.result != "success"){
          }
          else{
          this.isSubmitted = false;
          const token = response.token;
          localStorage.setItem("jwt", token); 
          this.invalidRegister = false;
          this.router.navigateByUrl("user/auth/login");
          registrationResponse.next(true); 
        }
        },
        error: (err: HttpErrorResponse) => {}
      })
    }
    
  }
