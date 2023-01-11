import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AddCourseCertificate } from 'src/root/interfaces/course/addCourseCertificate';
import { AddCourseLanguage } from 'src/root/interfaces/course/addCourseLanguage';
import { AddCourseTeacher } from 'src/root/interfaces/course/addCourseTeacher';
import { DeleteCourseCertificate } from 'src/root/interfaces/course/deleteCourseCertificate';
import { DeleteCourseLanguage } from 'src/root/interfaces/course/deleteCourseLanguage';
import { DeleteCourseTeacher } from 'src/root/interfaces/course/deleteCourseTeacher';
import { CourseService } from 'src/root/service/course.service';
import { PostService } from 'src/root/service/post.service';
import { CreatePostComponent } from '../../createPost/createPost.component';
import { PostViewComponent } from '../../postView/postView.component';
import { MultilingualComponent } from '../../sharedModule/Multilingual/multilingual.component';

@Component({
    selector: 'courseProfile-root',
    templateUrl: './courseProfile.component.html',
    styleUrls: ['./courseProfile.component.css']
  })

export class CourseProfileComponent extends MultilingualComponent implements OnInit {

    private _courseService;
    private _postService;
    course:any;
    isProfileGrid:boolean = true;
    // isOpenSidebar:boolean = false;
    // isOpenModal:boolean = false;
    loadingIcon:boolean = false;
    courseId!:string;
    isOwner!:boolean;
    isOpenSidebar:boolean = false;
    isOpenModal:boolean = false;
    isSubmitted: boolean = false;
    courseLanguage!:AddCourseLanguage;
    courseTeacher!:AddCourseTeacher;
    deleteLanguage!: DeleteCourseLanguage;
    deleteTeacher!: DeleteCourseTeacher;
    editCourseForm!:FormGroup;
    languageForm!:FormGroup;
    teacherForm!:FormGroup;
    certificateForm!:FormGroup;
    uploadImage!:any;
    updateCourseDetails!:any;
    accessibility:any;
    filteredLanguages!: any[];
    languages:any;
    filteredTeachers!: any[];
    teachers:any;
    deleteCertificate!: DeleteCourseCertificate;
    courseCertificate!:AddCourseCertificate;
    certificateToUpload = new FormData();
    fileToUpload= new FormData();
    isCoursePaid!:boolean;
    disabled:boolean = true;
    validToken!:string;

    @ViewChild('closeEditModal') closeEditModal!: ElementRef;
    @ViewChild('closeTeacherModal') closeTeacherModal!: ElementRef;
    @ViewChild('closeLanguageModal') closeLanguageModal!: ElementRef;
    @ViewChild('closeCertificateModal') closeCertificateModal!: ElementRef;
    @ViewChild('imageFile') imageFile!: ElementRef;

    @ViewChild('createPostModal', { static: true }) createPostModal!: CreatePostComponent;

    isDataLoaded:boolean = false;
    constructor(injector: Injector,postService:PostService,private bsModalService: BsModalService,courseService: CourseService,private route: ActivatedRoute,private domSanitizer: DomSanitizer,private fb: FormBuilder,private router: Router, private http: HttpClient,private activatedRoute: ActivatedRoute) { 
      super(injector);
        this._courseService = courseService;
         this._postService = postService;
    }
  
