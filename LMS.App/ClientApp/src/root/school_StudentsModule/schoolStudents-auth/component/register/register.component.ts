import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/root/service/auth.service';
import { AuthenticatedResponse } from 'src/root/interfaces/auth_response';
import { RegisterModel } from 'src/root/interfaces/register';
import { RolesEnum } from 'src/root/RolesEnum/rolesEnum';

import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'register-root',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
  })

export class RegisterComponent implements OnInit {

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

    date = new Date();
    credentials: RegisterModel = {email:'', password:'',confirmPassword:'',firstName:'',lastName:'',gender:0,dob: this.date};
    private _authService;
    constructor(private fb: FormBuilder,private router: Router, private http: HttpClient,authService:AuthService,public translate:TranslateService) { 
        this._authService = authService;
        translate.addLangs(['en','es']);
        translate.setDefaultLang('es');
    }

    switchLanguage(lang:string){
      this.translate.use(lang);
    }

    ngOnInit(): void {
      this.registrationForm = this.fb.group({
        firstName: this.fb.control('', [Validators.required]),
        lastName: this.fb.control('', [Validators.required]),
        email: this.fb.control('',[Validators.required,Validators.pattern(this.EMAIL_PATTERN)]),
        gender: this.fb.control(''),
        dob: this.fb.control(''),
        password: this.fb.control('', [Validators.required]),
        confirmPassword: this.fb.control('', [Validators.required]),
      });
    }

    register(){
      debugger;
      this.isSubmitted = true;
      if (!this.registrationForm.valid) {
        return;}
        this.user = this.registrationForm.value;
        this._authService.registerUser(this.user).subscribe({
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
