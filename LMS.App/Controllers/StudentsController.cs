using LMS.Common.ViewModels;
using LMS.Data.Entity;
using LMS.Services.Blob;
using LMS.Services.Students;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LMS.App.Controllers
{
    [Route("students")]
    public class StudentsController : Controller
    {
        public string containerName = "Test";
        private readonly IStudentsService _studentsService;
        public StudentsController(IStudentsService studentsService)
        {
            _studentsService = studentsService;
        }
        [Route("getStudents")]
        [HttpGet]
        public async Task<IActionResult> GetStudents()
        {
            return Ok(await _studentsService.GetStudents());
        }
    }
}
