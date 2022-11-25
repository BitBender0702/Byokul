import { Component, Injector, Input, OnInit } from '@angular/core';
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

  @Input() isOpenSidebar!:boolean;

  constructor(injector: Injector,userService: UserService) {
    super(injector);
    this._userService = userService;
  }

  ngOnInit(): void {

    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this._userService.getSidebarInfo().subscribe((response) => {
      this.sidebarInfo = response;

      console.log(response);
    });

  }

  closeSidebar(){
    this.isOpenSidebar = false;
  }

}
