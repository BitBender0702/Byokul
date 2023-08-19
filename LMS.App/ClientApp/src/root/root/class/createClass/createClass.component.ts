import { Component, ElementRef, Injector, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { HttpClient, HttpEventType, HttpHeaders } from "@angular/common/http";
import {MenuItem, MessageService} from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { MultilingualComponent, changeLanguage } from '../../sharedModule/Multilingual/multilingual.component';
import { CreateClassModel } from 'src/root/interfaces/class/createClassModel';
import { ClassService } from 'src/root/service/class.service';
import { FilterService } from "primeng/api";
import { IfStmt } from '@angular/compiler';
import { Subject, Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { SharePostComponent } from '../../sharePost/sharePost.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Spanish } from 'flatpickr/dist/l10n/es';
import { Arabic } from 'flatpickr/dist/l10n/ar';
import { Turkish } from 'flatpickr/dist/l10n/tr';
import flatpickr from 'flatpickr';
import { OpenSideBar } from 'src/root/user-template/side-bar/side-bar.component';
import { TranslateService } from '@ngx-translate/core';
import { Dimensions, ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { DomSanitizer } from '@angular/platform-browser';
import { enumToObjects } from 'src/root/Enums/getEnum';
import { CurrencyEnum } from 'src/root/Enums/CurrencyEnum';

export const ownedClassResponse =new Subject<{classId: string, classAvatar : string,className:string,schoolName:string, action:string}>(); 


@Component({
  selector: 'students-Home',
  templateUrl: './createClass.component.html',
  styleUrls: ['./createClass.component.css'],
  providers: [FilterService,MessageService]
})

export class CreateClassComponent extends MultilingualComponent implements OnInit, OnDestroy {
  private _classService;

  languages:any;
  students:any;
  filteredStudents!: any[];
  teachers:any;
  filteredTeachers!: any[];
  disciplines:any;
  filteredDisciplines!: any[];
  serviceTypes:any;
  accessibility:any;
  class!:CreateClassModel;
  createClassForm!:FormGroup;
  createClassForm1!:FormGroup;
  createClassForm2!:FormGroup;
  createClassForm3!:FormGroup;
  isSubmitted: boolean = false;
  uploadImageName!:string;
  fileToUpload= new FormData();
  items!: MenuItem[];
  step: number = 0;
  nextPage:boolean = false;
  isOpenSearch:boolean = false;
  isOpenSidebar:boolean = false;
  isClassPaid!:boolean;
  studentIds:string[] = [];
  studentInfo:any[] = [];
  disciplineIds:string[] = [];
  disciplineInfo:any[] = [];
  teacherIds:string[] = [];
  teacherInfo:any[] = [];
  loadingIcon:boolean = false;
  isStepCompleted: boolean = false;
  currentDate!:string;
  fromSchoolProfile!:string;
  schools:any;
  selectedSchool:any;
  selectedSchoolName!:string;

  classUrl!:string;
  classId!:string;
  className!:string;
  tags!:string;
  tagList!: string[];
  isTagsValid: boolean = true;
  minDate:any;
  classAvatar:any;
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
  currencies:any;
  transform: ImageTransform = {};
  @ViewChild('hiddenButton') hiddenButtonRef!: ElementRef;
  @ViewChild('startDate') startDateRef!: ElementRef;
  @ViewChild('endDate') endDateRef!: ElementRef;
  changeLanguageSubscription!: Subscription;


  constructor(injector: Injector,private translateService: TranslateService,private bsModalService: BsModalService,private datePipe: DatePipe,public messageService:MessageService,private route: ActivatedRoute,private router: Router,private fb: FormBuilder,classService: ClassService,private http: HttpClient,private domSanitizer: DomSanitizer) {
    super(injector);
    this._classService = classService;
    this.currencies = enumToObjects(CurrencyEnum);
  }

  ngOnInit(): void {
    this.loadingIcon = true;
    var id = this.route.snapshot.paramMap.get('id');
    this.fromSchoolProfile = id ?? '';
    this.minDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

    if(this.fromSchoolProfile == ''){
      this.getSchoolsForDropdown();
      this.loadingIcon = false;

    }

    if(this.fromSchoolProfile != ''){
      this.getSelectedSchool(this.fromSchoolProfile);
      this.loadingIcon = false;

    }

    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this.translate.use(this.selectedLanguage);

    this.items = [
      { label: "" },
      { label: "" }
    ];
    
  this._classService.getLanguageList().subscribe((response) => {
    this.languages = response;
  });

  this._classService.getAllStudents().subscribe((response) => {
    this.students = response;
  });

  this._classService.getAllTeachers().subscribe((response) => {
    this.teachers = response;
  });

  this._classService.getDisciplines().subscribe((response) => {
    this.disciplines = response;
  });

  this._classService.getServiceType().subscribe((response) => {
    this.serviceTypes = response;

  });

  this._classService.getAccessibility().subscribe((response) => {
    this.accessibility = response;
    this.createClassForm1.controls['accessibilityId'].setValue(this.accessibility[0].id, {onlySelf: true});
  });

  this.currentDate = this.getCurrentDate();

  this.createClassForm1 = this.fb.group({
    schoolId: this.fb.control('', [Validators.required]),
    schoolName: this.fb.control(''),
    className: this.fb.control('', [Validators.required]),
    description: this.fb.control(''),
    noOfStudents: this.fb.control('',[Validators.required]),
    startDate: this.fb.control('',[Validators.required]),
    endDate: this.fb.control('',[Validators.required]),
    serviceTypeId: this.fb.control('',[Validators.required]),
    accessibilityId: this.fb.control('',[Validators.required]),
    languageIds:this.fb.control('',[Validators.required]),
    price:this.fb.control(''),
    currency:this.fb.control(this.currencies[0].key),
    tags:this.fb.control('',[Validators.required]),

}, {validator: this.dateLessThan('startDate', 'endDate',this.currentDate)});

this.createClassForm2 = this.fb.group({
  disciplineIds:this.fb.control(''),
  studentIds:this.fb.control(''),
  teacherIds:this.fb.control('')

});

this.createClassForm3 = this.fb.group({
  classUrl: this.fb.control('',[Validators.required])
});

this.tagList = [];

flatpickr('#start_date',{
  minDate:new Date(),
  dateFormat: "m/d/Y"
});

flatpickr('#end_date',{
  minDate:new Date(),
  dateFormat: "m/d/Y"
});

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
  this._classService.getAllSchools().subscribe((response) => {
    this.schools = response;
    this.createClassForm1.controls['schoolId'].setValue(this.schools[0].schoolId, {onlySelf: true});
    this.createClassForm1.controls['schoolName'].setValue(this.schools[0].schoolName, {onlySelf: true});
  });  
}

getSelectedSchool(schoolId:string){
  this._classService.getSelectedSchool(schoolId).subscribe((response) => {
    this.selectedSchool = response;
    this.createClassForm1.controls['schoolId'].setValue(this.selectedSchool.schoolId, {onlySelf: true});
    this.createClassForm1.controls['schoolName'].setValue(this.selectedSchool.schoolName, {onlySelf: true});

  });  
}


dateLessThan(from: string, to: string, currentDate:string) {
  return (group: FormGroup): {[key: string]: any} => {
   let f = group.controls[from];
   let t = group.controls[to];
   if ((new Date(f.value) > new Date(t.value) && t.value != "" && f.value != "") || new Date(f.value) < new Date(currentDate)) {
     return {
       dates: `Please enter valid date`
     };
   }
   return {};
  }
}

getCurrentDate(){
var today = new Date();
  var dd = String(today. getDate()). padStart(2, '0');
  var mm = String(today. getMonth() + 1). padStart(2, '0');
  var yyyy = today. getFullYear();
​  var currentDate = mm + '/' + dd + '/' + yyyy;
  return currentDate;
}


captureStudentId(event: any) {
  var noOfStudents = Number(this.class.noOfStudents);
  if(this.studentIds.length >= noOfStudents){
    this.createClassForm2.setErrors({ studentLimitExceeds: true });
  }
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

  // handleImageInput(event: any) {
  //   debugger
  //   if(event.target.files[0].type == "video/mp4"){
  //     const videoElement = document.createElement('video');
  //     // videoElement.src = videoUrl;
  //     videoElement.addEventListener('loadedmetadata', () => {

  //     });
  //   }
  //   this.fileToUpload.append("thumbnail", event.target.files[0], event.target.files[0].name);

  //   this.uploadImageName = event.target.files[0].name;
  // }

  videoLengthExceeded:boolean=false;
  handleImageInput(event: any) {
    debugger;
  
    if (event.target.files[0].type === "video/mp4") {
      const videoElement = document.createElement('video');
      videoElement.src = URL.createObjectURL(event.target.files[0]);
  
      videoElement.addEventListener('loadedmetadata', () => {
        const videoLengthInSeconds = videoElement.duration;
        console.log(`Video Length (in seconds): ${videoLengthInSeconds}`);
        if(videoLengthInSeconds > 180){
          this.videoLengthExceeded = true
        } else{
          this.videoLengthExceeded = false
        }
      });
    }
    debugger
    this.fileToUpload.append("thumbnail", event.target.files[0], event.target.files[0].name);
    this.uploadImageName = event.target.files[0].name;
  }
  




  createClass(){
    
    this.isSubmitted=true;
    if (!this.createClassForm3.valid) {
      return;
    }

    this.loadingIcon = true;
    this.router.navigateByUrl(`profile/class/${this.selectedSchool.schoolName.replace(" ","").toLowerCase()}/${this.className.replace(" ","").toLowerCase()}`)

    // this._classService.createClass(this.fileToUpload).subscribe((response:any) => {
    //   this.loadingIcon = false;
    //   var classId =  response;
    //   this.router.navigateByUrl(`user/classProfile/${classId}`)

    // });
  }

  back(): void {
    window.history.back();
  }

  forwardStep() {
    this.isStepCompleted = true;
    this.class=this.createClassForm1.value;

    if (!this.createClassForm1.valid || this.uploadImageName == undefined) {
      return;
    }

    if(this.videoLengthExceeded){
      return;
    }

    if(this.class.tags == '' && (this.tagList == undefined || this.tagList.length == 0)){
      this.isTagsValid = false;
      return;
    }

    if(this.tagList.length > 7){
      this.tagCountExceeded = true;
      return; 
    }


    // var schoolId = this.createClassForm1.get('schoolId')?.value;
    //this.class=this.createClassForm1.value;
    this.className = this.class.className.split(' ').join('');

    // if (this.class.tags.startsWith("#")){
    //   if(!this.tagList.includes(this.class.tags)) {
    //   this.tagList.push(this.class.tags);
    //   }
    // }
    // else{
    //   this.class.tags = '#' + this.class.tags;
    //   if(!this.tagList.includes(this.class.tags)) {
    //   this.tagList.push(this.class.tags);
    //   }
    // }

    this.fileToUpload.append('classTags', JSON.stringify(this.tagList))
    // this.schoolName = this.class.schoolId.schoolName.split(' ').join('');
    this._classService.isClassNameExist(this.class.className).subscribe((response) => {
      if(!response){
        this.createClassForm1.setErrors({ unauthenticated: true });
        return;
      }
      else{
        this.fileToUpload.append("avatarImage", this.selectedImage);
    // this.class.schoolId = schoolId;
    this.fileToUpload.append('schoolId', this.class.schoolId);
    this.fileToUpload.append('className', this.class.className);
    this.fileToUpload.append('description', this.class.description);
    this.fileToUpload.append('noOfStudents',this.class.noOfStudents);
    this.fileToUpload.append('startDate',this.class.startDate);
    this.fileToUpload.append('endDate',this.class.endDate);
    this.fileToUpload.append('serviceTypeId',this.class.serviceTypeId);
    this.fileToUpload.append('accessibilityId',this.class.accessibilityId);
    this.fileToUpload.append('languageIds',JSON.stringify(this.class.languageIds));
    this.fileToUpload.append('price',this.class.price?.toString());
    this.fileToUpload.append('currency',this.class.currency);
        this.step += 1;
        this.isStepCompleted = false;
        this.nextPage = true;
    
        if(this.fromSchoolProfile != ''){
        this.createClassForm3.patchValue({
          classUrl: 'byokul.com/profile/class/' + this.selectedSchool.schoolName.split(' ').join('').replace(" ","").toLowerCase() + "/" +  this.class.className.split(' ').join('').replace(" ","").toLowerCase(),
          });
        }
       else{
        var schoolId = this.createClassForm1.controls['schoolId'].value;
        this._classService.getSelectedSchool(schoolId).subscribe((response) => {
          this.selectedSchool = response;
          this.createClassForm3.patchValue({
            classUrl: 'byokul.com/profile/class/' + this.selectedSchool.schoolName.split(' ').join('').replace(" ","").toLowerCase() + "/" +  this.class.className.split(' ').join('').replace(" ","").toLowerCase(),
          });
        });  
      
        }
      }
    });
    // this.class.schoolId = schoolId;
    // this.fileToUpload.append('schoolId', this.class.schoolId);
    // this.fileToUpload.append('className', this.class.className);
    // this.fileToUpload.append('description', this.class.description);
    // this.fileToUpload.append('noOfStudents',this.class.noOfStudents);
    // this.fileToUpload.append('startDate',this.class.startDate);
    // this.fileToUpload.append('endDate',this.class.endDate);
    // this.fileToUpload.append('serviceTypeId',this.class.serviceTypeId);
    // this.fileToUpload.append('accessibilityId',this.class.accessibilityId);
    // this.fileToUpload.append('languageIds',JSON.stringify(this.class.languageIds));
    // this.fileToUpload.append('price',this.class.price?.toString());
    // this.className = this.class.className.split(' ').join('');
    // this.fileToUpload.append('classTags', JSON.stringify(this.tagList))
    // // this.schoolName = this.class.schoolId.schoolName.split(' ').join('');
    // this._classService.isClassNameExist(this.class.className).subscribe((response) => {
    //   if(!response){
    //     this.createClassForm1.setErrors({ unauthenticated: true });
    //     return;
    //   }
    //   else{
    //     this.step += 1;
    //     this.isStepCompleted = false;
    //     this.nextPage = true;
    
    //     if(this.fromSchoolProfile != ''){
    //     this.createClassForm3.patchValue({
    //       classUrl: 'byokul.com/profile/class/' + this.selectedSchool.schoolName.split(' ').join('') + "/" +  this.class.className.split(' ').join(''),
    //       });
    //     }
    //    else{
    //     var schoolId = this.createClassForm1.controls['schoolId'].value;
    //     this._classService.getSelectedSchool(schoolId).subscribe((response) => {
    //       this.selectedSchool = response;
    //       this.createClassForm3.patchValue({
    //         classUrl: 'byokul.com/profile/class/' + this.selectedSchool.schoolName.split(' ').join('') + "/" +  this.class.className.split(' ').join(''),
    //       });
    //     });  
      
    //     }
    //   }
    // });
   
    

  }

  getSchoolName(schoolName:string){
    this.selectedSchoolName = schoolName;
  }

  forwardStep2() {
    if(!this.createClassForm2.valid){
      return;
    }
    // var classes = this.createClassForm1.value;
    // var schoolName = classes.schoolName;
    // var a = this.selectedSchool.schooName;
    // var b = this.selectedSchoolName;
    this.loadingIcon = true;
    this.isStepCompleted = true;
    this.fileToUpload.append('disciplineIds',JSON.stringify(this.disciplineIds));
    this.fileToUpload.append('studentIds',JSON.stringify(this.studentIds));
    this.fileToUpload.append('teacherIds',JSON.stringify(this.teacherIds));
    this.classUrl = 'byokul.com/profile/class/' + this.selectedSchool.schoolName.split(' ').join('').replace(" ","").toLowerCase() + "/" +  this.className.split(' ').join('').replace(" ","").toLowerCase();
    this.fileToUpload.append('classUrl',JSON.stringify(this.classUrl));
    this._classService.createClass(this.fileToUpload).subscribe((response:any) => {
         var classId =  response;
         this.classId = classId;
         this.loadingIcon = false;
         ownedClassResponse.next({classId:response.classId, classAvatar:response.avatar, className:response.className,schoolName:response.school.schoolName,action:"add"});
         this.step += 1;
         this.isStepCompleted = false;
         this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Class added successfully'});
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

  getFreeClass(){
    this.isClassPaid = false;
    this.createClassForm1.get('price')?.removeValidators(Validators.required);
    this.createClassForm1.patchValue({
      price: null,
    });
  }

  getPaidClass(){
    this.isClassPaid = true;
    this.createClassForm1.get('price')?.addValidators(Validators.required);
  }

  openSearch(){
    this.isOpenSearch = true;
  }

  closeSearch(){
    this.isOpenSearch = false;
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



  classProfile(){
    window.open(`profile/class/${this.selectedSchool.schoolName.replace(" ","").toLowerCase()}/${this.className.replace(" ","").toLowerCase()}`, '_blank');

    //window.location.href=`profile/class/${this.selectedSchool.schoolName}/${this.className}`;
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
    // this.createClassForm1.controls['tags'].setValue('');
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
      var schoolName = this.createClassForm1.controls['schoolName'].value;
    }
    if(this.fromSchoolProfile == ''){
      var schoolId = this.createClassForm1.controls['schoolId'].value;
      var school = this.schools.find((x: { schoolId: any; })=> x.schoolId == schoolId);
      var schoolName = school.schoolName;
    }
    const initialState = {
      className: this.className,
      schoolName: schoolName
    };
    this.bsModalService.show(SharePostComponent,{initialState});
  }

  getSelectedLanguage(){
    var selectedLanguage = localStorage.getItem("selectedLanguage");
    this.translate.use(selectedLanguage ?? '');
    var locale = selectedLanguage == "ar" ? Arabic: selectedLanguage == "sp"? Spanish : selectedLanguage == "tr"? Turkish : null
    const startDateElement = this.startDateRef.nativeElement;
    startDateElement._flatpickr.set("locale", locale); 
    const endDateElement = this.endDateRef.nativeElement;
    endDateElement._flatpickr.set("locale", locale); 
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
    this.classAvatar = '';
    this.fileToUpload.set('avatarImage', '');
  }

  cropModalOpen(template: TemplateRef<any>) {
    this.cropModalRef = this.bsModalService.show(template);
  }

  closeCropModal() {
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

  applyCropimage() {
    debugger
    this.classAvatar = this.croppedImage.changingThisBreaksApplicationSecurity;
    this.cropModalRef.hide();
  }

  loadImageFailed() {
    console.log('Load failed');
  }

  sanitize(url:string){
    return this.domSanitizer.bypassSecurityTrustUrl(url);
}


}
