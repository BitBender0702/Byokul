import { Component, Injector, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MultilingualComponent } from 'src/root/root/sharedModule/Multilingual/multilingual.component';
import { UserService } from 'src/root/service/user.service';

@Component({
  selector: 'adminSide-bar',
  templateUrl: 'adminSide-bar.component.html',
  styleUrls: ['adminSide-bar.component.css']
})
export class AdminSideBarComponent extends MultilingualComponent implements OnInit {
  items!: MenuItem[];
  private _userService;
  sidebarInfo:any;

  @Input() isOpenSidebar!:boolean;

  constructor(injector: Injector,userService: UserService,private router: Router) {
    super(injector);
    this._userService = userService;
  }

  ngOnInit(): void {

    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this._userService.getSidebarInfo().subscribe((response) => {
      this.sidebarInfo = response;
    });

  }

  closeSidebar(){
    this.isOpenSidebar = false;
  }

  getRegisteredUsers(){
    window.location.href=`admin/registeredUsers`;
  }

  getSelectedClass(classId:any){
    window.location.href=`user/classProfile/${classId}`;
  }

  getUserDetails(userId:string){
    window.location.href=`user/userProfile/${userId}`;
  }

}
