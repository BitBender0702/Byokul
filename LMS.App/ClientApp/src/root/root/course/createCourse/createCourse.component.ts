import { Component, ElementRef, Injector, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { HttpClient, HttpEventType, HttpHeaders } from "@angular/common/http";
import {MenuItem, MessageService} from 'primeng/api';
import { MultilingualComponent, changeLanguage } from '../../sharedModule/Multilingual/multilingual.component';
import { FilterService } from "primeng/api";
import { CreateCourseModel } from 'src/root/interfaces/course/createCourseModel';
import { CourseService } from 'src/root/service/course.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharePostComponent } from '../../sharePost/sharePost.component';
import { OpenSideBar } from 'src/root/user-template/side-bar/side-bar.component';
import { TranslateService } from '@ngx-translate/core';
import { Dimensions, ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { DomSanitizer } from '@angular/platform-browser';

export const ownedCourseResponse =new Subject<{courseId: string, courseAvatar : string,courseName:string,schoolName:string, action:string}>(); 


// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { CreatePostComponent } from '../../createPost/createPost';

@Component({
  selector: 'students-Home',
  templateUrl: './createCourse.component.html',
  styleUrls: ['./createCourse.component.css'],
  providers: [FilterService,MessageService]
})

export class CreateCourseComponent extends MultilingualComponent implements OnInit, OnDestroy {
  private _courseService;
  languages:any;
  students:any;
  filteredStudents!: any[];
  teachers:any;
  filteredTeachers!: any[];
  disciplines:any;
  filteredDisciplines!: any[];
  serviceTypes:any;
  accessibility:any;
  course!:CreateCourseModel;
  createCourseForm!:FormGroup;
  createCourseForm1!:FormGroup;
  createCourseForm2!:FormGroup;
  createCourseForm3!:FormGroup;
  isSubmitted: boolean = false;
  fileToUpload= new FormData();
  items!: MenuItem[];
  step: number = 0;
  nextPage:boolean = false;
  isCoursePaid:boolean = false;
  studentIds:string[] = [];
  studentInfo:any[] = [];
  disciplineIds:string[] = [];
  disciplineInfo:any[] = [];
  teacherIds:string[] = [];
  teacherInfo:any[] = [];
  isOpenSidebar:boolean = false;
  isStepCompleted: boolean = false;
  fromSchoolProfile!:string;
  schools:any;
  selectedSchool:any;
  loadingIcon:boolean = false;
  courseUrl!:string;
  courseId!:string;
  courseName!:string;
  uploadImageName!:string;
  tagList!: string[];
  isTagsValid: boolean = true;
  tagCountExceeded:boolean = false;
  selectedImage: any = '';
  isSelected: boolean = false;
  imageChangedEvent: any = '';
  cropModalRef!: BsModalRef;
  croppedImage: any = '';
  canvasRotation = 0;
  rotation = 0;
  scale = 1;
  showCropper = false;
  containWithinAspectRatio = false;
  courseAvatar:any;
  transform: ImageTransform = {};
  changeLanguageSubscription!: Subscription;
  @ViewChild('hiddenButton') hiddenButtonRef!: ElementRef;



  constructor(injector: Injector,private translateService: TranslateService,private bsModalService: BsModalService,public messageService:MessageService,private router: Router,private route: ActivatedRoute,private domSanitizer: DomSanitizer,private fb: FormBuilder,courseService: CourseService,private http: HttpClient) {
    super(injector);
    this._courseService = courseService;
  }

  ngOnInit(): void {

    var id = this.route.snapshot.paramMap.get('id');
    this.fromSchoolProfile = id ?? '';
    this.step = 0;

    if(this.fromSchoolProfile == ''){
      this.getSchoolsForDropdown();
    }

    if(this.fromSchoolProfile != ''){
      this.getSelectedSchool(this.fromSchoolProfile);
    }

    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this.translate.use(this.selectedLanguage);

    this.items = [
      { label: "" },
      { label: "" }
    ];
    
  this._courseService.getLanguageList().subscribe((response) => {
    this.languages = response;
  });

    this._courseService.getAllStudents().subscribe((response) => {
    this.students = response;
  });

  this._courseService.getAllTeachers().subscribe((response) => {
    this.teachers = response;
  });

  this._courseService.getDisciplines().subscribe((response) => {
    this.disciplines = response;
  });

  this._courseService.getServiceType().subscribe((response) => {
    this.serviceTypes = response;
  });

  this._courseService.getAccessibility().subscribe((response) => {
    this.accessibility = response;
    this.createCourseForm1.controls['accessibilityId'].setValue(this.accessibility[0].id, {onlySelf: true});
  });


  this.createCourseForm = this.fb.group({
      schoolId: this.fb.control('C65DDBF5-42F5-496D-CFF7-08DA9CA1C8A0', [Validators.required]),
      courseName: this.fb.control('', [Validators.required]),
      description: this.fb.control(''),
      serviceTypeId: this.fb.control(''),
      accessibilityId: this.fb.control(''),
      languageIds:this.fb.control(''),
      courseUrl: this.fb.control(''),
      disciplineIds:this.fb.control(''),
      studentIds:this.fb.control(''),
      teacherIds:this.fb.control(''),
      price:this.fb.control('')

  });

  this.createCourseForm1 = this.fb.group({
    schoolId: this.fb.control('', [Validators.required]),
    schoolName: this.fb.control(''),
    courseName: this.fb.control('', [Validators.required]),
    serviceTypeId: this.fb.control('',[Validators.required]),
    accessibilityId: this.fb.control('',[Validators.required]),
    languageIds:this.fb.control('',[Validators.required]),
    description: this.fb.control(''),
    price:this.fb.control(''),
    tags:this.fb.control('',[Validators.required])

  });

  this.createCourseForm2 = this.fb.group({
    disciplineIds:this.fb.control(''),
    studentIds:this.fb.control(''),
    teacherIds:this.fb.control('')
  
  });

  this.createCourseForm3 = this.fb.group({
    courseUrl: this.fb.control('',[Validators.required])
  });

  this.tagList = [];

  if(!this.changeLanguageSubscription){
    this.changeLanguageSubscription = changeLanguage.subscribe(response => {
      this.translate.use(response.language);
    })
  }
}

ngOnDestroy(): void {
  if(this.changeLanguageSubscription){
    this.changeLanguageSubscription.unsubscribe();
  }
}

getSchoolsForDropdown(){
  this._courseService.getAllSchools().subscribe((response) => {
    this.schools = response;
    this.createCourseForm1.controls['schoolId'].setValue(this.schools[0].schoolId, {onlySelf: true});
  });  
}

getSelectedSchool(schoolId:string){
  this._courseService.getSelectedSchool(schoolId).subscribe((response) => {
    this.selectedSchool = response;
    this.createCourseForm1.controls['schoolId'].setValue(this.selectedSchool.schoolId, {onlySelf: true});
    this.createCourseForm1.controls['schoolName'].setValue(this.selectedSchool.schoolName, {onlySelf: true});
  });  
}


captureStudentId(event: any) {
  var studentId = event.studentId;
  this.studentIds.push(studentId);
  this.studentInfo.push(event);
}

captureDisciplineId(event: any) {
  var disciplineId = event.id;
  this.disciplineIds.push(disciplineId);
  this.disciplineInfo.push(event);
}

captureTeacherId(event: any) {
  var teacherId = event.teacherId;
  this.teacherIds.push(teacherId);
  this.teacherInfo.push(event);
}

  copyMessage(inputElement:any){
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
    const translatedInfoSummary = this.translateService.instant('Success');
    const translatedMessage = this.translateService.instant('CopiedToClipboard');
    this.messageService.add({severity:'success', summary:translatedInfoSummary,life: 3000, detail:translatedMessage});
  }

  handleImageInput(event: any) {
    this.fileToUpload.append("thumbnail", event.target.files[0], event.target.files[0].name);
    this.uploadImageName = event.target.files[0].name;
  }

  createCourse(){
    this.isSubmitted=true;
    if (!this.createCourseForm3.valid) {
      return;
    }

    this.loadingIcon = true;
    this.router.navigateByUrl(`profile/course/${this.selectedSchool.schoolName.replace(" ","").toLowerCase()}/${this.courseName.replace(" ","").toLowerCase()}`);
  }

  back(): void {
    window.history.back();
  }

  forwardStep() {
    this.isStepCompleted = true;
    if (!this.createCourseForm1.valid) {
      return;
    }

    if(this.tagList == undefined || this.tagList.length == 0){
      this.isTagsValid = false;
      return;
    }

    if(this.tagList.length > 7){
      this.tagCountExceeded = true;
      return; 
    }

    // var schoolId = this.createCourseForm1.get('schoolId')?.value;
    this.course=this.createCourseForm1.value;
    this.courseName = this.course.courseName.split(' ').join('');
    this.fileToUpload.append('courseTags', JSON.stringify(this.tagList))
    this._courseService.isCourseNameExist(this.course.courseName).subscribe((response) => {
      if(!response){
        this.createCourseForm1.setErrors({ unauthenticated: true });
        return;
      }
      else{
        this.fileToUpload.append("avatarImage", this.selectedImage);
        this.fileToUpload.append('schoolId', this.course.schoolId);
        this.fileToUpload.append('courseName', this.course.courseName);
        this.fileToUpload.append('serviceTypeId',this.course.serviceTypeId);
        this.fileToUpload.append('accessibilityId',this.course.accessibilityId);
        this.fileToUpload.append('languageIds',JSON.stringify(this.course.languageIds));
        this.fileToUpload.append('description', this.course.description);
        this.fileToUpload.append('price', this.course.price?.toString());
        this.step += 1;
        this.isStepCompleted = false;
        this.nextPage = true;
    
        if(this.fromSchoolProfile != ''){
        this.createCourseForm3.patchValue({
          courseUrl: 'byokul.com/profile/course/' + this.selectedSchool.schoolName.split(' ').join('').replace(" ","").toLowerCase() + "/" +  this.course.courseName.split(' ').join('').replace(" ","").toLowerCase(),
          });
        }
       else{
        var schoolId = this.createCourseForm1.controls['schoolId'].value;
        this._courseService.getSelectedSchool(schoolId).subscribe((response) => {
          this.selectedSchool = response;
          this.createCourseForm3.patchValue({
            courseUrl: 'byokul.com/profile/course/' + this.selectedSchool.schoolName.split(' ').join('').replace(" ","").toLowerCase() + "/" +  this.course.courseName.split(' ').join('').replace(" ","").toLowerCase(),
          });
        });  
      
        }
      }
    });
    // this.course.schoolId = schoolId;

    // this.fileToUpload.append('schoolId', this.course.schoolId);
    // this.fileToUpload.append('courseName', this.course.courseName);
    // this.fileToUpload.append('serviceTypeId',this.course.serviceTypeId);
    // this.fileToUpload.append('accessibilityId',this.course.accessibilityId);
    // this.fileToUpload.append('languageIds',JSON.stringify(this.course.languageIds));
    // this.fileToUpload.append('description', this.course.description);
    // this.fileToUpload.append('price', this.course.price?.toString());
    // this.courseName = this.course.courseName.split(' ').join('');
    // this.fileToUpload.append('courseTags', JSON.stringify(this.tagList))
    // this._courseService.isCourseNameExist(this.course.courseName).subscribe((response) => {
    //   if(!response){
    //     this.createCourseForm1.setErrors({ unauthenticated: true });
    //     return;
    //   }
    //   else{
    //     this.step += 1;
    //     this.isStepCompleted = false;
    //     this.nextPage = true;
    
    //     if(this.fromSchoolProfile != ''){
    //     this.createCourseForm3.patchValue({
    //       courseUrl: 'byokul.com/profile/course/' + this.selectedSchool.schoolName.split(' ').join('') + "/" +  this.course.courseName.split(' ').join(''),
    //       });
    //     }
    //    else{
    //     var schoolId = this.createCourseForm1.controls['schoolId'].value;
    //     this._courseService.getSelectedSchool(schoolId).subscribe((response) => {
    //       this.selectedSchool = response;
    //       this.createCourseForm3.patchValue({
    //         courseUrl: 'byokul.com/profile/course/' + this.selectedSchool.schoolName.split(' ').join('') + "/" +  this.course.courseName.split(' ').join(''),
    //       });
    //     });  
      
    //     }
    //   }
    // });
    // this.isStepCompleted = false;
    // this.step += 1;
    // this.nextPage = true;

    // this.createCourseForm3.patchValue({
    //   courseUrl: 'byokul.com/schoolname/' + this.course.courseName.split(' ').join(''),
    // });
  }

  forwardStep2(){
    this.loadingIcon = true;
    this.isStepCompleted = true;

    this.fileToUpload.append('disciplineIds',JSON.stringify(this.disciplineIds));
    this.fileToUpload.append('studentIds',JSON.stringify(this.studentIds));
    this.fileToUpload.append('teacherIds',JSON.stringify(this.teacherIds));

    this.courseUrl = 'byokul.com/profile/course/' + this.selectedSchool.schoolName.split(' ').join('').replace(" ","").toLowerCase() + "/" +  this.courseName.split(' ').join('').replace(" ","").toLowerCase();
    this.fileToUpload.append('courseUrl',JSON.stringify(this.courseUrl));
    this._courseService.createCourse(this.fileToUpload).subscribe((response:any) => {
      this.courseId = response;
      this.loadingIcon = false;
      ownedCourseResponse.next({courseId:response.courseId, courseAvatar:response.avatar, courseName:response.courseName,schoolName:response.school.schoolName,action:"add"});
      this.step += 1;
      this.isStepCompleted = false;
      this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Course created successfully'});
    });
  }

  backStep() {
    this.step -= 1;
  }

  filterDisciplines(event:any) {
    var disciplines = this.disciplines.filter((x: { id: any; }) => !this.disciplineIds.find(y => y == x.id));
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < disciplines.length; i++) {
      let discipline = disciplines[i];
      if (discipline.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(discipline);
      }
    }
    this.filteredDisciplines = filtered;
  }

  filterStudents(event:any) {
    var students = this.students.filter((x: { studentId: any; }) => !this.studentIds.find(y => y == x.studentId));
    let filteredStudents: any[] = [];
    let query = event.query;
    for (let i = 0; i < students.length; i++) {
      let student = students[i];
      if (student.studentName.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filteredStudents.push(student);
      }
    }
    this.filteredStudents = filteredStudents;
  }

  filterTeachers(event:any) {
    var teachers = this.teachers.filter((x: { teacherId: any; }) => !this.teacherIds.find(y => y == x.teacherId));
    let filteredTeachers: any[] = [];
    let query = event.query;
    for (let i = 0; i < teachers.length; i++) {
      let teacher = teachers[i];
      if (teacher.firstName.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filteredTeachers.push(teacher);
      }
    }
    this.filteredTeachers = filteredTeachers;
  }

  getFreeCourse(){
    this.isCoursePaid = false;
    this.createCourseForm1.get('price')?.removeValidators(Validators.required);
    this.createCourseForm1.patchValue({
      price: null,
    });
  }

  getPaidCourse(){
    this.isCoursePaid = true;
    this.createCourseForm1.get('price')?.addValidators(Validators.required);
    //this.createCourseForm1.setErrors({ priceRequired: true });
  }

  openSidebar(){
    OpenSideBar.next({isOpenSideBar:true})
  }

  removeTeacher(event: any){
    const teacherIndex = this.teacherInfo.findIndex((item) => item.teacherId === event.teacherId);
    if (teacherIndex > -1) {
      this.teacherInfo.splice(teacherIndex, 1);
    }

    const index = this.teacherIds.findIndex((item) => item === event.teacherId);
    if (index > -1) {
      this.teacherIds.splice(teacherIndex, 1);
    }
  }

  removeStudent(event: any){
    const studentIndex = this.studentInfo.findIndex((item) => item.studentId === event.studentId);
    if (studentIndex > -1) {
      this.studentInfo.splice(studentIndex, 1);
    }

    const index = this.studentIds.findIndex((item) => item === event.studentId);
    if (index > -1) {
      this.studentIds.splice(index, 1);
    }
  }

  removeDiscipline(event: any){
    const disciplineIndex = this.disciplineInfo.findIndex((item) => item.id === event.id);
    if (disciplineIndex > -1) {
      this.disciplineInfo.splice(disciplineIndex, 1);
    }
    const index = this.disciplineIds.findIndex((item) => item === event.id);
    if (index > -1) {
      this.disciplineIds.splice(index, 1);
    }
  }

  openModal(link:any) {
    // const modalRef = this.modalService.open(ModalComponent);
    // modalRef.componentInstance.src = link;
  }

  courseProfile(){
    window.open(`profile/course/${this.selectedSchool.schoolName.replace(" ","").toLowerCase()}/${this.courseName.replace(" ","").toLowerCase()}`, '_blank');
    // window.location.href=`profile/course/${this.selectedSchool.schoolName}/${this.courseName}`;
  }

  onEnter(event:any) {
    const isBlank = /^\s*$/.test(event.target.value);
    if(isBlank){
      return;
    }

    if(this.tagList.includes('#' + event.target.value)){
      event.target.value = '';
      return;
    }

    event.target.value = event.target.value.replace(/^\s+|\s+$/g, "").replace(/\s+/g, " ");
    if(event.target.value.indexOf('#') > -1){
      this.tagList.push(event.target.value);
    }
    else{
      event.target.value = '#' + event.target.value;
      this.tagList.push(event.target.value);
    }
    
    event.target.value = '';

    if(this.tagList.length > 7){
      this.tagCountExceeded = true;
      return; 
    }
    else{
      this.tagCountExceeded = false;
    }
  }

    removeTag(tag:any){
    const tagIndex = this.tagList.findIndex((item) => item ===tag);
    if (tagIndex > -1) {
      this.tagList.splice(tagIndex, 1);
    }

    if(this.tagList.length > 7){
      this.tagCountExceeded = true;
      return; 
    }
    else{
      this.tagCountExceeded = false;
    }
   }

   openSharePostModal(): void {
    if(this.fromSchoolProfile != ''){
      var schoolName = this.createCourseForm1.controls['schoolName'].value;
    }
    if(this.fromSchoolProfile == ''){
      var schoolId = this.createCourseForm1.controls['schoolId'].value;
      var school = this.schools.find((x: { schoolId: any; })=> x.schoolId == schoolId);
      var schoolName = school.schoolName;
    }
    const initialState = {
      courseName: this.courseName,
      schoolName: schoolName
    };
    this.bsModalService.show(SharePostComponent,{initialState});
  }

  onFileChange(event: any): void {
    debugger
    this.isSelected = true;
    this.imageChangedEvent = event;
    this.hiddenButtonRef.nativeElement.click();
  }

  removeLogo() {
    // if (this.user.avatar != null) {
    //   this.userAvatar = '';
    // }
    this.courseAvatar = '';
    this.fileToUpload.set('avatarImage', '');
  }

  cropModalOpen(template: TemplateRef<any>) {
    this.cropModalRef = this.bsModalService.show(template);
  }

  closeCropModal() {
    this.cropModalRef.hide();
  }


  applyCropimage() {
    debugger
    this.courseAvatar = this.croppedImage.changingThisBreaksApplicationSecurity;
    this.cropModalRef.hide();
  }

  imageCropped(event: ImageCroppedEvent) {
    debugger
    this.selectedImage = event.blob;
    this.croppedImage = this.domSanitizer.bypassSecurityTrustResourceUrl(
      event.objectUrl!
    );
  }

  imageLoaded() {
    this.showCropper = true;
    console.log('Image loaded');
  }

  cropperReady(sourceImageDimensions: Dimensions) {
    console.log('Cropper ready', sourceImageDimensions);
  }

  loadImageFailed() {
    console.log('Load failed');
  }


  sanitize(url:string){
    return this.domSanitizer.bypassSecurityTrustUrl(url);
}

}
