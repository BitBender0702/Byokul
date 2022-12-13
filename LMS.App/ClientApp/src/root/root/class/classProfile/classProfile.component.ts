import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AddClassCertificate } from 'src/root/interfaces/class/addClassCertificate';
import { AddClassLanguage } from 'src/root/interfaces/class/addClassLanguage';
import { AddClassTeacher } from 'src/root/interfaces/class/addClassTeacher';
import { DeleteClassCertificate } from 'src/root/interfaces/class/deleteClassCertificate';
import { DeleteClassLanguage } from 'src/root/interfaces/class/deleteClassLanguage';
import { DeleteClassTeacher } from 'src/root/interfaces/class/deleteClassTeacher';
import { EditClassModel } from 'src/root/interfaces/class/editClassModel';
import { ClassService } from 'src/root/service/class.service';
import { MultilingualComponent } from '../../sharedModule/Multilingual/multilingual.component';

@Component({
    selector: 'schoolProfile-root',
    templateUrl: './classProfile.component.html',
    styleUrls: []
  })

export class ClassProfileComponent extends MultilingualComponent implements OnInit {

    private _classService;
    class:any;
    isProfileGrid:boolean = true;
    isOpenSidebar:boolean = false;
    isOpenModal:boolean = false;
    classId!:string;

    classLanguage!:AddClassLanguage;
    classTeacher!:AddClassTeacher;
    deleteLanguage!: DeleteClassLanguage;
    deleteTeacher!: DeleteClassTeacher;

    editClass:any;
    editClassForm!:FormGroup;
    languageForm!:FormGroup;
    teacherForm!:FormGroup;
    certificateForm!:FormGroup;
    uploadImage!:any;
    updateClassDetails!:EditClassModel;
    accessibility:any;
    filteredLanguages!: any[];
    languages:any;
    filteredTeachers!: any[];
    teachers:any;
    deleteCertificate!: DeleteClassCertificate;
    classCertificate!:AddClassCertificate;
    certificateToUpload = new FormData();
    fileToUpload= new FormData();
    isSubmitted: boolean = false;
    isClassPaid!:boolean;
    disabled:boolean = true;
    currentDate!:string;

    @ViewChild('closeEditModal') closeEditModal!: ElementRef;
    @ViewChild('closeTeacherModal') closeTeacherModal!: ElementRef;
    @ViewChild('closeLanguageModal') closeLanguageModal!: ElementRef;
    @ViewChild('closeCertificateModal') closeCertificateModal!: ElementRef;
    @ViewChild('imageFile') imageFile!: ElementRef;

    // loadingIcon:boolean = false;

    isDataLoaded:boolean = false;
    // isSchoolFollowed!:boolean;
    constructor(injector: Injector,classService: ClassService,private route: ActivatedRoute,private domSanitizer: DomSanitizer,private fb: FormBuilder,private router: Router, private http: HttpClient,private activatedRoute: ActivatedRoute) { 
      super(injector);
        this._classService = classService;

    }
  
