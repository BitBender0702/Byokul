import { ChangeDetectorRef, Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Subject, Subscription, last } from 'rxjs';
import { MultilingualComponent, changeLanguage } from 'src/root/root/sharedModule/Multilingual/multilingual.component';
import { AuthService } from 'src/root/service/auth.service';
import { UserService } from 'src/root/service/user.service';
export const OpenAdminSideBar =new Subject<{isOpenSideBar:boolean}>(); 

@Component({
  selector: 'adminSide-bar',
  templateUrl: 'adminSide-bar.component.html',
  styleUrls: ['adminSide-bar.component.css']
})
export class AdminSideBarComponent extends MultilingualComponent implements OnInit,OnDestroy {
  items!: MenuItem[];
  private _userService;
  private _authService;
  sidebarInfo:any;
  displaySideBar:boolean = false;
  openAdminSideBarSubscription!: Subscription;
  changeLanguageSubscription!: Subscription;


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

    if(!this.openAdminSideBarSubscription){
      this.openAdminSideBarSubscription = OpenAdminSideBar.subscribe(response => {
      this.isOpenSidebar = response.isOpenSideBar;
      });
    }

    if(!this.changeLanguageSubscription){
      this.changeLanguageSubscription = changeLanguage.subscribe(response => {
        this.translate.use(response.language);
      })
    }

    this.chechFromUrl();

  }

  ngOnDestroy(): void {
    if(this.openAdminSideBarSubscription){
      this.openAdminSideBarSubscription.unsubscribe();
    }

    if(this.changeLanguageSubscription){
      this.changeLanguageSubscription.unsubscribe();
    }
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


  selectTab(event?:Event){
    let clickedTab = event?.currentTarget as HTMLElement
    let allTabs = document.querySelectorAll('.routeLink');
    allTabs.forEach(tab => {
      tab.classList.remove('active');
    });
    allTabs[4];
    clickedTab?.classList.add('active')
  }

  chechFromUrl(){
    let allTabs = document.querySelectorAll('.routeLink');
    allTabs.forEach(tab => {
      tab.classList.remove('active');
    });
    let url = window.location.href;
    let lastOccurance = url.lastIndexOf('/');
    let reloadedTab = url.substring(lastOccurance + 1);
    if(reloadedTab == "registeredUsers"){
      allTabs[1].classList.add('active');
    }

    if(reloadedTab == "registeredSchools"){
      allTabs[2].classList.add('active');
    }

    if(reloadedTab == "registeredClasses"){
      allTabs[3].classList.add('active');
    }

    if(reloadedTab == "registeredCourses"){
      allTabs[4].classList.add('active');
    }

    if(reloadedTab == "schoolTransactions"){
      allTabs[5].classList.add('active');
    }

    if(reloadedTab == "classCourseTransactions"){
      allTabs[6].classList.add('active');
    }

    if(reloadedTab == "adminHome"){
      allTabs[0].classList.add('active');
    }
  }
}
