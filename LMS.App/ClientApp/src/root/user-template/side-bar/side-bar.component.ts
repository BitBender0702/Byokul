import { Component, Injector, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MultilingualComponent } from 'src/root/root/sharedModule/Multilingual/multilingual.component';
import { userImageResponse } from 'src/root/root/user/userProfile/userProfile.component';
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
  loadingIcon:boolean = false;
  isDataLoaded:boolean = false;

  @Input() isOpenSidebar!:boolean;

  constructor(injector: Injector,userService: UserService,private router: Router) {
    super(injector);
    this._userService = userService;
  }

  ngOnInit(): void {
    this.loadingIcon = true;
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
      this.loadingIcon = false;
      this.isDataLoaded = true;
    });

    userImageResponse.subscribe(response => {
      
      this.sidebarInfo.user.avatar = response.userAvatar;
      // this.ngOnInit();
    });

  }

  closeSidebar(){
    this.isOpenSidebar = false;
  }

  getSelectedSchool(schoolName:string){
    // window.location.href=`user/schoolProfile/${schoolId}`;
    window.location.href=`profile/school/${schoolName.replace(" ","").toLowerCase()}`;

  }

  getSelectedClass(className:string,schoolName:string){
    
    window.location.href=`profile/class/${schoolName.replace(" ","").toLowerCase()}/${className.replace(" ","").toLowerCase()}`;
  }

  getSelectedCourse(courseName:string,schoolName:string){
    
    // window.location.href=`user/courseProfile/${courseId}`;
    window.location.href=`profile/course/${schoolName.replace(" ","").toLowerCase()}/${courseName.replace(" ","").toLowerCase()}`;

  }

  getUserDetails(userId:string){
    window.location.href=`user/userProfile/${userId}`;
  }
}
