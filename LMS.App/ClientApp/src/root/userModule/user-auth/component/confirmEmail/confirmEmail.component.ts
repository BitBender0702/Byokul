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
  
    this._authService.confirmEmail(this.token,this.email).subscribe((response) => {
       if(response.success){
        this.router.navigate(['../login'], { relativeTo: this.route,queryParams: { confirmedEmail: true } });
        setTimeout(() => {
          confirmEmailResponse.next(this.email); 
        }, 500);
       }
       else{ 
        this.isDataLoaded = true;
       }
      });
  }

}
