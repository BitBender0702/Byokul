import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { EditSchoolModel } from 'src/root/interfaces/school/editSchoolModel';
import { AddSchoolLanguage } from 'src/root/interfaces/school/addSchoolLanguage';
import { SchoolService } from 'src/root/service/school.service';
import { DeleteSchoolLanguage } from 'src/root/interfaces/school/deleteSchoolLanguage';
import { AddSchoolTeacher } from 'src/root/interfaces/school/addSchoolTeacher';
import { DeleteSchoolTeacher } from 'src/root/interfaces/school/deleteSchoolTeacher';
import { AddSchoolCertificate } from 'src/root/interfaces/school/addSchoolCertificate';
import { DeleteSchoolCertificate } from 'src/root/interfaces/school/deleteSchoolCertificate';
import { MultilingualComponent } from '../../sharedModule/Multilingual/multilingual.component';
import { CreatePostComponent } from '../../createPost/createPost.component';

@Component({
    selector: 'schoolProfile-root',
    templateUrl: './schoolProfile.component.html',
    styleUrls: ['./schoolProfile.component.css']
  })

export class SchoolProfileComponent extends MultilingualComponent implements OnInit {

    private _schoolService;
    school:any;
    isProfileGrid:boolean = true;
    isOpenSidebar:boolean = false;


    loadingIcon:boolean = false;
    isOpenModal:boolean = false;
    schoolId!:string;

    isDataLoaded:boolean = false;
    isSchoolFollowed:boolean = false;


    // eidt Schools
    editSchool:any;
    editSchoolForm!:FormGroup;
    accessibility:any;
    isSubmitted: boolean = false;
    fileToUpload= new FormData();
    certificateToUpload = new FormData();
    uploadImage!:any;
    updateSchoolDetails!:EditSchoolModel;

    // add/delete Languages
    languageForm!:FormGroup;
    teacherForm!:FormGroup;
    certificateForm!:FormGroup;
    languageIds:string[] = [];
    schoolLanguage!:AddSchoolLanguage;
    schoolTeacher!:AddSchoolTeacher;
    schoolCertificate!:AddSchoolCertificate;
    filteredLanguages!: any[];
    languages:any;
    deleteLanguage!: DeleteSchoolLanguage;
    deleteTeacher!: DeleteSchoolTeacher;
    deleteCertificate!: DeleteSchoolCertificate;
    EMAIL_PATTERN = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
    selectedCertificates:any;

    teacherInfo:any[] = [];


    // add/delete Teachers
    teachers:any;
    filteredTeachers!: any[];
    @ViewChild('closeEditModal') closeEditModal!: ElementRef;
    @ViewChild('closeTeacherModal') closeTeacherModal!: ElementRef;
    @ViewChild('closeLanguageModal') closeLanguageModal!: ElementRef;
    @ViewChild('closeCertificateModal') closeCertificateModal!: ElementRef;
    @ViewChild('imageFile') imageFile!: ElementRef;


    @ViewChild('createPostModal', { static: true }) createPostModal!: CreatePostComponent;
    // deletedLanguageId!:string;

    // For SchoolCertificate
    Certificates!: string[];

    // isSchoolFollowed!:boolean;
    constructor(injector: Injector,private route: ActivatedRoute,private domSanitizer: DomSanitizer,schoolService: SchoolService,private fb: FormBuilder,private router: Router, private http: HttpClient,private activatedRoute: ActivatedRoute) { 
      super(injector);
        this._schoolService = schoolService;

    }
  
    ngOnInit(): void {
      debugger
      this.loadingIcon = true;
      
      var selectedLang = localStorage.getItem("selectedLanguage");
      this.translate.use(selectedLang?? '');

      var id = this.route.snapshot.paramMap.get('schoolId');
      this.schoolId = id ?? '';
      // this.loadingIcon = true;

      this._schoolService.getSchoolById(this.schoolId).subscribe((response) => {
        this.school = response;
        // this.loadingIcon = false;
        this.isDataLoaded = true;
      });

      this._schoolService.getAccessibility().subscribe((response) => {
        this.accessibility = response;
      });

      this._schoolService.getLanguageList().subscribe((response) => {
        this.languages = response;
      });


      // here we call this when user click on plus icon not in ngon init try tomorrow.
      this._schoolService.getAllTeachers().subscribe((response) => {
        this.teachers = response;
      });


      this.editSchoolForm = this.fb.group({
        schoolName: this.fb.control(''),
        schoolSlogan: this.fb.control(''),
        founded: this.fb.control(''),
        accessibilityId: this.fb.control(''),
        schoolEmail: this.fb.control(''),
        description: this.fb.control(''),
        owner: this.fb.control(''),
        // avatar: this.fb.control('')
      });

      this.languageForm = this.fb.group({
        languages:this.fb.control('',[Validators.required]),
      });

      this.teacherForm = this.fb.group({
        teachers:this.fb.control('',[Validators.required]),
      });

      this.certificateForm = this.fb.group({
        certificates:this.fb.control('',[Validators.required]),
      });

      this.schoolLanguage = {
        schoolId: '',
        languageIds: []
       };

       this.deleteLanguage = {
        schoolId: '',
        languageId: ''
       };

       this.schoolTeacher = {
        schoolId: '',
        teacherIds: []
       };


       this.deleteTeacher = {
        schoolId: '',
        teacherId: ''
       };

       this.schoolCertificate = {
        schoolId:'',
        certificates:[]
       }

       this.deleteCertificate = {
        schoolId:'',
        certificateId:''
       }


       this.loadingIcon = false;
    }

