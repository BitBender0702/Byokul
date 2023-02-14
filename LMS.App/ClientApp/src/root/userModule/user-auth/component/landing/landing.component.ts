import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from 'src/root/service/auth.service';
import { AuthenticatedResponse } from 'src/root/interfaces/auth_response';
import { MultilingualComponent } from 'src/root/root/sharedModule/Multilingual/multilingual.component';
import { finalize } from 'rxjs';

@Component({
    selector: 'landing-root',
    templateUrl: './landing.component.html',
    styleUrls: []
  })

export class LandingComponent implements OnInit {
  private _authService;
    constructor(authService:AuthService) { 
      this._authService = authService;
    }
  
    ngOnInit(): void {
      this._authService.loginState$.next(false);
    }

  }