    ngOnInit(): void {

      var selectedLang = localStorage.getItem("selectedLanguage");
      this.translate.use(selectedLang?? '');

      var id = this.route.snapshot.paramMap.get('classId');
      this.classId = id ?? '';

      this._classService.getClassById(this.classId).subscribe((response) => {
        this.class = response;
        this.isDataLoaded = true;
      });

      this.editClassForm = this.fb.group({
        schoolName: this.fb.control(''),
        className: this.fb.control(''),
        noOfStudents: this.fb.control(''),
        startDate: this.fb.control(''),
        endDate: this.fb.control(''),
        accessibilityId: this.fb.control(''),
        price: this.fb.control(''),
        description: this.fb.control(''),
        languageIds:this.fb.control(''),
        serviceTypeId:this.fb.control('')

      });

       this._classService.getAccessibility().subscribe((response) => {
        this.accessibility = response;
      });
  
      this._classService.getLanguageList().subscribe((response) => {
        this.languages = response;
      });

      this._classService.getAllTeachers().subscribe((response) => {
        this.teachers = response;
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

      this.deleteLanguage = {
        classId: '',
        languageId: ''
       };

       this.deleteTeacher = {
        classId: '',
        teacherId: ''
       };
      
      this.classLanguage = {
        classId: '',
        languageIds: []
       };

       this.classTeacher = {
        classId: '',
        teacherIds: []
       };

       this.deleteCertificate = {
        classId:'',
        certificateId:''
       }

       
       this.classCertificate = {
        classId:'',
        certificates:[]
       }

    }

    getClassDetails(classId:string){
      this._classService.getClassEditDetails(classId).subscribe((response) => {
        this.editClass = response;
        this.initializeEditFormControls();
    })
    
  }

    initializeEditFormControls(){
      this.uploadImage = '';
      this.imageFile.nativeElement.value = "";
      this.fileToUpload.set('avatarImage','');

      var startDate = this.editClass.startDate;
      startDate = startDate.substring(0, startDate.indexOf('T'));

      var endDate = this.editClass.endDate;
      endDate = endDate.substring(0, endDate.indexOf('T'));

      var selectedLanguages:string[] = [];

      this.editClass.languages.forEach((item: { id: string; }) => {
        selectedLanguages.push(item.id)
      });

      this.currentDate = this.getCurrentDate();


      this.editClassForm = this.fb.group({
        schoolName: this.fb.control(this.editClass.school.schoolName),
        className: this.fb.control(this.editClass.className,[Validators.required]),
        noOfStudents: this.fb.control(this.editClass.noOfStudents,[Validators.required]),
        startDate: this.fb.control(startDate,[Validators.required]),
        endDate: this.fb.control(endDate,[Validators.required]),
        accessibilityId: this.fb.control(this.editClass.accessibilityId,[Validators.required]),
        price: this.fb.control(this.editClass.price),
        description: this.fb.control(this.editClass.description),
        languageIds:this.fb.control(selectedLanguages,[Validators.required]),
        serviceTypeId:this.fb.control(this.editClass.serviceTypeId,[Validators.required])

      }, {validator: this.dateLessThan('startDate', 'endDate',this.currentDate)});

      if(this.editClass.serviceTypeId == '0d846894-caa4-42f3-8e8a-9dba6467672b'){
        this.getPaidClass();

      }
      this.editClassForm.updateValueAndValidity();
    }

    dateLessThan(from: string, to: string, currentDate:string) {
      return (group: FormGroup): {[key: string]: any} => {
       let f = group.controls[from];
       let t = group.controls[to];
       if (f.value > t.value || f.value < currentDate) {
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
      ​  var currentDate = yyyy + '-' + mm + '-' + dd;
        return currentDate;
      }

    getDeletedLanguage(deletedLanguage:string){
      this.deleteLanguage.languageId = deletedLanguage;
    }

    getDeletedTeacher(deletedTeacher:string){
      this.deleteTeacher.teacherId = deletedTeacher;
    }

    captureLanguageId(event: any) {
      var languageId = event.id;
      this.classLanguage.languageIds.push(languageId);
      // this.languageIds.push(languageId);
    }

    filterLanguages(event:any) {
  
      var schoolLanguages: any[] = this.class.languages;
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

  
      this.filteredLanguages = filtered;
    }

    saveClassLanguages(){
      this.isSubmitted = true;
      if (!this.languageForm.valid) {
        return;
      }
      this.closeLanguagesModal();
      this.classLanguage.classId = this.class.classId;
      this._classService.saveClassLanguages(this.classLanguage).subscribe((response:any) => {
        this.isSubmitted = false;
        this.ngOnInit();
  
      });
    }

    deleteClassLanguage(){
      this.deleteLanguage.classId = this.class.classId;
      this._classService.deleteClassLanguage(this.deleteLanguage).subscribe((response:any) => {
        this.ngOnInit();
  
      });
  
    }

    captureTeacherId(event: any) {
      var teacherId = event.teacherId;
      this.classTeacher.teacherIds.push(teacherId);
    }

    filterTeachers(event:any) {
          var classTeachers: any[] = this.class.teachers;
          var teachers: any[] = this.teachers;
      
          this.teachers = teachers.filter(x => !classTeachers.find(y => y.teacherId == x.teacherId));
      
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

        saveClassTeachers(){
          this.isSubmitted = true;
          if (!this.teacherForm.valid) {
            return;
          }
          this.closeTeachersModal();
          this.classTeacher.classId = this.class.classId;
          this._classService.saveClassTeachers(this.classTeacher).subscribe((response:any) => {
            this.isSubmitted = false;
            this.ngOnInit();
      
          });
        }

        deleteClassTeacher(){
          this.deleteTeacher.classId = this.class.classId;
          this._classService.deleteClassTeacher(this.deleteTeacher).subscribe((response:any) => {
            this.ngOnInit();
      
          });
      
        }

        getDeletedCertificate(deletedCertificate:string){
          this.deleteCertificate.certificateId = deletedCertificate;
        }

        deleteClassCertificate(){
          this.deleteCertificate.classId = this.class.classId;
          this._classService.deleteClassCertificate(this.deleteCertificate).subscribe((response:any) => {
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
          debugger
            this.classCertificate.certificates.push(event.target.files[0]);
        }

        saveClassCertificates(){
          debugger
          this.isSubmitted = true;
          if (!this.certificateForm.valid) {
            return;
          }
          this.closeCertificatesModal();

          for(var i=0; i<this.classCertificate.certificates.length; i++){
            this.certificateToUpload.append('certificates', this.classCertificate.certificates[i]);
         }
          this.certificateToUpload.append('classId', this.class.classId);
          this._classService.saveClassCertificates(this.certificateToUpload).subscribe((response:any) => {
            this.isSubmitted = true;
            this.classCertificate.certificates = [];
            this.certificateToUpload.set('certificates','');
            this.ngOnInit();
      
          });
        }

        updateClass(){
          debugger
           this.isSubmitted=true;
           if (!this.editClassForm.valid) {
           return;
          }

          this.closeModal();
      
          if(!this.uploadImage){
            this.fileToUpload.append('avatar', this.editClass.avatar);
          }
      
          this.updateClassDetails=this.editClassForm.value;
          this.fileToUpload.append('classId', this.class.classId);
          this.fileToUpload.append('className', this.updateClassDetails.className);
          this.fileToUpload.append('noOfStudents', this.updateClassDetails.noOfStudents.toString());
          this.fileToUpload.append('startDate', this.updateClassDetails.startDate);
          this.fileToUpload.append('endDate', this.updateClassDetails.endDate);
          this.fileToUpload.append('price', this.updateClassDetails.price?.toString());
          this.fileToUpload.append('accessibilityId',this.updateClassDetails.accessibilityId);
          this.fileToUpload.append('languageIds',JSON.stringify(this.updateClassDetails.languageIds));
          this.fileToUpload.append('description',this.updateClassDetails.description);
          this.fileToUpload.append('serviceTypeId',this.updateClassDetails.serviceTypeId);
        
          this._classService.editClass(this.fileToUpload).subscribe((response:any) => {
            this.isSubmitted=true;
            this.fileToUpload = new FormData();
            this.ngOnInit();
          });
      
          
        }

        getFreeClass(){
          this.isClassPaid = false;
          this.editClassForm.get('price')?.removeValidators(Validators.required);
          this.editClassForm.patchValue({
            price: null,
          });
        }
      
        getPaidClass(){
          this.isClassPaid = true;
          this.editClassForm.get('price')?.addValidators(Validators.required);
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
        this.classCertificate.certificates = [];
      }

      removeTeacher(event: any){
        debugger
        const teacherIndex = this.classTeacher.teacherIds.findIndex((item) => item === event.teacherId);
        if (teacherIndex > -1) {
          this.classTeacher.teacherIds.splice(teacherIndex, 1);
        }
      }
    
      removeLanguage(event: any){
        debugger
        const languageIndex = this.classLanguage.languageIds.findIndex((item) => item === event.id);
        if (languageIndex > -1) {
          this.classLanguage.languageIds.splice(languageIndex, 1);
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

      createPost(){
        this.isOpenModal = true;
    
      }

    // followSchool(){
    //   this._schoolService.saveSchoolFollower(this.school.schoolId).subscribe((response) => {
    //     console.log(response);
    //     // here return if not work simply
    //     // this.school = response;
    //   });
    // }

    // back(): void {
    //   window.history.back();
    // }
  
    // profileGrid(){
    //   this.isProfileGrid = true;

    // }

    // profileList(){
    //   this.isProfileGrid = false;

    // }

    // openSidebar(){
    //   this.isOpenSidebar = true;
  
    // }
  
}
