import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/root/service/auth.service';
import { AuthenticatedResponse } from 'src/root/interfaces/auth_response';
import { RegisterModel } from 'src/root/interfaces/register';
import { RolesEnum } from 'src/root/RolesEnum/rolesEnum';
import { finalize } from 'rxjs';


import { MultilingualComponent } from 'src/root/root/sharedModule/Multilingual/multilingual.component';

@Component({
    selector: 'register-root',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
  })

export class RegisterComponent extends MultilingualComponent implements OnInit {

  Gender = [
    {id: 1, name: "Male"},
    {id: 2, name: "FeMale"},
    {id: 3, name: "Other"}
 ];

    registrationForm!:FormGroup;
    invalidRegister!: boolean;
    isSubmitted: boolean = false;
    user: any = {};
    EMAIL_PATTERN = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
    selectedLanguage: any;
    loadingIcon:boolean = false;

    isConfirmPasswordDirty = false;

    date = new Date();
    credentials: RegisterModel = {email:'', password:'',confirmPassword:'',firstName:'',lastName:'',gender:0,dob: ''};
    private _authService;
    constructor(injector: Injector, private fb: FormBuilder,private router: Router, private http: HttpClient,authService:AuthService) { 
      super(injector);
        this._authService = authService;
    }

    back(): void {
      window.history.back();
  }
    ngOnInit(): void {

      const passwordValidators = [
        Validators.minLength(6),
        Validators.required,
      ];

      this.selectedLanguage = localStorage.getItem("selectedLanguage");
      this.registrationForm = this.fb.group({
        firstName: this.fb.control('', [Validators.required]),
        lastName: this.fb.control('', [Validators.required]),
        email: this.fb.control('',[Validators.required,Validators.pattern(this.EMAIL_PATTERN)]),
        gender: this.fb.control('',[Validators.required]),
        dob: this.fb.control('',[Validators.required]),
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

   omit_special_char(event:any)
   {   
      var k;  
      k = event.charCode;
      return((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57)); 
   }

    get password() { return this.registrationForm.get('password'); }
  get confirmPassword() { return this.registrationForm.get('confirmPassword'); }

    register(){
      this.isSubmitted = true;
      if (!this.registrationForm.valid) {
        return;}

        if(this.matchPassword()){
          return;
        }

        this.loadingIcon = true;
        // var dob = this.registrationForm.get('dob')?.value;
        // const date = new Date(dob + 'UTC');
       
        this.user = this.registrationForm.value;
        // this.user.dob = date;
        this._authService.registerUser(this.user).pipe(finalize(()=> this.loadingIcon = false)).subscribe({
                  next: (response: AuthenticatedResponse) => {
                    this.isSubmitted = false;
                    const token = response.token;
                    localStorage.setItem("jwt", token); 
                    this.invalidRegister = false; 
                    this.router.navigateByUrl("user/auth/login");
                  },
                  error: (err: HttpErrorResponse) => this.invalidRegister = true
                })
        }

  }