    ngOnInit(): void {
      this.validToken = localStorage.getItem("jwt")?? '';
      this.loadingIcon = true;
      var selectedLang = localStorage.getItem("selectedLanguage");
      this.translate.use(selectedLang?? '');

      var id = this.route.snapshot.paramMap.get('courseId');
      this.courseId = id ?? '';

      var courseName = this.route.snapshot.paramMap.get('courseName');
      var schoolName = this.route.snapshot.paramMap.get('schoolName');

      if(this.courseId == ''){
        this._courseService.getCourseByName(courseName,schoolName).subscribe((response) => {
          this.courseId = response.courseId;
          this._courseService.getCourseById(this.courseId).subscribe((response) => {
            this.course = response;
            this.isOwnerOrNot();
            this.loadingIcon = false;
            this.isDataLoaded = true;
          });
        })

      }
      else{
      this._courseService.getCourseById(this.courseId).subscribe((response) => {
        this.course = response;
        this.isOwnerOrNot();
        this.loadingIcon = false;
        this.isDataLoaded = true;
      });
    }

      this.editCourseForm = this.fb.group({
        schoolName: this.fb.control(''),
        courseName: this.fb.control(''),
        serviceTypeId:this.fb.control(''),
        accessibilityId: this.fb.control(''),
        description: this.fb.control(''),
        price: this.fb.control(''),
        languageIds:this.fb.control(''),

      });

       this._courseService.getAccessibility().subscribe((response) => {
        this.accessibility = response;
      });
  
      this._courseService.getLanguageList().subscribe((response) => {
        this.languages = response;
      });

      this._courseService.getAllTeachers().subscribe((response) => {
        this.teachers = response;
      });

      this.languageForm = this.fb.group({
        languages:this.fb.control([],[Validators.required]),
      });

      this.teacherForm = this.fb.group({
        teachers:this.fb.control([],[Validators.required]),
      });

      this.certificateForm = this.fb.group({
        certificates:this.fb.control([],[Validators.required]),
      });

      this.deleteLanguage = {
        courseId: '',
        languageId: ''
       };

       this.deleteTeacher = {
        courseId: '',
        teacherId: ''
       };
      
      this.courseLanguage = {
        courseId: '',
        languageIds: []
       };

       this.courseTeacher = {
        courseId: '',
        teacherIds: []
       };

       this.deleteCertificate = {
        courseId:'',
        certificateId:''
       }

       
       this.courseCertificate = {
        courseId:'',
        certificates:[]
       }

//     }

//     getClassDetails(classId:string){
//       this._classService.getClassEditDetails(classId).subscribe((response) => {
//         this.editClass = response;
//         this.initializeEditFormControls();
//     })
    
//   }
    }

  isOwnerOrNot(){
    var validToken = localStorage.getItem("jwt");
      if (validToken != null) {
        let jwtData = validToken.split('.')[1]
        let decodedJwtJsonData = window.atob(jwtData)
        let decodedJwtData = JSON.parse(decodedJwtJsonData);
        if(decodedJwtData.sub == this.course.createdBy){
          this.isOwner = true;
        }
        else{
          this.isOwner = false;
        }

      }
      
  }
  

    initializeEditFormControls(){
      this.uploadImage = '';
      this.imageFile.nativeElement.value = "";
      this.fileToUpload.set('avatarImage','');

      var selectedLanguages:string[] = [];

      this.course.languages.forEach((item: { id: string; }) => {
        selectedLanguages.push(item.id)
      });

      this.editCourseForm = this.fb.group({
        schoolName: this.fb.control(this.course.school.schoolName),
        courseName: this.fb.control(this.course.courseName,[Validators.required]),
        accessibilityId: this.fb.control(this.course.accessibilityId,[Validators.required]),
        price: this.fb.control(this.course.price),
        description: this.fb.control(this.course.description),
        languageIds:this.fb.control(selectedLanguages,[Validators.required]),
        serviceTypeId:this.fb.control(this.course.serviceTypeId,[Validators.required])

      });

      if(this.course.serviceTypeId == '0d846894-caa4-42f3-8e8a-9dba6467672b'){
        this.getPaidCourse();

      }
      this.editCourseForm.updateValueAndValidity();
    }

    // dateLessThan(from: string, to: string, currentDate:string) {
    //   return (group: FormGroup): {[key: string]: any} => {
    //    let f = group.controls[from];
    //    let t = group.controls[to];
    //    if (f.value > t.value || f.value < currentDate) {
    //      return {
    //        dates: `Please enter valid date`
    //      };
    //    }
    //    return {};
    //   }
    // }

    // getCurrentDate(){
    //   var today = new Date();
    //     var dd = String(today. getDate()). padStart(2, '0');
    //     var mm = String(today. getMonth() + 1). padStart(2, '0');
    //     var yyyy = today. getFullYear();
    //   ​  var currentDate = yyyy + '-' + mm + '-' + dd;
    //     return currentDate;
    //   }

    getDeletedLanguage(deletedLanguage:string){
      this.deleteLanguage.languageId = deletedLanguage;
    }

    getDeletedTeacher(deletedTeacher:string){
      this.deleteTeacher.teacherId = deletedTeacher;
    }

