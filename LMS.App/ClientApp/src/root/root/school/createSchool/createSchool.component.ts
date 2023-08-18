import { Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, ValidatorFn, Validators } from '@angular/forms';
import { CreateSchoolModel } from 'src/root/interfaces/school/createSchoolModel';
import { SchoolService } from 'src/root/service/school.service';
import { HttpClient, HttpEventType, HttpHeaders } from "@angular/common/http";
import { StepsModule } from 'primeng/steps';
import { MenuItem, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MultilingualComponent, changeLanguage } from '../../sharedModule/Multilingual/multilingual.component';
import { Subject, Subscription } from 'rxjs';
import { environment } from "src/environments/environment";
import { BsModalService } from 'ngx-bootstrap/modal';
import { SharePostComponent } from '../../sharePost/sharePost.component';
import { OpenSideBar } from 'src/root/user-template/side-bar/side-bar.component';
import { TranslateService } from '@ngx-translate/core';
import { Dimensions, ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { CountryISO, SearchCountryField } from 'ngx-intl-tel-input';
import { AzureBlobStorageService } from 'src/root/service/blobStorage.service';
import { BlobServiceClient, ContainerClient, BlockBlobClient } from '@azure/storage-blob';
import { url } from 'inspector';
import { IyizicoService } from 'src/root/service/iyizico.service';
import { Constant } from 'src/root/interfaces/constant';


import { DatePipe } from '@angular/common';

import flatpickr from 'flatpickr';

export const ownedSchoolResponse = new Subject<{ schoolId: string, schoolAvatar: string, schoolName: string, action: string }>();

@Component({
  selector: 'students-Home',
  templateUrl: './createSchool.component.html',
  styleUrls: ['./createSchool.component.css'],
  providers: [MessageService]
})

export class CreateSchoolComponent extends MultilingualComponent implements OnInit, OnDestroy {

  get apiUrl(): string {
    return environment.apiUrl;
  }

  uploadedFile: any;
  private _schoolService;
  
  private _blobService;
  private _iyizicoService;
  countries: any;
  specializations: any;
  defaultLogos: any;
  languages: any;
  school!: CreateSchoolModel;
  createSchoolForm!: FormGroup;
  createSchoolForm1!: FormGroup;
  createSchoolForm2!: FormGroup;
  createSchoolForm3!: FormGroup;
  subscriptionForm!: FormGroup;
  invalidMeetingName!: boolean;
  isSubmitted: boolean = false;
  isStepCompleted: boolean = false;
  uploadImage!: any;
  uploadImageName!: string;
  fileToUpload = new FormData();
  logoUrl!: string;
  items!: MenuItem[];
  step: number = 0;
  isOpenSidebar: boolean = false;
  isOpenModal: boolean = false;
  avatarImage!: any;

  initialSpecialization!: string;
  loadingIcon: boolean = false;
  schoolUrl!: string;
  schoolId!: string;
  schoolName!: string;
  changeLanguageSubscription!: Subscription;
  @ViewChild('textarea') textarea!: ElementRef;

  imageChangedEvent: any = '';
  croppedImage: any = '';
  canvasRotation = 0;
  rotation = 0;
  scale = 1;
  showCropper = false;
  containWithinAspectRatio = false;
  transform: ImageTransform = {};
  selectedImage: any = '';
  isSelected: boolean = false;

  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  maxLength = "15";
  // PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  selectedCountryISO: any;
  accountNumberMask: string = "0000-0000-0000-0000";
  monthYearMask: string = "00-00"
  subscriptionPlans: any;
  currentDate!: string;
  EMAIL_PATTERN = '[a-zA-Z0-9]+?(\\.[a-zA-Z0-9]+)*@[a-zA-Z]+\\.[a-zA-Z]{2,3}';



  constructor(injector: Injector,  private datePipe: DatePipe, private iyizicoService: IyizicoService, private blobService: AzureBlobStorageService, private translateService: TranslateService, private bsModalService: BsModalService, public messageService: MessageService, private domSanitizer: DomSanitizer, private router: Router, private fb: FormBuilder, schoolService: SchoolService, private http: HttpClient) {
    super(injector);
    this._schoolService = schoolService;
    this._blobService = blobService;
    this._iyizicoService = iyizicoService;
  }

  ngOnInit(): void {
    debugger
    this.currentDate = this.getCurrentDate();
    this.selectedCountryISO = CountryISO.Turkey;
    this.step = 0;
    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this.translate.use(this.selectedLanguage);

    this.items = [
      { label: "" },
      { label: "" }
    ];

    this._schoolService.getDefaultLogo().subscribe((response) => {
      debugger;
      this.defaultLogos = response;
    });

    this._schoolService.getCountryList().subscribe((response) => {
      this.countries = response;
    });

    this._schoolService.getSpecializationList().subscribe((response) => {
      this.specializations = response;
    });

    this._schoolService.getLanguageList().subscribe((response) => {
      this.languages = response;
    });

    this._iyizicoService.getSubscriptionPlans().subscribe((response) => {
      debugger
      this.subscriptionPlans = response;
    });


    this.createSchoolForm1 = this.fb.group({
      schoolName: this.fb.control('', [Validators.required]),
      countryName: this.fb.control('', [Validators.required]),
      specializationId: this.fb.control('', [Validators.required]),
      schoolSlogan: this.fb.control(''),
      founded: this.fb.control('', [Validators.required]),
      accessibilityId: this.fb.control('', [Validators.required]),
      schoolEmail: this.fb.control('', [
        Validators.pattern(this.EMAIL_PATTERN),
      ]),
      description: this.fb.control(''),
      selectedLanguages: this.fb.control('', [Validators.required]),
      phoneNumber: ['', [Validators.required]],
      }
    );

    var founded = this.createSchoolForm1.get("founded")?.value;
    if (founded != null) {
      founded = founded.substring(0, founded.indexOf('T'));
      founded = this.datePipe.transform(founded, 'MM/dd/yyyy');
    }

    flatpickr('#founded', {
      minDate: "1903-12-31",
      maxDate: new Date(),
      dateFormat: "m/d/Y",
      defaultDate: founded
    });


    this._schoolService.getAccessibility().subscribe((response) => {
      this.visibility = response;
    });
    // this.createSchoolForm1.get("phoneNumber")?.valueChanges.subscribe(value => {
    //   // Apply custom formatting logic to the phone number
    //   this.formatPhoneNumber2(value);
    // });

    this.createSchoolForm3 = this.fb.group({
      schoolUrl: this.fb.control('', [Validators.required]),
    });
    this.createSchoolForm2 = this.fb.group({
      defaultAvatar: this.fb.control(''),
    });

    if (!this.changeLanguageSubscription) {
      this.changeLanguageSubscription = changeLanguage.subscribe(response => {
        this.translate.use(response.language);
      })
    }

    this.subscriptionForm = this.fb.group({
      cardNumber: this.fb.control('', [Validators.required, Validators.minLength(16)]),
      expiresOn: this.fb.control('', [Validators.required, Validators.minLength(4)]),
      securityCode: this.fb.control('', [Validators.required]),
      accountHolderName: this.fb.control('', [Validators.required]),
      subscriptionReferenceId: this.fb.control('', [Validators.required])
    },
      { validator: this.isValidExpiresOn('expiresOn', this.currentDate) }
    )
  }

  visibility:any;

  ngOnDestroy(): void {
    if (this.changeLanguageSubscription) {
      this.changeLanguageSubscription.unsubscribe();
    }
  }

  copyMessage(inputElement: any) {
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
    const translatedInfoSummary = this.translateService.instant('Success');
    const translatedMessage = this.translateService.instant('CopiedToClipboard');
    this.messageService.add({ severity: 'success', summary: translatedInfoSummary, life: 3000, detail: translatedMessage });
  }

  handleDefaultImageInput(url: string) {
    debugger;
    this.logoUrl = url;
  }

  handleImageInput(event: any) {
    debugger
    this.fileToUpload.append("avatarImage", event.target.files[0], event.target.files[0].name);
    this.uploadImageName = event.target.files[0].name;
    const reader = new FileReader();
    reader.onload = (_event) => {
      this.uploadImage = _event.target?.result;
      this.uploadImage = this.domSanitizer.bypassSecurityTrustUrl(this.uploadImage);
    }
    reader.readAsDataURL(event.target.files[0]);
    this.avatarImage = this.fileToUpload.get('avatarImage');

  }

  createSchool() {
    this.isSubmitted = true;
    if (!this.createSchoolForm3.valid) {
      return;
    }

    this.loadingIcon = true;
    this.router.navigateByUrl(`profile/school/${this.schoolName.replace(" ", "").toLowerCase()}`)
  }

  back(): void {
    window.history.back();
  }

  forwardStep() {
    debugger
    this.isStepCompleted = true;
    if (!this.createSchoolForm1.valid) {
      return;
    }

    var schoolName = this.createSchoolForm1.get('schoolName')?.value;

    var isSchoolnameExist;


    var form1Value = this.createSchoolForm1.value;
    this.schoolName = form1Value.schoolName.split(' ').join('');
    this._schoolService.isSchoolNameExist(schoolName).subscribe((response:any) => {
      debugger
      if(response.result == Constant.SchoolNameExist){
        this.createSchoolForm1.setErrors({ unauthenticated: true });
        return;
      }
      else {
        let value = this.textarea.nativeElement.value;
        this.fileToUpload.append('schoolName', form1Value.schoolName);
        this.fileToUpload.append('description', value);
        this.fileToUpload.append('phoneNumber', form1Value.phoneNumber.number)
        // this.fileToUpload.append('countryId',form1Value.countryId);
        this.fileToUpload.append('countryName', form1Value.countryName);
        this.fileToUpload.append('specializationId', form1Value.specializationId);

        this.fileToUpload.append('schoolSlogan', form1Value.schoolSlogan);
        this.fileToUpload.append('accessibilityId', form1Value.accessibilityId);
        this.fileToUpload.append('founded', form1Value.founded);
        this.fileToUpload.append('schoolEmail', form1Value.schoolEmail);

        this.fileToUpload.append('languageIds', JSON.stringify(form1Value.selectedLanguages));
        this.schoolUrl = `${this.apiUrl}/profile/school` + form1Value.schoolName.replace(" ", "").toLowerCase();
        this.step += 1;
        this.isStepCompleted = false;
        debugger;
      }
    });

    this.createSchoolForm3.patchValue({
      schoolUrl: `${this.apiUrl}/profile/school/` + form1Value.schoolName.split(' ').join('').toLowerCase(),
    });
  }

  forwardStep2() {
    debugger
    this.isStepCompleted = true;
    if (this.logoUrl == undefined && this.avatarImage == undefined) {
      return;
    }
    var form2Value = this.createSchoolForm2.value;
    this.fileToUpload.append('avatar', this.logoUrl);

    this.fileToUpload.append("avatarImage", this.selectedImage);

    this.fileToUpload.append('schoolUrl', JSON.stringify(this.schoolUrl));


    //
    this.step += 1;
    this.isStepCompleted = false;

    // this._schoolService.createSchool(this.fileToUpload).subscribe((response:any) => {
    //      var schoolId =  response;
    //      this.schoolId = schoolId;
    //      this.loadingIcon = false;
    //      var form1Value =this.createSchoolForm1.value;
    //      ownedSchoolResponse.next({schoolId:response.schoolId, schoolAvatar:response.avatar, schoolName:response.schoolName,action:"add"});
    //      this.step += 1;
    //      this.isStepCompleted = false;
    //      this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'School created successfully'});
    // });


  }

  paymentConfirmationWindow:any;
  subscriptionStep(){
    debugger
    this.isStepCompleted = true;
    if (!this.subscriptionForm.valid) {
      return;
    }

    this.loadingIcon = true;

    var formValues = this.subscriptionForm.value;
    var subscriptionDetails = {
      cardNumber: formValues.cardNumber,
      expiresOn: formValues.expiresOn,
      securityCode: formValues.securityCode,
      accountHolderName: formValues.accountHolderName,
      subscriptionReferenceId: formValues.subscriptionReferenceId
    }
    this.fileToUpload.append('SubscriptionDetailsJson', JSON.stringify(subscriptionDetails));

    this._schoolService.createSchool(this.fileToUpload).subscribe((response:any) => {
      if(response.subscriptionDetails.isInternationalUser){
        this.paymentConfirmationWindow = window.open("","_blank", "width=500,height=300");
        this.paymentConfirmationWindow?.document.write(response.subscriptionDetails.subscriptionMessage);
      }
      
         var schoolId =  response;
         this.schoolId = schoolId;
         this.loadingIcon = false;
         var form1Value =this.createSchoolForm1.value;
         ownedSchoolResponse.next({schoolId:response.schoolId, schoolAvatar:response.avatar, schoolName:response.schoolName,action:"add"});
         this.step += 1;
         this.isStepCompleted = false;

         if(response.subscriptionDetails.subscriptionMessage == Constant.Success){
          this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'School created successfully'});
         }
         else{
          if(!response.subscriptionDetails.isInternationalUser){
          this.messageService.add({severity:'info', summary:'Info',life: 3000, detail:response.subscriptionDetails.subscriptionMessage});         
          }
         }
    });

  }

  backStep() {
    this.step -= 1;
  }

  openSidebar() {
    OpenSideBar.next({ isOpenSideBar: true })
  }

  createPost() {
    this.isOpenModal = false;

  }

  schoolProfile() {
    window.open(`profile/school/${this.schoolName.replace(" ", "").toLowerCase()}`, '_blank');
  }

  removeUploadImage() {
    this.uploadImage = null;
    this.fileToUpload.set('avatarImage', '');
    this.avatarImage = undefined;

  }

  openSharePostModal(): void {
    debugger
    const initialState = {
      schoolName: this.schoolName
    };
    this.bsModalService.show(SharePostComponent, { initialState });
  }



  // phoneFormatter(event : Event) {
  //   debugger
  //   const phoneNumberControl = this.createSchoolForm1.get('phoneNumber');
  //   let phoneNumber = phoneNumberControl?.value;

  //   phoneNumber = phoneNumber.replace(/\D/g, ''); // Remove all non-digit characters

  //   if (phoneNumber.length > 11) {
  //     phoneNumber = phoneNumber.substr(0, 11);
  //   }

  //   // Format the phone number
  //   if (phoneNumber.length >= 1) {
  //     phoneNumber = `+${phoneNumber}`;
  //   }
  //   if (phoneNumber.length >= 3) {
  //     phoneNumber = `${phoneNumber.substr(0, 3)} (${phoneNumber.substr(3)}`;
  //   }
  //   if (phoneNumber.length >= 7) {
  //     phoneNumber = `${phoneNumber.substr(0, 7)}) ${phoneNumber.substr(7)}`;
  //   }
  //   if (phoneNumber.length >= 12) {
  //     phoneNumber = `${phoneNumber.substr(0, 12)} ${phoneNumber.substr(12)}`;
  //   }

  //   phoneNumberControl?.setValue(phoneNumber);

  //   // Remove parentheses and space when backspace is pressed
  //   if (phoneNumber.length > 0 && phoneNumber.length < 3) {
  //     phoneNumberControl?.setValue(phoneNumber.replace(/[\s()-]/g, ''));
  //   }
  //   if (phoneNumber.length >= 3 && phoneNumber.length < 7) {
  //     phoneNumberControl?.setValue(phoneNumber.replace(/[\s)]/g, ''));
  //   }
  //   if (phoneNumber.length >= 7 && phoneNumber.length < 12) {
  //     phoneNumberControl?.setValue(phoneNumber.replace(/[\s]/g, ''));
  //   }
  // }

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

  onFileChange(event: any): void {
    debugger
    this.isSelected = true;
    this.imageChangedEvent = event;
  }

  changeCountryIsoCode(event: any) {
    var countryName = event.value;
    this.selectedCountryISO = CountryISO[countryName as keyof typeof CountryISO];

  }

  onPhoneNumberChange(value: any) {
    debugger
    var phoneNumber = this.formatPhoneNumber(value.number);
    this.createSchoolForm1.get("phoneNumber")?.setValue(phoneNumber);
    // this.propagateChange(this.phoneNumber);
  }

  formatPhoneNumber(value: string): string {
    if (!value) {
      return '';
    }
    // Remove all non-digit characters
    const cleanedValue = value.replace(/\D/g, '');
    // Apply the desired format
    const areaCode = cleanedValue.slice(0, 3);
    const middlePart = cleanedValue.slice(3, 6);
    const lastPart = cleanedValue.slice(6, 10);
    return `(${areaCode}) ${middlePart}-${lastPart}`;
  }

  previousString: string = "";

  // formatPhoneNumber2(test:any) {
  //   debugger
  //   if(this.previousString == "" || this.previousString != test.number){

  //   let value = test.number;
  //   // Remove any non-digit characters from the phone number
  //   value = value.replace(/\D/g, '');

  //   // Apply the desired format (xxx) xxx-xxxx
  //   const formattedValue = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
  //   this.previousString = formattedValue;
  //   // Update the phone number field with the formatted value
  //   this.createSchoolForm1.get("phoneNumber")?.setValue(formattedValue, { emitEvent: false });
  // }
  // }

  formatPhoneNumber2(test: any) {
    debugger
    if (this.previousString === '' || this.previousString !== test.number) {
      const value = test.number;
      // Remove any non-digit characters from the phone number
      const digitsOnly = value.replace(/\D/g, '');

      let formattedValue = '';

      if (digitsOnly.length <= 3) {
        // Format as (xxx)
        formattedValue = `(${digitsOnly.slice(0, 3)})`;
      } else if (digitsOnly.length <= 6) {
        // Format as (xxx) xxx
        formattedValue = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}`;
      } else {
        // Apply the desired format (xxx) xxx-xxxx
        formattedValue = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
      }

      this.previousString = formattedValue;
      // Update the phone number field with the formatted value
      this.createSchoolForm1.get('phoneNumber')?.setValue(formattedValue, { emitEvent: false });
    }
  }

  onFileSelected(event: any) {
    this.uploadedFile = event.target.files[0];
  }

  uploadOnBlob() {
    debugger
    const containerName = 'posts';
    const fileName = this.uploadedFile.name;

    const selectedFile: File = this.uploadedFile;
    this.uploadFile1(selectedFile);

    // this._blobService.uploadFile(containerName, fileName, this.uploadedFile)
    //   .then(() => {
    //     console.log('File uploaded successfully.');
    //   })
    //   .catch((error) => {
    //     console.error('Error uploading file:', error);
    //   });
  }

  async uploadFile1(file: File) {
    debugger

    // Replace with your SAS token or connection string
    const sasToken = '?sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2023-07-28T13:40:03Z&st=2023-07-28T05:40:03Z&spr=https&sig=zRI9R2hIEQ1R2ldT7h4eQOECnrP35PXiElqbbHLmcGI%3D';
    const blobName = file.name;
    const blobStorageName = "byokulstorage";
    var containerClient = new BlobServiceClient(`https://${blobStorageName}.blob.core.windows.net?${sasToken}`)
      .getContainerClient("posts");

    this.uploadBlobTest(file, blobName, containerClient)
      .then((response) => {
        debugger
        console.log(response);
      })
      .catch((error) => {
        console.error(error);
      });

  }

  private async uploadBlobTest(content: Blob, name: string, client: ContainerClient) {
    debugger
    try {
      let blockBlobClient = client.getBlockBlobClient(name);
      // blockBlobClient.uploadData(content, { blobHTTPHeaders: { blobContentType: content.type } })

      await blockBlobClient.uploadData(content, { blobHTTPHeaders: { blobContentType: content.type } });

      const blobUrl = blockBlobClient.url;
      console.log('File uploaded successfully.');

      return { success: true, message: 'File uploaded successfully' };
    } catch (error) {
      console.error('Error uploading file:', error);

      return { success: false, message: 'Error uploading file: ' + error };
    }
  }

  omit_special_char(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }

  formatCardNumber(event: any) {
    const input = event.target as HTMLInputElement;
    let trimmed = input.value.replace(/[\s|-]/g, '');
    trimmed = trimmed.slice(0, 16);
    const chunks = trimmed.match(/.{1,4}/g);
    input.value = chunks?.join('-') ?? '';
  }

  formatMonthYear(event: any) {
    const input = event.target as HTMLInputElement;
    let trimmed = input.value.replace(/[\s|-]/g, '');
    trimmed = trimmed.slice(0, 4);
    const chunks = trimmed.match(/.{1,2}/g);
    input.value = chunks?.join('-') ?? '';
  }

  getCurrentDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear().toString().slice(-2);
    var currentDate = mm + '-' + yyyy;
    return currentDate;
  }

  isValidExpiresOn(expiresOn: string, currentDate: string) {
    return (group: FormGroup): { [key: string]: any } => {
      debugger
      let monthYear = group.controls[expiresOn].value;
      if (monthYear.length == 5) {

        const month = expiresOn.substring(0, 2);
        const year = expiresOn.substring(expiresOn.length - 2);
        // const yearIndex = monthYear.indexOf('-');
        // const year = monthYear.substring(yearIndex + 1);

        const currentYearIndex = currentDate.indexOf('-');
        const currentYear = currentDate.substring(currentYearIndex + 1);

        // const monthIndex = monthYear.indexOf('-');
        // const month = monthYear.substring(0, monthIndex);

        const currentMonthIndex = currentDate.indexOf('-');
        const currentMonth = currentDate.substring(0, currentMonthIndex);

        if (year < currentYear || (year == currentYear && month < currentMonth) || month > "12") {
          return { dates: `Please enter valid expiresOn` };
        }
      }
      return {};
    }
  }
  get schoolEmailValue(): string {
    return this.createSchoolForm1.get('schoolEmail')?.value;
  }
  

}
