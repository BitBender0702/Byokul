using LMS.Data.Entity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data
{
    public class DbSeed
    {
        private readonly DataContext _dataContext;
        private readonly UserManager<User> _userManager;
        public DbSeed(DataContext dataContext, UserManager<User> userManager)
        {
            _dataContext = dataContext;
            _userManager = userManager;
        }
        public async Task SeedAsync()
        {
            _dataContext.Database.EnsureCreated();
            await SeedRoles();
            await SeedUsers();
        }

        public async Task SeedRoles()
        {
            var roles = await _dataContext.Roles.CountAsync();
            if (roles == 0)
            {
                _dataContext.Roles.Add(new IdentityRole { Name = "School Owner", NormalizedName = "School Owner" });
                _dataContext.Roles.Add(new IdentityRole { Name = "Teacher", NormalizedName = "Teacher" });
                _dataContext.Roles.Add(new IdentityRole { Name = "Student", NormalizedName = "Student" });
                _dataContext.Roles.Add(new IdentityRole { Name = "Admin", NormalizedName = "Admin" });
                await _dataContext.SaveChangesAsync();
            }
        }
        public async Task SeedUsers()
        {
            var user = await _userManager.FindByEmailAsync("admin@gmail.com");
            if (user == null)
            {
                user = new User
                {
                    Email = "admin@gmail.com",
                    UserName = "admin@gmail.com",
                    FirstName = "Vepa",
                    LastName = "Durdiyev",

                    EmailConfirmed = true,
                    CreatedOn = DateTime.UtcNow
                };

                var result = await _userManager.CreateAsync(user, "Shi@1Sha@2");
                if (result == IdentityResult.Success)
                {
                    await _userManager.AddToRoleAsync(user, "Admin");
                }
            }
        }
    }
}
