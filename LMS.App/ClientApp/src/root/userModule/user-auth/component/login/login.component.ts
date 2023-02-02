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
import { confirmEmailResponse } from '../confirmEmail/confirmEmail.component';
import { MessageService } from 'primeng/api';
import { SignalrService } from 'src/root/service/signalr.service';
import { UserService } from 'src/root/service/user.service';

@Component({
    selector: 'login-root',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    providers: [MessageService]
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
    constructor(injector: Injector, public messageService:MessageService,private fb: FormBuilder,private router: Router,private signalRService: SignalrService, 
      private userService: UserService,
      private http: HttpClient,authService:AuthService,private route: ActivatedRoute) { 
      super(injector);
      this._authService = authService;
    }
  
    ngOnInit(): void {
      this._authService.loginState$.next(false);
      this.selectedLanguage = localStorage.getItem("selectedLanguage");
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

    // confirmEmailResponse.subscribe(response => {
    //   debugger
    //   this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Email confirm successfully'});
    //   this.selectedLanguage = localStorage.getItem("selectedLanguage");
    //   this.loginForm = this.fb.group({
    //     email: this.fb.control('', [Validators.required,Validators.pattern(this.EMAIL_PATTERN)]),
    //     password: this.fb.control('', [Validators.required])
    //   });

    //   try {
    //     var result = this._authService.getBigBlueButton();
    //     console.log(result);
    //   } catch (error) {
    //      console.log(error);   
    //   }

        
    //   });
    }
  
    login(): void {
        
      this.isSubmitted = true;
      if (!this.loginForm.valid) {
        return;}
      this.loadingIcon = true;
      this.user = this.loginForm.value;
      this._authService.loginUser(this.user).pipe(finalize(()=> this.loadingIcon= false)).subscribe({
        next: (response: AuthenticatedResponse) => {
          if(response.token == "user not found"){
            this._authService.loginState$.next(false);
            this.loginForm.setErrors({ unauthenticated: true });
          }
          if(response.token == "email not confirm"){
            this._authService.loginState$.next(false);
            this.loginForm.setErrors({ emailNotConfirmed: true });
          }
          if(response.token != "user not found" && response.token != "email not confirm"){
            this.isSubmitted = false;
            this.loadingIcon = false;
            this._authService.loginState$.next(true);
        const token = response.token;
        localStorage.setItem("jwt", token); 
        
        var decodeData = this.getUserRoles(token);
        if(decodeData.role?.indexOf(RolesEnum.SchoolAdmin) > -1){
          this.router.navigateByUrl(`administration/adminHome`)

        }
        else{
          if(decodeData.isBan == 'True'){
            this.loginForm.setErrors({ banUserMessage: true });
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
      return decodedJwtData;
    }
    
  }
