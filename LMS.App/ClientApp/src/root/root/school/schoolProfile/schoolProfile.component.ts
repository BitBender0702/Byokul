import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SchoolService } from 'src/root/service/school.service';

@Component({
    selector: 'schoolProfile-root',
    templateUrl: './schoolProfile.component.html',
    styleUrls: ['./schoolProfile.component.css']
  })

export class SchoolProfileComponent implements OnInit {

    private _schoolService;
    school:any;
    isProfileGrid:boolean = true;
    isOpenSidebar:boolean = false;


    loadingIcon:boolean = false;

    isDataLoaded:boolean = false;
    // isSchoolFollowed!:boolean;
    constructor(private route: ActivatedRoute,schoolService: SchoolService,private fb: FormBuilder,private router: Router, private http: HttpClient,private activatedRoute: ActivatedRoute) { 
        this._schoolService = schoolService;

    }
  
    ngOnInit(): void {

      this.loadingIcon = true;
      var id = this.route.snapshot.paramMap.get('schoolId');
      var schoolId = id ?? '';
      // this.loadingIcon = true;

      // console.log(
      //   'Activated route data in Component:::',
      //   this.activatedRoute.data
      // );

      // this.activatedRoute.data.subscribe((response: any) => {
      //   console.log('PRODUCT FETCHING', response);
      //   this.school = response.schoolProfile;
      //   console.log('PRODUCT FETCHED');
      // });


      this._schoolService.getSchoolById(schoolId).subscribe((response) => {
        this.school = response;
        this.loadingIcon = false;
        this.isDataLoaded = true;
      });


    }

    followSchool(){
      this._schoolService.saveSchoolFollower(this.school.schoolId).subscribe((response) => {
        debugger;
        console.log(response);
        // here return if not work simply
        // this.school = response;
      });
    }

    back(): void {
      window.history.back();
    }
  
    profileGrid(){
      this.isProfileGrid = true;

    }

    profileList(){
      this.isProfileGrid = false;

    }

    openSidebar(){
      debugger;
      this.isOpenSidebar = true;
  
    }
  
    // login(): void {

    //   if (!this.loginForm.valid) {
    //     return;}
        
    //   this.loadingIcon = true;
    //   this.isSubmitted = true;
    //   this.user = this.loginForm.value;
    //   this._authService.loginUser(this.user).pipe(finalize(()=> this.loadingIcon= false)).subscribe({
    //     next: (response: AuthenticatedResponse) => {
    //     this.isSubmitted = false;
    //     const token = response.token;
    //     localStorage.setItem("jwt", token); 
    //     this.router.navigate(["../../createSchool"],{ relativeTo: this.route });
    //     },
    //   error: (err: HttpErrorResponse) => this.invalidLogin = true
    //   })
    // }
    
  // }
}
