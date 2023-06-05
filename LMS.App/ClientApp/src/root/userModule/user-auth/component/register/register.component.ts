import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/root/service/auth.service';
import { AuthenticatedResponse } from 'src/root/interfaces/auth_response';
import { RegisterModel } from 'src/root/interfaces/register';
import { RolesEnum } from 'src/root/RolesEnum/rolesEnum';
import { BehaviorSubject, finalize, Subject } from 'rxjs';


import { MultilingualComponent } from 'src/root/root/sharedModule/Multilingual/multilingual.component';
import { UserService } from 'src/root/service/user.service';
import { Country, State, City } from 'country-state-city';
import flatpickr from 'flatpickr';
import { Turkish } from 'flatpickr/dist/l10n/tr';
import { Arabic } from 'flatpickr/dist/l10n/ar';
import { Spanish } from 'flatpickr/dist/l10n/es';
import 'flatpickr/dist/flatpickr.min.css';




export const registrationResponse =new BehaviorSubject <boolean>(false);  


@Component({
    selector: 'register-root',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
  })

export class RegisterComponent extends MultilingualComponent implements OnInit,AfterViewInit {
  Gender = [
    {id: 1, name: "Male"},
    {id: 2, name: "FeMale"},
    {id: 3, name: "Other"}
 ];

    registrationForm!:FormGroup;
    invalidRegister!: boolean;
    isSubmitted: boolean = false;
    user: any = {};
    //EMAIL_PATTERN = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
    // EMAIL_PATTERN = '^[a-zA-Z0-9\.a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z]{2,3}$';
    EMAIL_PATTERN = '[a-zA-Z0-9]+?(\\.[a-zA-Z0-9]+)*@[a-zA-Z]+\\.[a-zA-Z]{2,3}';

    // PASSWORD_PATTERN = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]+$';
    PASSWORD_PATTERN = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=[\\]{};:\'\"\\|,.<>/?])[A-Za-z\\d!@#$%^&*()_+\\-=[\\]{};:\'\"\\|,.<>/?]+$';

    selectedLanguage: any;
    loadingIcon:boolean = false;

    isConfirmPasswordDirty = false;
    isRegister!:boolean;
    currentDate!:string;
    countries!:any;
    cities!:any;
    isDataLoaded:boolean = false;
    isPasswordVisible:boolean=false;
    isConfirmPasswordVisible:boolean = false;
    @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;
    @ViewChild('confirmPasswordInput') confirmPasswordInput!: ElementRef<HTMLInputElement>;
    @ViewChild('dateOfBirth') dateOfBirthRef!: ElementRef;


    date = new Date();
    credentials: RegisterModel = {email:'', password:'',confirmPassword:'',firstName:'',lastName:'',gender:0,dob: ''};
    private _authService;
    private _userService;
    constructor(injector: Injector, private fb: FormBuilder,private router: Router, private http: HttpClient,authService:AuthService,userService:UserService,private cd: ChangeDetectorRef) { 
      super(injector);
        this._authService = authService;
        this._userService = userService;
    }

    ngAfterViewInit() {
      // debugger
      // this.cd.detectChanges();
      // const options = {
      //   locale: Turkish, // Set the Turkish language for the calendar
      //   dateFormat: 'Y-m-d', // Customize the date format if needed
      // };
      // flatpickr(this.licenceDateInput.nativeElement, options);
    }

    ngOnInit(): void {
      this.loadingIcon = true;
      this._authService.loginState$.next(false);
      const passwordValidators = [
        Validators.minLength(6),
        Validators.required,
        Validators.pattern(this.PASSWORD_PATTERN)
      ];
      this._userService.getCountryList().subscribe((response) => {
        debugger
        this.countries = response;
        this.isDataLoaded = true;
        this.loadingIcon = false;
        this.cd.detectChanges();
        var selectedLanguage = localStorage.getItem("selectedLanguage");
        this.translate.use(selectedLanguage ?? '');
        // if(selectedLanguage == "en"){
        //   var locale = null;
        // }
        // if(selectedLanguage == "ar"){
        //   var locale = Arabic;
        // }
        const currentDate = new Date().toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric'
        });

        flatpickr('#date_of_birth',{
          minDate:"1903-12-31",
          maxDate:this.registrationForm.controls.dob.value,
          dateFormat: "m/d/Y",
          defaultDate: currentDate
        });
      });

      const currentDate = new Date().toISOString().substring(0, 10);
      const formattedDate = currentDate.split('/').reverse().join('/');
      this.currentDate = this.getCurrentDate();
      this.selectedLanguage = localStorage.getItem("selectedLanguage");
      this.registrationForm = this.fb.group({
        firstName: this.fb.control('', [Validators.required]),
        lastName: this.fb.control('', [Validators.required]),
        email: this.fb.control('',[Validators.required,Validators.pattern(this.EMAIL_PATTERN)]),
        gender: this.fb.control('',[Validators.required]),
        dob: this.fb.control(formattedDate,[Validators.required]),
        password: this.fb.control('', [...passwordValidators]),
        confirmPassword: this.fb.control('', [...passwordValidators]),
        countryName: this.fb.control('', [Validators.required]),
        cityName: this.fb.control('', [Validators.required]),
      }
      // , {validator: this.dateLessThan('dob',this.currentDate)}
      );
    }

    getCurrentDate(){
      var today = new Date();
        var dd = String(today. getDate()). padStart(2, '0');
        var mm = String(today. getMonth() + 1). padStart(2, '0');
        var yyyy = today. getFullYear();
      ​  var currentDate = yyyy + '-' + mm + '-' + dd;
        return currentDate;
      }

      onPasswordShow(){
        this.isPasswordVisible=true;
      }
    
      onPasswordHide(){
        this.isPasswordVisible=false;
      }

      onConfirmPasswordShow(){
        this.isConfirmPasswordVisible=true;
      }
    
      onConfirmPasswordHide(){
        this.isConfirmPasswordVisible=false;
      }

      // dateLessThan(from: string, currentDate:string) {
      //   return (group: FormGroup): {[key: string]: any} => {
      //    let f = group.controls[from];
      //    if(f.value ==""){
      //     return {};

      //    }
      //    if (f.value > currentDate || f.value < "1903-12-31") {
      //      return {
      //        dates: `Please enter valid date`
      //      };
      //    }
      //    return {};
      //   }
      // }

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
      return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32) && !(k >= 48 && k <= 57);
    }

  get password() { return this.registrationForm.get('password'); }
  get confirmPassword() { return this.registrationForm.get('confirmPassword'); }

    register(){
      debugger
      this.user = this.registrationForm.value;

      const str = "example-string";
      const containsHyphen = str.includes("-");

      if(!this.user.dob.includes("-")){
       const dateParts = this.user.dob.split('/');
       const year = parseInt(dateParts[2]);
       const month = parseInt(dateParts[0]) - 1;
       const day = parseInt(dateParts[1]);
       const date = new Date(year, month, day);
       const convertedDateString = date.toISOString().substring(0, 10);
       this.user.dob = convertedDateString;
     }
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
        var countryName = event.value;
        this._userService.getCityList(countryName).subscribe((response) => {
          this.cities = response;
        });
      }

      getSelectedLanguage(){
        var selectedLanguage = localStorage.getItem("selectedLanguage");
        this.translate.use(selectedLanguage ?? '');
        var locale = selectedLanguage == "ar" ? Arabic: selectedLanguage == "sp"? Spanish : selectedLanguage == "tr"? Turkish : null
        const dateOfBirthElement = this.dateOfBirthRef.nativeElement;
        dateOfBirthElement._flatpickr.set("locale", locale); 
      }
  }
