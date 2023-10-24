import {Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MultilingualComponent } from '../../sharedModule/Multilingual/multilingual.component';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/root/service/auth.service';

@Component({
    selector: 'fileStorage',
    templateUrl: './dsaForSchool.component.html',
    styleUrls: ['./dsaForSchool.component.css'],
    providers: [MessageService]
  })

export class AppDsaForSchoolComponent {
  language:string = "";
  private _authService;
   constructor(private activatedRoute: ActivatedRoute, authService:AuthService) {   
    this._authService = authService;
  }
  ngOnInit(): void {
  this._authService.loginAdminState$.next(false);
  this._authService.loginState$.next(false);
  this.language = this.activatedRoute.snapshot.paramMap.get('lang')??'';
  }

    back(): void {
       window.history.back();
    }
}