    followSchool(){
      this._schoolService.saveSchoolFollower(this.school.schoolId).subscribe((response) => {
        console.log(response);
        if(response.result == "success"){
          this.isSchoolFollowed = true;
        }
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
      this.isOpenSidebar = true;
  
    }
    
    getSchoolDetails(schoolId:string){
      this._schoolService.getSchoolEditDetails(schoolId).subscribe((response) => {
        this.editSchool = response;
        this.initializeEditFormControls();
    })

    
  }

  initializeEditFormControls(){
    this.uploadImage = '';
    this.imageFile.nativeElement.value = "";
    this.fileToUpload.set('avatarImage','');
    var today = new Date();
    var dd = String(today. getDate()). padStart(2, '0');
    var mm = String(today. getMonth() + 1). padStart(2, '0'); //January is 0!
    var yyyy = today. getFullYear();
​    var currentDate = yyyy + '-' + mm + '-' + dd;

    var founded = this.editSchool.founded;
    if(founded!=null){
      founded = founded.substring(0, founded.indexOf('T'));
    }



    this.editSchoolForm = this.fb.group({
      schoolName: this.fb.control(this.editSchool.schoolName,[Validators.required]),
      schoolSlogan: this.fb.control(this.editSchool.schoolSlogan?? ''),
      founded: this.fb.control(founded,[Validators.required]),
      accessibilityId: this.fb.control(this.editSchool.accessibilityId,[Validators.required]),
      schoolEmail: this.fb.control(this.editSchool.schoolEmail,[Validators.required,Validators.pattern(this.EMAIL_PATTERN)]),
      description: this.fb.control(this.editSchool.description),
      owner: this.fb.control(this.editSchool.user.email),
      // avatar: this.fb.control(this.editSchool.avatar)
    }, {validator: this.dateLessThan('founded',currentDate)});
    this.editSchoolForm.updateValueAndValidity();
  }

  dateLessThan(from: string, to: string) {
    return (group: FormGroup): {[key: string]: any} => {
     let f = group.controls[from];
     let t = to;
     if (f.value > t) {
       return {
         dates: `Founded date should be less than Current date`
       };
     }
     return {};
    }
  }

  resetImage(){
    
  }
  updateSchool(){
    debugger
    this.isSubmitted=true;
    if (!this.editSchoolForm.valid) {
      return;
    }

    this.closeModal();

    if(!this.uploadImage){
      this.fileToUpload.append('avatar', this.editSchool.avatar);

    }

    // var foundedDate = this.editSchoolForm.get('founded')?.value;
    // foundedDate = new Date(foundedDate + 'UTC');

    this.updateSchoolDetails=this.editSchoolForm.value;
    this.fileToUpload.append('schoolId', this.school.schoolId);
    this.fileToUpload.append('schoolName', this.updateSchoolDetails.schoolName);
    this.fileToUpload.append('schoolSlogan', this.updateSchoolDetails.schoolSlogan);
    this.fileToUpload.append('founded',this.updateSchoolDetails.founded);
    this.fileToUpload.append('accessibilityId',this.updateSchoolDetails.accessibilityId);
    this.fileToUpload.append('schoolEmail',this.updateSchoolDetails.schoolEmail);
    this.fileToUpload.append('description',this.updateSchoolDetails.description);

    // here for the owner if needed

    this._schoolService.editSchool(this.fileToUpload).subscribe((response:any) => {
      // var schoolId =  response;
      // this.router.navigateByUrl(`user/schoolProfile/${schoolId}`)
      this.isSubmitted=false;
      this.fileToUpload = new FormData();
      this.ngOnInit();
    });

    
  }

  private closeModal(): void {
    debugger
    this.closeEditModal.nativeElement.click();
}

private closeCertificatesModal(): void {
  debugger
  this.closeCertificateModal.nativeElement.click();
}

private closeTeachersModal(): void {
  debugger
  this.closeTeacherModal.nativeElement.click();
}

private closeLanguagesModal(): void {
  debugger
  this.closeLanguageModal.nativeElement.click();
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
      this.schoolCertificate.certificates.push(event.target.files[0],);
  }

  filterLanguages(event:any) {
    var schoolLanguages: any[] = this.school.languages;
    var languages: any[] = this.languages;

    this.languages = languages.filter(x => !schoolLanguages.find(y => y.id == x.id));
    
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.languages.length; i++) {
      let language = this.languages[i];
      if (language.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(language);
      }
    }


    // here compare 2 list 

    // filtered = filtered.filter(function(val) {
    //   return schoolLanguages.indexOf(val) == -1;
    // });

    this.filteredLanguages = filtered;
  }

  captureLanguageId(event: any) {
    debugger
    var languageId = event.id;
    this.schoolLanguage.languageIds.push(languageId);
    // this.languageIds.push(languageId);
  }

  saveSchoolLanguages(){
    this.isSubmitted = true;
    if (!this.languageForm.valid) {
      return;
    }
    this.closeLanguagesModal();
    this.schoolLanguage.schoolId = this.school.schoolId;
    this._schoolService.saveSchoolLanguages(this.schoolLanguage).subscribe((response:any) => {
      this.isSubmitted = false;
      this.ngOnInit();
      console.log(response);

    });
  }

  getDeletedLanguage(deletedLanguage:string){
    this.deleteLanguage.languageId = deletedLanguage;
  }

  deleteSchoolLanguage(){
    this.deleteLanguage.schoolId = this.school.schoolId;
    this._schoolService.deleteSchoolLanguage(this.deleteLanguage).subscribe((response:any) => {
      this.ngOnInit();
      console.log(response);

    });

  }

  filterTeachers(event:any) {
    var schoolTeachers: any[] = this.school.teachers;
    var teachers: any[] = this.teachers;

    this.teachers = teachers.filter(x => !schoolTeachers.find(y => y.teacherId == x.teacherId));

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

  captureTeacherId(event: any) {
    debugger
    var teacherId = event.teacherId;
    this.schoolTeacher.teacherIds.push(teacherId);
    this.teacherInfo.push(event);
  }

  saveSchoolTeachers(){
    this.isSubmitted = true;
    if (!this.teacherForm.valid) {
      return;
    }
    this.closeTeachersModal();
    this.schoolTeacher.schoolId = this.school.schoolId;
    this._schoolService.saveSchoolTeachers(this.schoolTeacher).subscribe((response:any) => {
      this.isSubmitted = false;
      this.ngOnInit();
      console.log(response);

    });
  }


  getDeletedTeacher(deletedTeacher:string){
    this.deleteTeacher.teacherId = deletedTeacher;
  }

  deleteSchoolTeacher(){
    this.deleteTeacher.schoolId = this.school.schoolId;
    this._schoolService.deleteSchoolTeacher(this.deleteTeacher).subscribe((response:any) => {
      this.ngOnInit();
      console.log(response);

    });

  }

  saveSchoolCertificates(){
    debugger
    this.isSubmitted = true;
    if (!this.certificateForm.valid) {
      return;
    }
    this.closeCertificatesModal();

    for(var i=0; i<this.schoolCertificate.certificates.length; i++){
      this.certificateToUpload.append('certificates', this.schoolCertificate.certificates[i]);
   }
    this.certificateToUpload.append('schoolId', this.school.schoolId);
    this._schoolService.saveSchoolCertificates(this.certificateToUpload).subscribe((response:any) => {
      this.isSubmitted = false;
      this.schoolCertificate.certificates = [];
      this.certificateToUpload.set('certificates','');
      this.ngOnInit();
      console.log(response);

    });
  }

  getDeletedCertificate(deletedCertificate:string){
    this.deleteCertificate.certificateId = deletedCertificate;
  }

  deleteSchoolCertificate(){
    this.deleteCertificate.schoolId = this.school.schoolId;
    this._schoolService.deleteSchoolCertificate(this.deleteCertificate).subscribe((response:any) => {
      this.ngOnInit();

    });

  }

  resetCertificateModal(){
    debugger
    this.isSubmitted = false;
    this.schoolCertificate.certificates = [];
  }

  resetLanguageModal(){
    this.isSubmitted = false;
    this.languageForm.setValue({
      languages: [],
    });
    // this is unappro
    //this.schoolTeacher.teacherIds = [];
  }

  resetTeacherModal(){
    this.isSubmitted = false;
    this.teacherForm.setValue({
      teachers: [],
    });

    //this.schoolTeacher.teacherIds = [];
  }

  removeTeacher(event: any){
    debugger
    const teacherIndex = this.schoolTeacher.teacherIds.findIndex((item) => item === event.teacherId);
    if (teacherIndex > -1) {
      this.schoolTeacher.teacherIds.splice(teacherIndex, 1);
    }
  }

  removeLanguage(event: any){
    debugger
    const languageIndex = this.schoolLanguage.languageIds.findIndex((item) => item === event.id);
    if (languageIndex > -1) {
      this.schoolLanguage.languageIds.splice(languageIndex, 1);
    }
  }

  createPost(){
    this.isOpenModal = true;

  }

  openPostModal() {
    debugger
    this.createPostModal.show();
  }
}