    captureLanguageId(event: any) {
      var languageId = event.id;
      this.courseLanguage.languageIds.push(languageId);
      // this.languageIds.push(languageId);
    }

    filterLanguages(event:any) {
  
      var courseLanguages: any[] = this.course.languages;
      var languages: any[] = this.languages;
  
      this.languages = languages.filter(x => !courseLanguages.find(y => y.id == x.id));
      
      let filtered: any[] = [];
      let query = event.query;
      for (let i = 0; i < this.languages.length; i++) {
        let language = this.languages[i];
        if (language.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
          filtered.push(language);
        }
      }

  
      this.filteredLanguages = filtered;
    }

    saveCourseLanguages(){
      this.isSubmitted = true;
      if (!this.languageForm.valid) {
        return;
      }
      this.loadingIcon = true;
      this.courseLanguage.courseId = this.course.courseId;
      this._courseService.saveCourseLanguages(this.courseLanguage).subscribe((response:any) => {
        this.closeLanguagesModal();
        this.isSubmitted = false;
        this.ngOnInit();
  
      });
    }

    deleteCourseLanguage(){
      this.loadingIcon = true;
      this.deleteLanguage.courseId = this.course.courseId;
      this._courseService.deleteCourseLanguage(this.deleteLanguage).subscribe((respteachersonse:any) => {
        this.ngOnInit();
  
      });
  
    }

    captureTeacherId(event: any) {
      var teacherId = event.teacherId;
      this.courseTeacher.teacherIds.push(teacherId);
    }

    filterTeachers(event:any) {
          var courseTeachers: any[] = this.course.teachers;
          var teachers: any[] = this.teachers;
      
          this.teachers = teachers.filter(x => !courseTeachers.find(y => y.teacherId == x.teacherId));
      
          let filteredTeachers: any[] = [];
          let query = event.query;
          for (let i = 0; i < this.teachers.length; i++) {
            let teacher = this.teachers[i];
            if (teacher.firstName.toLowerCase().indexOf(query.toLowerCase()) == 0) {
              filteredTeachers.push(teacher);
            }
          }
          this.filteredTeachers = filteredTeachers;
        }

        saveCourseTeachers(){
          this.isSubmitted = true;
          if (!this.teacherForm.valid) {
            return;
          }
          this.loadingIcon = true;
          this.courseTeacher.courseId = this.course.courseId;
          this._courseService.saveCourseTeachers(this.courseTeacher).subscribe((response:any) => {
            this.closeTeachersModal();
            this.isSubmitted = false;
            this.ngOnInit();
      
          });
        }

        deleteCourseTeacher(){
          this.loadingIcon = true;
          this.deleteTeacher.courseId = this.course.courseId;
          this._courseService.deleteCourseTeacher(this.deleteTeacher).subscribe((response:any) => {
            this.ngOnInit();
      
          });
      
        }

        getDeletedCertificate(deletedCertificate:string){
          this.deleteCertificate.certificateId = deletedCertificate;
        }

        deleteCourseCertificate(){
          this.loadingIcon = true;
          this.deleteCertificate.courseId = this.course.courseId;
          this._courseService.deleteCourseCertificate(this.deleteCertificate).subscribe((response:any) => {
            this.ngOnInit();
      
          });
      
        }

        handleImageInput(event: any) {
          this.fileToUpload.append("avatarImage", event.target.files[0], event.target.files[0].name);
          const reader = new FileReader();
          reader.onload = (_event) => { 
              this.uploadImage = _event.target?.result; 
              this.uploadImage = this.domSanitizer.bypassSecurityTrustUrl(this.uploadImage);
          }
          reader.readAsDataURL(event.target.files[0]); 
      
        }

        handleCertificates(event: any) {
            this.courseCertificate.certificates.push(event.target.files[0]);
        }

        saveCourseCertificates(){
          this.isSubmitted = true;
          if (!this.certificateForm.valid) {
            return;
          }
          this.loadingIcon = true;
          for(var i=0; i<this.courseCertificate.certificates.length; i++){
            this.certificateToUpload.append('certificates', this.courseCertificate.certificates[i]);
         }
          this.certificateToUpload.append('courseId', this.course.courseId);
          this._courseService.saveCourseCertificates(this.certificateToUpload).subscribe((response:any) => {
            this.closeCertificatesModal();
            this.isSubmitted = false;
            this.courseCertificate.certificates = [];
            this.certificateToUpload.set('certificates','');
            this.ngOnInit();
      
          });
        }

