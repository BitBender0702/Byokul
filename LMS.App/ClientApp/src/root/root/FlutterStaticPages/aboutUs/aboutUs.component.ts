import {Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MultilingualComponent } from '../../sharedModule/Multilingual/multilingual.component';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/root/service/auth.service';

@Component({
    selector: 'fileStorage',
    templateUrl: './aboutUs.component.html',
    styleUrls: ['./aboutUs.component.css'],
    providers: [MessageService]
  })

export class AppAboutUsComponent {
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