using LMS.Common.ViewModels;
using LMS.Common.ViewModels.Student;
using LMS.Data.Entity;
using LMS.Services.Blob;
using LMS.Services.Students;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LMS.App.Controllers
{
    [Authorize]
    [Route("students")]
    public class StudentsController : BaseController
    {
        private readonly IStudentsService _studentsService;
        private readonly UserManager<User> _userManager;
        public StudentsController(IStudentsService studentsService, UserManager<User> userManager)
        {
            _studentsService = studentsService;
            _userManager = userManager;
        }
        [Route("getAllStudents")]
        [HttpGet]
        public async Task<IActionResult> GetAllStudents()
        {
            return Ok(await _studentsService.GetAllStudents());
        }

        [Route("graduateCertificate")]
        [HttpGet]
        public async Task<IActionResult> ClassGraduateCertificate()
        {
            Guid classId = new Guid("FBD30D50-4B03-42BC-10EB-08DAC173147E");
            await _studentsService.ClassGraduateCertificate("052b51ec-2d9d-4573-963a-774fef03ac30",classId,new Guid());

            return Ok();
        }

        [Route("uploadStudentCertificates")]
        [HttpPost]
        public async Task<IActionResult> UploadStudentCertificates([FromBody] UploadStudentCertificateViewModel model)
        {
            var userId = await GetUserIdAsync(this._userManager);
            await _studentsService.UploadStudentCertificates(model, userId);
            return Ok();
        }


        [Route("getSchoolStudents")]
        [HttpGet]
        public async Task<IActionResult> GetSchoolStudents(Guid id, int pageNumber, string? searchString)
        {
            return Ok(await _studentsService.GetSchoolStudents(id, pageNumber, searchString));
        }

        [Route("getClassStudents")]
        [HttpGet]
        public async Task<IActionResult> GetClassStudents(Guid id, int pageNumber, string? searchString)
        {
            return Ok(await _studentsService.GetClassStudents(id, pageNumber, searchString));
        }

        [Route("getCourseStudents")]
        [HttpGet]
        public async Task<IActionResult> GetCourseStudents(Guid id, int pageNumber, string? searchString)
        {
            return Ok(await _studentsService.GetCourseStudents(id, pageNumber, searchString));
        }
    }
}
