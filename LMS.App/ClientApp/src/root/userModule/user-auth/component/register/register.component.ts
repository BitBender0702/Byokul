import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/root/service/auth.service';
import { AuthenticatedResponse } from 'src/root/interfaces/auth_response';
import { RegisterModel } from 'src/root/interfaces/register';
import { RolesEnum } from 'src/root/RolesEnum/rolesEnum';
import { BehaviorSubject, finalize, Subject } from 'rxjs';


import { MultilingualComponent } from 'src/root/root/sharedModule/Multilingual/multilingual.component';
import { UserService } from 'src/root/service/user.service';

export const registrationResponse =new BehaviorSubject <boolean>(false);  


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
    isRegister!:boolean;
    currentDate!:string;
    countries!:any;
    cities!:any;
    isDataLoaded:boolean = false;

    date = new Date();
    credentials: RegisterModel = {email:'', password:'',confirmPassword:'',firstName:'',lastName:'',gender:0,dob: ''};
    private _authService;
    private _userService;
    constructor(injector: Injector, private fb: FormBuilder,private router: Router, private http: HttpClient,authService:AuthService,userService:UserService,private cd: ChangeDetectorRef) { 
      super(injector);
        this._authService = authService;
        this._userService = userService;
    }

    back(): void {
      window.history.back();
  }
    ngOnInit(): void {
      this.loadingIcon = true;
      this._authService.loginState$.next(false);
      const passwordValidators = [
        Validators.minLength(6),
        Validators.required,
      ];

      this._userService.getCountryList().subscribe((response) => {
        this.countries = response;
        this.isDataLoaded = true;
        this.loadingIcon = false;
      });

      this.currentDate = this.getCurrentDate();
      this.selectedLanguage = localStorage.getItem("selectedLanguage");
      this.registrationForm = this.fb.group({
        firstName: this.fb.control('', [Validators.required]),
        lastName: this.fb.control('', [Validators.required]),
        email: this.fb.control('',[Validators.required,Validators.pattern(this.EMAIL_PATTERN)]),
        gender: this.fb.control('',[Validators.required]),
        dob: this.fb.control('',[Validators.required]),
        password: this.fb.control('', [...passwordValidators]),
        confirmPassword: this.fb.control('', [...passwordValidators]),
        countryId: this.fb.control('', [Validators.required]),
        cityId: this.fb.control('', [Validators.required]),
      }, {validator: this.dateLessThan('dob',this.currentDate)});
    }

    getCurrentDate(){
      var today = new Date();
        var dd = String(today. getDate()). padStart(2, '0');
        var mm = String(today. getMonth() + 1). padStart(2, '0');
        var yyyy = today. getFullYear();
      ​  var currentDate = yyyy + '-' + mm + '-' + dd;
        return currentDate;
      }

      dateLessThan(from: string, currentDate:string) {
        return (group: FormGroup): {[key: string]: any} => {
         let f = group.controls[from];
         if(f.value ==""){
          return {};

         }
         if (f.value > currentDate || f.value < "1960-12-31") {
           return {
             dates: `Please enter valid date`
           };
         }
         return {};
        }
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
      this.user = this.registrationForm.value;
      this.isRegister = false;
      this.isSubmitted = true;
      if (!this.registrationForm.valid) {
        return;}

        if(this.matchPassword()){
          return;
        }

        this.loadingIcon = true;
        this.user = this.registrationForm.value;
        this._authService.registerUser(this.user).pipe(finalize(()=> this.loadingIcon = false)).subscribe({
                  next: (response: AuthenticatedResponse) => {
                    if(response.token == ""){
                      this.registrationForm.setErrors({ unauthenticated: true });
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
                  error: (err: HttpErrorResponse) => this.invalidRegister = true
                })
      }

      getCityByCountry(event:any){
        var countryId = event.value;
        this._userService.getCityList(countryId).subscribe((response) => {
          this.cities = response;
        });


      }

  }
