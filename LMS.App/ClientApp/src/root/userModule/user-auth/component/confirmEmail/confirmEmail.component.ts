import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { AuthService } from 'src/root/service/auth.service';

export const confirmEmailResponse =new BehaviorSubject <string>('');  


@Component({
  selector: 'logout',
  templateUrl: './confirmEmail.component.html',
  styleUrls: ['./confirmEmail.component.css']
})
export class ConfirmEmailComponent implements OnInit {
private _authService;
isDataLoaded:boolean = false;
loadingIcon:boolean = false;
    tokenParm$: any;
    token!:string;
    email!:string;
  constructor(private route:ActivatedRoute,
     protected router: Router,authService:AuthService) {
        this._authService = authService;
      }

  ngOnInit(): void {
    this.loadingIcon = true;
    this.tokenParm$ = this.route.queryParams
    .subscribe(params => {
      this.token = params.token;
      this.email = params.email;
    }
  );
  
    // var token = this.route.snapshot.paramMap.get('token')??'';
    // var email = this.route.snapshot.paramMap.get('email')??'';
    this._authService.confirmEmail(this.token,this.email).subscribe((response) => {
      debugger
       if(response.result == "success"){
        // confirmEmailResponse.next({confirmEmail: "confirm"});
        this.router.navigate(['../login'], { relativeTo: this.route });
        confirmEmailResponse.next(this.email); 
       }
       else{ 
        this.isDataLoaded = true;
       }
      });
    // localStorage.removeItem("jwt");
    // this.router.navigate(['../login'], { relativeTo: this.route });
  }

}
