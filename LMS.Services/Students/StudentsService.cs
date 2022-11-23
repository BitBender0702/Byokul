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

namespace LMS.Services.Students
{
    public class StudentsService : IStudentsService
    {
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
            var graduateStudent = await _studentRepository.GetAll().Where(x => x.UserId == userId).FirstOrDefaultAsync();

            var studentInfo = _userRepository.GetById(userId);


            var path = _webHostEnvironment.ContentRootPath;
            var fileName = Path.Combine(path, "wwwroot/certificateTemplate/template01.html");

            string text = File.ReadAllText(fileName);
            string htmlText = text.Replace("ABCD", studentInfo.Email);

            string DEST = $"D:/Projects/BYOkulLatest/Code/LMS.App/wwwroot/graduateCertificates/{studentInfo.Email}.pdf";


            HtmlConverter.ConvertToPdf(htmlText, new FileStream(DEST, FileMode.Create));

            var wc = new System.Net.WebClient();
            var data = wc.DownloadData(DEST);
            var stream = new MemoryStream(data);

            string certificateUrl = await _blobService.UploadVideoAsync(stream, "test", studentInfo.Email, "pdf");


            //now we will enter this entry in the Student certificate table.

            // here we will find the providerinfo
            var certificateProvider = _userRepository.GetById(providerId);

            // find schoolId related to the class
            var classInfo = _classRepository.GetById(classId);

            var studentCertificate = new StudentCertificate
            {
                StudentId = graduateStudent.StudentId,
                Name = "Issued for completion of X class",
                // for this find school of this class id
                SchoolId = classInfo.SchoolId,
                ProviderName = certificateProvider.FirstName,
                StudentName = graduateStudent.StudentName,
                IssueDate = DateTime.UtcNow,
                Description = "certificate description",
                CertificateUrl = certificateUrl

            };

            _studentCertificateRepository.Insert(studentCertificate);
            _studentCertificateRepository.Save();


            var pdfText = System.IO.File.ReadAllText(DEST);

            var result = await _commonService.SendEmail(new List<string> { studentInfo.Email }, null, null, subject: "Graduate Certificate", body: pdfText);


            // now delete the pdf stored in the folder.

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
    }
}


