import { ChangeDetectorRef, Component, Injector, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MultilingualComponent } from 'src/root/root/sharedModule/Multilingual/multilingual.component';
import { AuthService } from 'src/root/service/auth.service';
import { UserService } from 'src/root/service/user.service';

@Component({
  selector: 'adminSide-bar',
  templateUrl: 'adminSide-bar.component.html',
  styleUrls: ['adminSide-bar.component.css']
})
export class AdminSideBarComponent extends MultilingualComponent implements OnInit {
  items!: MenuItem[];
  private _userService;
  private _authService;
  sidebarInfo:any;
  displaySideBar:boolean = false;

  @Input() isOpenSidebar!:boolean;

  constructor(injector: Injector,userService: UserService,authService: AuthService,private router: Router,private cd: ChangeDetectorRef) {
    super(injector);
    this._userService = userService;
    this._authService = authService;
  }

  ngOnInit(): void {
    this._authService.loginState$.next(false);
    this.cd.detectChanges();
    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this.translate.use(this.selectedLanguage ?? '');
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
