import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { SetPasswordViewModel } from 'src/root/interfaces/set-password';
import { MultilingualComponent } from 'src/root/root/sharedModule/Multilingual/multilingual.component';
import { AuthService } from 'src/root/service/auth.service';

export const confirmEmailResponse =new Subject<{confirmEmail : string}>();  


@Component({
  selector: 'logout',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.css']
})
export class SetPasswordComponent extends MultilingualComponent implements OnInit {
private _authService;
setPasswordForm!:FormGroup;
isSubmitted: boolean = false;
isDataLoaded:boolean = false;
loadingIcon:boolean = false;
setPasswordViewModel!:SetPasswordViewModel;
    tokenParm$: any;
    email!:string;
  constructor(injector: Injector,private route:ActivatedRoute,
     protected router: Router,authService:AuthService,private fb: FormBuilder) {
        super(injector);
        this._authService = authService;
      }

  ngOnInit(): void {
    this._authService.loginState$.next(false);
    const passwordValidators = [
        Validators.minLength(6),
        Validators.required,
      ];

      this.setPasswordForm = this.fb.group({
        newPassword: this.fb.control('', [...passwordValidators]),
        confirmPassword: this.fb.control('', [...passwordValidators])
      });

    this.initializeSetPasswordViewModel();
    this.tokenParm$ = this.route.queryParams
    .subscribe(params => {
      this.email = params.email;
    }
   );
  }

  get newPassword() { return this.setPasswordForm.get('newPassword'); }
  get confirmPassword() { return this.setPasswordForm.get('confirmPassword'); }

  matchPassword(){
    if(this.newPassword?.value!=this.confirmPassword?.value){
      return true;
    }
    else 
    return false
  }

  setPassword(){
    this.setPasswordViewModel.newPassword =this.setPasswordForm.get("newPassword")?.value;  
    this.setPasswordViewModel.confirmPassword =this.setPasswordForm.get("confirmPassword")?.value;  
    this.setPasswordViewModel.email = this.email;
    this._authService.setPassword(this.setPasswordViewModel).subscribe((response) => {
       if(response.result == "Success"){
        this.router.navigate(['../login'], { relativeTo: this.route });
       }
      });
  }

  initializeSetPasswordViewModel(){
    this.setPasswordViewModel = {
        newPassword:'',
        confirmPassword:'',
        email:''
    }
  }

}
