import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { AdminService } from 'src/root/service/admin/admin.service';
import { RegisteredClasses } from 'src/root/interfaces/admin/registeredClasses';
import { EnableDisableClassCourse } from 'src/root/interfaces/admin/enableDisableClassCourse';
import { Table } from 'primeng/table';
import { AuthService } from 'src/root/service/auth.service';

@Component({
  selector: 'registered-classes',
  templateUrl: './registeredClasses.component.html',
  styleUrls: ['registeredClasses.component.css'],
})
export class RegisteredClassesComponent implements OnInit {

  private _adminService;
  private _authService;
  isSubmitted: boolean = false;
  registeredClasses!:RegisteredClasses[];
  selectedClasses!: RegisteredClasses[];
  enableDisableClass!: EnableDisableClassCourse;
  loadingIcon:boolean = false;
  isDataLoaded:boolean = false;
  cloned!:any;
  @ViewChild('dt') table!: Table;

  
  constructor(private fb: FormBuilder,private http: HttpClient,adminService: AdminService,authService: AuthService) {
    this._adminService = adminService;
    this._authService = authService;
  }

  ngOnInit(): void {
    this.loadingIcon = true;
        this._adminService.getRegClasses().subscribe((response) => {
          this.registeredClasses = response;
          this.cloned = response.slice(0);
          this.loadingIcon = false;
          this.isDataLoaded = true;
        });  

        this.InitializeEnableDisableClass();
      }

      InitializeEnableDisableClass(){
        this.enableDisableClass = {
            Id: '',
            isDisable: false
           };
      }

      getDisableClassDetails(classId:string,from:string){
        this.enableDisableClass.Id = classId;
        if(from == "Enable"){
          this.enableDisableClass.isDisable = true;
        }
        else{
          this.enableDisableClass.isDisable = false;

        }
      }

      disableClass(){
        this.loadingIcon = true;
        this._adminService.enableDisableClass(this.enableDisableClass).subscribe((response) => {
          this.InitializeEnableDisableClass();
          this.ngOnInit();
        });  

      }
     
      viewClassProfile(classId:string){
        window.location.href=`user/classProfile/${classId}`;

      }

      search(event: any) {
        this.table.filterGlobal(event.target.value, 'contains');
      }

      resetSorting(): void {
        this.table.reset();
        this.registeredClasses = this.cloned.slice(0);
      }
    }
    
  


   

