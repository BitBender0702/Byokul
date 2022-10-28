using LMS.Data;
using LMS.Data.Entity;
using LMS.DataAccess.Repository;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services.Students
{
    public class StudentsService : IStudentsService
    {
        private IConfiguration _config;
        private readonly SignInManager<User> _signInManager;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private IGenericRepository<User> _studentRepository;
        private DataContext _context;
        public StudentsService(IConfiguration config, SignInManager<User> signInManager, UserManager<User> userManager,  IGenericRepository<User> studentRepository, RoleManager<IdentityRole> roleManager, DataContext context)
        {
            _config = config;
            _signInManager = signInManager;
            _userManager = userManager;
            _studentRepository = studentRepository;
            _roleManager = roleManager;
            _context = context;
        }

        public async Task<IEnumerable<User>> GetStudents()
        {
            var result = _studentRepository.GetAll();
            return result;
        }
    }
}