       updateCourse(){
           this.isSubmitted=true;
           if (!this.editCourseForm.valid) {
           return;
          }
          this.loadingIcon = true;
      
          if(!this.uploadImage){
            this.fileToUpload.append('avatar', this.course.avatar);
          }
      
           this.updateCourseDetails=this.editCourseForm.value;
           this.fileToUpload.append('courseId', this.course.courseId);
           this.fileToUpload.append('courseName', this.updateCourseDetails.courseName);
           this.fileToUpload.append('price', this.updateCourseDetails.price?.toString());
           this.fileToUpload.append('accessibilityId',this.updateCourseDetails.accessibilityId);
           this.fileToUpload.append('languageIds',JSON.stringify(this.updateCourseDetails.languageIds));
           this.fileToUpload.append('description',this.updateCourseDetails.description);
           this.fileToUpload.append('serviceTypeId',this.updateCourseDetails.serviceTypeId);
        
          this._courseService.editCourse(this.fileToUpload).subscribe((response:any) => {
            this.closeModal();
            this.isSubmitted=true;
            this.fileToUpload = new FormData();
            this.ngOnInit();
          });
        }

    
      
    getFreeCourse(){
      this.isCoursePaid = false;
      this.editCourseForm.get('price')?.removeValidators(Validators.required);
      this.editCourseForm.patchValue({
        price: null,
      });
    }

       getPaidCourse(){
          this.isCoursePaid = true;
          this.editCourseForm.get('price')?.addValidators(Validators.required);
        }

        private closeModal(): void {
          this.closeEditModal.nativeElement.click();
      }

      private closeTeachersModal(): void {
        this.closeTeacherModal.nativeElement.click();
      }

      private closeLanguagesModal(): void {
        this.closeLanguageModal.nativeElement.click();
      }

      private closeCertificatesModal(): void {
        this.closeCertificateModal.nativeElement.click();
      }

      resetCertificateModal(){
        this.isSubmitted = false;
        this.courseCertificate.certificates = [];
      }

      removeTeacher(event: any){
        const teacherIndex = this.courseTeacher.teacherIds.findIndex((item) => item === event.teacherId);
        if (teacherIndex > -1) {
          this.courseTeacher.teacherIds.splice(teacherIndex, 1);
        }
      }
    
      removeLanguage(event: any){
        const languageIndex = this.courseLanguage.languageIds.findIndex((item) => item === event.id);
        if (languageIndex > -1) {
          this.courseLanguage.languageIds.splice(languageIndex, 1);
        }
      }

      resetLanguageModal(){
        this.isSubmitted=false;
        this.languageForm.setValue({
          languages: [],
        });

      }
    
      resetTeacherModal(){
        this.isSubmitted=false;
        var re = this.teacherForm.get('teachers')?.value;
        this.teacherForm.setValue({
          teachers: [],
        });
    
      }

    //   createPost(){
    //     this.isOpenModal = true;
    
    //   }

      profileGrid(){
        this.isProfileGrid = true;
  
      }
  
      profileList(){
        this.isProfileGrid = false;
  
      }

      openPostModal(): void {
        const initialState = {
          courseId: this.course.courseId,
          from: "course"
        };
        this.bsModalService.show(CreatePostComponent,{initialState});
    }

    pinUnpinPost(attachmentId:string,isPinned:boolean){
      this._postService.pinUnpinPost(attachmentId,isPinned).subscribe((response) => {
        this.ngOnInit();
        console.log(response);
      });
    
    }

    convertToClass(courseId:string){
      this._courseService.convertToClass(courseId).subscribe((response) => {
        window.location.href=`user/classProfile/${courseId}`;
      });
    }

    
    openPostsViewModal(posts:string): void {
      const initialState = {
        posts: posts
      };
      this.bsModalService.show(PostViewComponent,{initialState});
    }

    requestMessage(){
      if(this.validToken == ''){
        window.open('user/auth/login', '_blank');
      }
    }
  
}
