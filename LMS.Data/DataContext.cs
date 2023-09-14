using LMS.Data.Entity;
using LMS.Data.Entity.Chat;
using LMS.Data.Entity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LMS.Data.Entity.Common;
using File = LMS.Data.Entity.File;
using LMS.Data.Entity.Iyizico;

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
        public DbSet<Language> Languages { get; set; }
        public DbSet<SchoolLanguage> SchoolLanguages { get; set; }
        public DbSet<Discipline> Disciplines { get; set; }
        public DbSet<ClassDiscipline> ClassDisciplines { get; set; }
        public DbSet<ClassTeacher> ClassTeachers { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<ClassStudent> ClassStudents { get; set; }
        public DbSet<ClassLanguage> ClassLanguages { get; set; }
        public DbSet<CourseLanguage> CourseLanguages { get; set; }
        public DbSet<CourseDiscipline> CourseDisciplines { get; set; }
        public DbSet<CourseStudent> CourseStudents { get; set; }
        public DbSet<CourseTeacher> CourseTeachers { get; set; }
        public DbSet<SchoolFollower> SchoolFollowers { get; set; }
        public DbSet<SchoolUser> SchoolUsers { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<PostAttachment> PostAttachments { get; set; }
        public DbSet<PostTag> PostTags { get; set; }
        public DbSet<UserFollower> UserFollowers { get; set; }
        public DbSet<UserLanguage> UserLanguages { get; set; }
        public DbSet<SchoolDefaultLogo> SchoolDefaultLogos { get; set; }
        public DbSet<ClassCertificate> ClassCertificates { get; set; }
        public DbSet<CourseCertificate> CourseCertificates { get; set; }
        public DbSet<ClassTag> ClassTags { get; set; }
        public DbSet<CourseTag> CourseTags { get; set; }
        public DbSet<Like> Likes { get; set; }
        public DbSet<View> Views { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<UserPreference> UserPreferences { get; set; }
        public DbSet<ClassLike> ClassLikes { get; set; }
        public DbSet<CourseLike> CourseLikes { get; set; }
        public DbSet<ClassViews> ClassViews { get; set; }
        public DbSet<CourseViews> CourseViews { get; set; }
        public DbSet<ChatHead> ChatHeads { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<Attachment> Attachments { get; set; }
        public DbSet<CommentLike> CommentLikes { get; set; }
        public DbSet<NotificationSeeting> NotificationSeetings { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<UserNotificationSetting> UserNotificationSettings { get; set; }
        public DbSet<ClassCourseFilter> ClassCourseFilters { get; set; }
        public DbSet<UserClassCourseFilter> UserClassCourseFilters { get; set; }
        public DbSet<StudentCertificate> StudentCertificates { get; set; }
        public DbSet<PermissionMaster> PermissionMaster { get; set; }
        public DbSet<UserPermission> UserPermissions { get; set; }
        public DbSet<UserSharedPost> UserSharedPosts { get; set; }
        public DbSet<SavedPost> SavedPosts { get; set; }
        public DbSet<SavedClassCourse> SavedClassCourses { get; set; }
        public DbSet<Folder> Folders { get; set; }
        public DbSet<File> Files { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<UserCertificate> UserCertificates { get; set; }
        public DbSet<SchoolSubscriptionPlan> SchoolSubscriptionPlans { get; set; }
        public DbSet<SchoolTransaction> SchoolTransactions { get; set; }
        public DbSet<ClassCourseTransaction> ClassCourseTransactions { get; set; }
        public DbSet<CardUserKey> CardUserKeys { get; set; }
        public DbSet<CardRenewal> CardRenewals { get; set; }
        public DbSet<ClassCourseRating> ClassCourseRatings { get; set; }
        public DbSet<VideoLibrary> VideoLibrary { get; set; }
        public DbSet<SharedClassCourse> SharedClassCourse { get; set; }

 




    }
}
