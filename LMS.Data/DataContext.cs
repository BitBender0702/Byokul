using LMS.Data.Entity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data
{
    public class DataContext: IdentityDbContext<User>
    {
        public DataContext(DbContextOptions<DataContext> options)
            : base(options)
        {

        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
        }
        public DbSet<School> Schools { get; set; }
        public DbSet<Teacher> Teachers { get; set; }
        public DbSet<SchoolCertificate> SchoolCertificates { get; set; }
        public DbSet<TeacherCertificate> TeacherCertificates { get; set; }
        public DbSet<SchoolTeacher> SchoolTeachers { get; set; }
        public DbSet<Class> Classes { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<SchoolTag> SchoolTags { get; set; }
        public DbSet<ServiceType> ServiceTypes { get; set; }
        public DbSet<Specialization> Specializations { get; set; }
        public DbSet<Country> Countries { get; set; }
        public DbSet<Language> Languages { get; set; }
        public DbSet<SchoolLanguage> SchoolLanguages { get; set; }
        public DbSet<Discipline> Disciplines { get; set; }
        public DbSet<ClassDiscipline> ClassDiscipline { get; set; }
        public DbSet<ClassTeacher> ClassTeachers { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<ClassStudent> ClassStudents { get; set; }
        public DbSet<ClassLanguage> ClassLanguages { get; set; }
        public DbSet<Accessibility> Accessibilities { get; set; }
        public DbSet<CourseLanguage> CourseLanguages { get; set; }
        public DbSet<CourseDiscipline> CourseDisciplines { get; set; }
        public DbSet<CourseStudent> CourseStudents { get; set; }
        public DbSet<CourseTeacher> CourseTeachers { get; set; }
        public DbSet<SchoolFollower> SchoolFollowers { get; set; }
        public DbSet<SchoolUser> SchoolUsers { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<PostAttachment> PostAttachments { get; set; }
        public DbSet<PostTag> PostTags { get; set; }
        public DbSet<City> Cities { get; set; }
    }
}
