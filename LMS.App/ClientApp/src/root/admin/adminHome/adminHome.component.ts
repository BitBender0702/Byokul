import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { HttpClient, HttpEventType, HttpHeaders } from "@angular/common/http";
import {MenuItem} from 'primeng/api';
import { AdminService } from 'src/root/service/admin/admin.service';

@Component({
  selector: 'adminHome-class',
  templateUrl: './adminHome.component.html',
  styleUrls: ['adminHome.component.css'],
})
export class AdminHomeComponent implements OnInit {

  private _adminService;
  isSubmitted: boolean = false;

  dashboardDetails:any;
  loadingIcon:boolean = false;
  isDataLoaded:boolean = false;

  
  constructor(private fb: FormBuilder,private http: HttpClient,adminService: AdminService) {
    this._adminService = adminService;
  }

  ngOnInit(): void {
    this.loadingIcon = true;
    this._adminService.getDashboardDetails().subscribe((response) => {
      this.dashboardDetails = response;
      this.loadingIcon = false;
      this.isDataLoaded = true;
    });  
     
    }
    
  }


   

