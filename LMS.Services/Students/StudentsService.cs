using LMS.Data;
using LMS.Data.Entity;
using LMS.DataAccess.Repository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using iText.Html2pdf;
using LMS.Services.Blob;
using LMS.Services.Common;
using LMS.Common.ViewModels.Student;
using AutoMapper;
using iText.StyledXmlParser.Css.Media;
using iText.Html2pdf.Resolver.Font;
using iText.StyledXmlParser.Jsoup;
using iText.StyledXmlParser.Jsoup.Nodes;
using iText.Kernel.Pdf;

namespace LMS.Services.Students
{
    public class StudentsService : IStudentsService
    {
        private MemoryStream CertificateStream;
        private IConfiguration _config;
        private readonly IMapper _mapper;
        private readonly SignInManager<User> _signInManager;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private IGenericRepository<User> _userRepository;
        private IGenericRepository<Student> _studentRepository;
        private IGenericRepository<StudentCertificate> _studentCertificateRepository;
        private IGenericRepository<Class> _classRepository;
        private IGenericRepository<ClassStudent> _classStudentRepository;
        private DataContext _context;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IBlobService _blobService;
        private readonly ICommonService _commonService;
        public StudentsService(IConfiguration config, IMapper mapper, SignInManager<User> signInManager, UserManager<User> userManager, IGenericRepository<User> userRepository, IGenericRepository<Student> studentRepository, IGenericRepository<StudentCertificate> studentCertificateRepository, IGenericRepository<Class> classRepository, RoleManager<IdentityRole> roleManager, IGenericRepository<ClassStudent> classStudentRepository, DataContext context, IWebHostEnvironment webHostEnvironment, IBlobService blobService, ICommonService commonService)
        {
            _config = config;
            _mapper = mapper;
            _signInManager = signInManager;
            _userManager = userManager;
            _userRepository = userRepository;
            _studentRepository = studentRepository;
            _studentCertificateRepository = studentCertificateRepository;
            _classRepository = classRepository;
            _roleManager = roleManager;
            _classStudentRepository = classStudentRepository;
            _context = context;
            _webHostEnvironment = webHostEnvironment;
            _blobService = blobService;
            _commonService = commonService;
        }

        public async Task<IEnumerable<StudentViewModel>> GetAllStudents()
        {
            var studentList = await _studentRepository.GetAll().Where(x => !x.IsDeleted).ToListAsync();

            var result = _mapper.Map<IEnumerable<StudentViewModel>>(studentList);

            return result;
        }

        public async Task ClassGraduateCertificate(string userId, Guid classId, Guid providerId)
        {

        }

        public async Task SaveClassStudents(Guid classId, Guid studentId)
        {
            var classStudent = new ClassStudent
            {
                ClassId = classId,
                StudentId = studentId
            };

            _classStudentRepository.Insert(classStudent);
            _classStudentRepository.Save();
        }


        public async Task UploadStudentCertificates(UploadStudentCertificateViewModel model,string userId)
        {
            try
            {
                var certificateCreatedDate = DateTime.Parse(model.Date).ToString("dd MMM yyy");
                var path = _webHostEnvironment.ContentRootPath;
                var htmlFilePath = Path.Combine(path, "AssignedCertificates/assignedCertificate.html");
                var text = File.ReadAllText(htmlFilePath);

                text = text.Replace("[SchoolName]", model.SchoolName);
                text = text.Replace("[SchoolAvatar]", model.SchoolAvatar);
                text = text.Replace("[CertificateTitle]", model.CertificateTitle);
                text = text.Replace("[CertificateReason]", model.CertificateReason);
                text = text.Replace("[CreatedDate]", certificateCreatedDate);
                text = text.Replace("[UploadQrImage]", model.UploadQrImage);
                text = text.Replace("[UploadSignatureImage]", model.UploadSignatureImage);
                var backgroundUrl = path + model.BackgroundImage;
                text = text.Replace("[BackgroundImage]", backgroundUrl);
                var certificateImage = path + "ClientApp\\src\\assets\\images\\certificate-school.png";
                text = text.Replace("[CertificateImage]", certificateImage);

                string certificateName = "";
                var converterProperties = new ConverterProperties();             
                converterProperties.SetMediaDeviceDescription(new MediaDeviceDescription(MediaType.PRINT));
                converterProperties.SetBaseUri(_config["AppUrl"]);

                Document htmlDoc = Jsoup.Parse(text);
                htmlDoc.Head().Append("<style>" +
                        "@page { size: landscape;margin:0} " + "</style>");

                var htmlContent = htmlDoc.OuterHtml();

                string firstStudentName = model.Students[0].StudentName;
                foreach (var studentInfo in model.Students)
                {
                    var uniqueId = Guid.NewGuid();
                    var filePath = Path.Combine(path, $"AssignedCertificates/{uniqueId}.pdf");
                    htmlContent = htmlContent.Replace("[StudentName]", studentInfo.StudentName);

                    HtmlConverter.ConvertToPdf(htmlContent, new FileStream(filePath, FileMode.Create), converterProperties);
                    var wc = new System.Net.WebClient();
                    var data = wc.DownloadData(filePath);
                    var stream = new MemoryStream(data);
                    var bytes = stream.ToArray();
                    var pdfContent = Convert.ToBase64String(bytes);
                    var pdfName = model.certificateName + " Certificate.pdf";

                    string certificateUrl = await _blobService.UploadVideoAsync(stream, _config.GetValue<string>("Container:SchoolContainer"), uniqueId.ToString(), "pdf");

                    certificateName = model.certificateName;
                    await SaveStudentCertificates(certificateUrl, studentInfo.StudentId, userId, certificateName);

                    var email = await _studentRepository.GetAll().Include(x => x.User).Where(x => x.StudentId == studentInfo.StudentId).Select(x => x.User.Email).FirstAsync();

                    await _commonService.SendEmail(new List<string> { email }, null, null, "Congratulations, You receive a certificate", body: $"You received a certificate by completing the {certificateName}", pdfContent, pdfName);

                    firstStudentName = studentInfo.StudentName;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        public async Task SaveStudentCertificates(string certificateUrl,Guid? studentId, string userId,string certificateName)
        {
                var studentCertificate = new StudentCertificate
                {
                    CertificateUrl = certificateUrl,
                    StudentId = studentId,
                    CreatedById = userId,
                    CreatedOn = DateTime.UtcNow,
                    Name = certificateName
                };

                _studentCertificateRepository.Insert(studentCertificate);
                _studentCertificateRepository.Save();
        }


        }
}


