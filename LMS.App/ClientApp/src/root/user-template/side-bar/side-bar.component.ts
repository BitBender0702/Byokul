import { Component, Injector, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MultilingualComponent } from 'src/root/root/sharedModule/Multilingual/multilingual.component';
import { UserService } from 'src/root/service/user.service';

@Component({
  selector: 'side-bar',
  templateUrl: 'side-bar.component.html',
  styleUrls: ['side-bar.component.css']
})
export class SideBarComponent extends MultilingualComponent implements OnInit {
  items!: MenuItem[];
  private _userService;
  sidebarInfo:any;
  validUser!:Boolean;

  @Input() isOpenSidebar!:boolean;

  constructor(injector: Injector,userService: UserService,private router: Router) {
    super(injector);
    this._userService = userService;
  }

  ngOnInit(): void {

      var validToken = localStorage.getItem("jwt");
        if (validToken != null) {
          this.validUser = true;
        }
        else{
        this.validUser = false;
        }
        
    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this._userService.getSidebarInfo().subscribe((response) => {
      this.sidebarInfo = response;
    });

  }

  closeSidebar(){
    this.isOpenSidebar = false;
  }

  getSelectedSchool(schoolId:any){
    window.location.href=`user/schoolProfile/${schoolId}`;
  }

  getSelectedClass(classId:any){
    window.location.href=`user/classProfile/${classId}`;
  }

  getSelectedCourse(courseId:any){
    window.location.href=`user/courseProfile/${courseId}`;
  }

  getUserDetails(userId:string){
    window.location.href=`user/userProfile/${userId}`;
  }
}
