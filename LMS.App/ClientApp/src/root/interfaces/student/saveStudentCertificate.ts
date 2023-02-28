export interface SaveStudentCertificate
{
    certificateHtml: string;
    studentId?: string | null;
    certificateName?:string;
   students?:any[];

   schoolName:string;
   schoolAvatar:string;
   certificateTitle:string;
   certificateReason:string;
   date:Date;
   uploadSignatureImage:string;
   uploadQrImage:string;
   backgroundImage:string;

}
