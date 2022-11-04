using AutoMapper;
using LMS.Common.ViewModels;
using LMS.Common.ViewModels.Class;
using LMS.Common.ViewModels.Course;
using LMS.Common.ViewModels.Post;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.Student;
using LMS.Common.ViewModels.Teacher;
using LMS.Data.Entity;
using LMS.DataAccess.Repository;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace LMS.Services
{
    public class SchoolService : ISchoolService
    {
        private readonly IMapper _mapper;
        private IGenericRepository<School> _schoolRepository;
        private IGenericRepository<SchoolCertificate> _schoolCertificateRepository;
        private IGenericRepository<SchoolTag> _schoolTagRepository;
        private IGenericRepository<Country> _countryRepository;
        private IGenericRepository<Specialization> _specializationRepository;
        private IGenericRepository<Language> _languageRepository;
        private IGenericRepository<SchoolUser> _schoolUserRepository;
        private IGenericRepository<SchoolFollower> _schoolFollowerRepository;
        private IGenericRepository<SchoolLanguage> _schoolLanguageRepository;
        private IGenericRepository<User> _userRepository;
        private IGenericRepository<Class> _classRepository;
        private IGenericRepository<Course> _courseRepository;
        private IGenericRepository<ClassTeacher> _classTeacherRepository;
        private IGenericRepository<CourseTeacher> _courseTeacherRepository;
        private IGenericRepository<ClassStudent> _classStudentRepository;
        private IGenericRepository<CourseStudent> _courseStudentRepository;
        private IGenericRepository<Post> _postRepository;
        private readonly UserManager<User> _userManager;
        public SchoolService(IMapper mapper, IGenericRepository<School> schoolRepository, IGenericRepository<SchoolCertificate> schoolCertificateRepository, IGenericRepository<SchoolTag> schoolTagRepository, IGenericRepository<Country> countryRepository, IGenericRepository<Specialization> specializationRepository, IGenericRepository<Language> languageRepository, IGenericRepository<SchoolUser> schoolUserRepository, IGenericRepository<SchoolFollower> schoolFollowerRepository, IGenericRepository<SchoolLanguage> schoolLanguageRepository, IGenericRepository<Class> classRepository, IGenericRepository<Course> courseRepository, IGenericRepository<ClassTeacher> classTeacherRepository, IGenericRepository<CourseTeacher> courseTeacherRepository, IGenericRepository<ClassStudent> classStudentRepository, IGenericRepository<CourseStudent> courseStudentRepository, IGenericRepository<Post> postRepository, UserManager<User> userManager)
        {
            _mapper = mapper;
            _schoolRepository = schoolRepository;
            _schoolCertificateRepository = schoolCertificateRepository;
            _schoolTagRepository = schoolTagRepository;
            _countryRepository = countryRepository;
            _specializationRepository = specializationRepository;
            _languageRepository = languageRepository;
            _schoolUserRepository = schoolUserRepository;
            _schoolFollowerRepository = schoolFollowerRepository;
            _schoolLanguageRepository = schoolLanguageRepository;
            _classRepository = classRepository;
            _courseRepository = courseRepository;
            _classTeacherRepository = classTeacherRepository;
            _courseTeacherRepository = courseTeacherRepository;
            _classStudentRepository = classStudentRepository;
            _courseStudentRepository = courseStudentRepository;
            _postRepository = postRepository;
            _userManager = userManager;
        }

        public async Task SaveNewSchool(SchoolViewModel schoolViewModel, string createdById)
        {
            var school = new School
            {
                SchoolName = schoolViewModel.SchoolName,
                Avatar = schoolViewModel.Avatar,
                CoveredPhoto = schoolViewModel.CoveredPhoto,
                Description = schoolViewModel.Description,
                CreatedById = createdById,
                CreatedOn = DateTime.UtcNow,
                SpecializationId = schoolViewModel.SpecializationId,
                CountryId = schoolViewModel.CountryId,
                SchoolUrl = schoolViewModel.SchoolUrl,

            };

            _schoolRepository.Insert(school);
            _schoolRepository.Save();
            schoolViewModel.SchoolId = school.SchoolId;

            if (schoolViewModel.LanguageIds != null)
            {
                await SaveSchoolLanguages(schoolViewModel.LanguageIds, school.SchoolId);
            }

            await AddRoleForUser(createdById, "School Owner");
        }

        async Task SaveSchoolLanguages(IEnumerable<string> languageIds, Guid schoolId)
        {
            foreach (var language in languageIds)
            {
                var schoolLanguage = new SchoolLanguage
                {
                    SchoolId = schoolId,
                    LanguageId = new Guid(language)
                };

                _schoolLanguageRepository.Insert(schoolLanguage);
                try
                {
                    _schoolLanguageRepository.Save();
                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }
        }

        async Task SaveSchoolTags(SchoolViewModel schoolViewModel, string createdById)
        {
            foreach (var tag in schoolViewModel.SchoolTags)
            {
                var schoolTag = new SchoolTag
                {
                    SchoolId = schoolViewModel.SchoolId,
                    SchoolTagValue = tag.SchoolTagValue,
                    CreatedById = createdById,
                    CreatedOn = DateTime.UtcNow,
                    IsDeleted = false
                };
                try
                {
                    _schoolTagRepository.Insert(schoolTag);
                }
                catch (Exception ex)
                {
                    throw ex;
                }
                try
                {
                    _schoolTagRepository.Save();
                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }
        }

        async Task UpdateSchoolTags(SchoolViewModel schoolViewModel, string createdById)
        {
            var schoolTags = _schoolTagRepository.GetAll().Where(x => x.SchoolId.ToString() == schoolViewModel.SchoolId.ToString()).ToList();
            if (schoolTags.Any())
            {
                _schoolTagRepository.DeleteAll(schoolTags);
            }

            await SaveSchoolTags(schoolViewModel, createdById);
        }

        async Task AddRoleForUser(string userId, string role)
        {
            var user = await _userManager.FindByIdAsync(userId);

            var userroles = await _userManager.GetUsersInRoleAsync(role);
            if (userroles.Count != 0)
            {
                var rsponse = userroles.Single(c => c.Id == userId);
                if (rsponse == null)
                {
                    await _userManager.AddToRoleAsync(user, role);
                }
            }
            else
            {
                await _userManager.AddToRoleAsync(user, role);
            }
        }

        async Task SaveSchoolCertificate(IEnumerable<SchoolCertificateViewModel> schoolCertificates, Guid schoolId)
        {
            foreach (var certificate in schoolCertificates)
            {
                var schoolCertificate = new SchoolCertificate
                {
                    CertificateUrl = certificate.CertificateUrl,
                    SchoolId = schoolId
                };
                try
                {
                    _schoolCertificateRepository.Insert(schoolCertificate);
                }
                catch (Exception ex)
                {
                    throw ex;
                }
                try
                {
                    _schoolCertificateRepository.Save();
                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }
        }

        public async Task UpdateSchool(SchoolViewModel schoolViewModel)
        {
            School school = _schoolRepository.GetById(schoolViewModel.SchoolId);
            school.SchoolName = schoolViewModel.SchoolName;
            school.Avatar = schoolViewModel.Avatar;
            school.CoveredPhoto = schoolViewModel.CoveredPhoto;
            school.Description = schoolViewModel.Description;
            school.SpecializationId = schoolViewModel.SpecializationId;
            school.CountryId = schoolViewModel.CountryId;

            _schoolRepository.Update(school);
            _schoolRepository.Save();

            if (schoolViewModel.LanguageIds != null)
            {
                await UpdateSchoolLanguages(schoolViewModel.LanguageIds, schoolViewModel.SchoolId);
            }

        }

        async Task UpdateSchoolLanguages(IEnumerable<string> languageIds, Guid schoolId)
        {
            var schoolLanguages = _schoolLanguageRepository.GetAll().Where(x => x.SchoolId == schoolId).ToList();

            if (schoolLanguages.Any())
            {
                _schoolLanguageRepository.DeleteAll(schoolLanguages);
            }
            await SaveSchoolLanguages(languageIds, schoolId);
        }

        async Task UpdateSchoolCertificates(IEnumerable<SchoolCertificateViewModel> schoolCertificateViewModel, Guid schoolId)
        {
            var schoolCertificate = _schoolCertificateRepository.GetAll().Where(x => x.SchoolId == schoolId).ToList();
            if (schoolCertificate.Any())
            {
                _schoolCertificateRepository.DeleteAll(schoolCertificate);
            }


            await SaveSchoolCertificate(schoolCertificateViewModel, schoolId);


        }


        public async Task<SchoolDetailsViewModel> GetSchoolById(Guid schoolId, string loginUserId)
        {
            SchoolDetailsViewModel model = new SchoolDetailsViewModel();
            
            if (schoolId != null)
            {
                var schoolLanguages = _schoolLanguageRepository.GetAll()
                    .Include(x => x.Language)
                    .Include(x => x.School)
                    .ThenInclude(x => x.Country)
                    .Include(x => x.School)
                    .ThenInclude(x => x.Specialization)
                    .Include(x => x.School)
                    .ThenInclude(x => x.CreatedBy)
                    .Where(x => x.SchoolId == schoolId).ToList();

                var response = _mapper.Map<SchoolDetailsViewModel>(schoolLanguages.First().School);

                var languageViewModel = new List<LanguageViewModel>();

                foreach (var res in schoolLanguages)
                {
                    languageViewModel.Add(_mapper.Map<LanguageViewModel>(res.Language));
                }

                response.Languages = languageViewModel;
                response.SchoolCertificates = await GetCertificateBySchoolId(schoolId);
                response.SchoolFollowers = await FollowerList(schoolId);
                response.Classes = await GetClassesBySchoolId(schoolId);
                response.Courses = await GetCoursesBySchoolId(schoolId);
                response.Posts = await GetPostsBySchool(schoolId, loginUserId);

                var classTeachers = await GetClassTeachersBySchoolId(schoolId);
                var courseTeachers = await GetCourseTeachersBySchoolId(schoolId);

                var schoolTeachers = classTeachers.Union(courseTeachers).DistinctBy(x => x.TeacherId).ToList();

                var classStudents = await GetClassStudentsBySchoolId(schoolId);
                var courseStudents = await GetCourseStudentsBySchoolId(schoolId);

                var schoolStudents = classStudents.Union(courseStudents).DistinctBy(x => x.StudentId).ToList();

                response.Teachers = schoolTeachers;
                response.Students = schoolStudents;

                return response;
            }
            return null;
        }

        async Task<IEnumerable<SchoolCertificateViewModel>> GetCertificateBySchoolId(Guid schoolId)
        {
            var schoolCertificate = _schoolCertificateRepository.GetAll().Where(x => x.SchoolId == schoolId).ToList();
            var response = _mapper.Map<IEnumerable<SchoolCertificateViewModel>>(schoolCertificate);
            return response;
        }
        async Task<IEnumerable<SchoolTagViewModel>> GetTagsBySchoolId(Guid schoolId)
        {
            var schoolTags = _schoolTagRepository.GetAll().Where(x => x.SchoolId == schoolId).ToList();
            var response = _mapper.Map<IEnumerable<SchoolTagViewModel>>(schoolTags);
            return response;
        }

        public async Task<IEnumerable<SchoolViewModel>> GetAllSchools()
        {
            IEnumerable<SchoolViewModel> model = _schoolRepository.GetAll().Where(x => !x.IsDeleted).Select(x => new SchoolViewModel
            {
                SchoolId = x.SchoolId,
                SchoolName = x.SchoolName,
                Avatar = x.Avatar,
                CoveredPhoto = x.CoveredPhoto,
                Description = x.Description
            });

            var response = await GetAllCertificates(model.ToList());
            return response;
        }

        public async Task<IEnumerable<SchoolViewModel>> GetAllCertificates(IEnumerable<SchoolViewModel> model)
        {
            foreach (var item in model)
            {
                var schoolCertificate = await GetCertificateBySchoolId(item.SchoolId);
                item.SchoolCertificates = schoolCertificate;
            }
            return model;
        }

        public async Task DeleteSchoolById(Guid schoolId, string deletedByid)
        {
            School school = _schoolRepository.GetById(schoolId);
            school.IsDeleted = true;
            school.DeletedById = deletedByid;
            school.DeletedOn = DateTime.UtcNow;
            _schoolRepository.Update(school);
            _schoolRepository.Save();
        }

        public async Task<IEnumerable<CountryViewModel>> CountryList()
        {
            var countryList = _countryRepository.GetAll();
            var result = _mapper.Map<IEnumerable<CountryViewModel>>(countryList);
            return result;
        }

        public async Task<IEnumerable<SpecializationViewModel>> SpecializationList()
        {
            var specializationList = _specializationRepository.GetAll();
            var result = _mapper.Map<IEnumerable<SpecializationViewModel>>(specializationList);
            return result;
        }

        public async Task<IEnumerable<LanguageViewModel>> LanguageList()
        {
            var languageList = _languageRepository.GetAll();
            var result = _mapper.Map<IEnumerable<LanguageViewModel>>(languageList);
            return result;
        }
        public async Task SaveSchoolFollower(Guid schoolId, string userId)
        {
            var schoolFollower = new SchoolFollower
            {
                SchoolId = schoolId,
                UserId = userId
            };

            _schoolFollowerRepository.Insert(schoolFollower);
            _schoolFollowerRepository.Save();
        }

        public async Task<IEnumerable<SchoolFollowerViewModel>> FollowerList(Guid schoolId)
        {
            var followerList = await _schoolFollowerRepository.GetAll().Where(x => x.SchoolId == schoolId)
                .Include(x => x.School)
                .Include(x => x.User).ToListAsync();
            var result = _mapper.Map<IEnumerable<SchoolFollowerViewModel>>(followerList);
            return result;
        }

        public async Task SaveSchoolUser(SchoolUserViewModel schoolUserViewModel)
        {
            var schoolUser = new SchoolUser
            {
                SchoolId = schoolUserViewModel.SchoolId,
                UserId = schoolUserViewModel.UserId,
                AccessLevel = schoolUserViewModel.AccessLevel
            };

            _schoolUserRepository.Insert(schoolUser);
            _schoolUserRepository.Save();

            await AddRoleForUser(schoolUser.UserId, "Teacher");
        }

        public async Task<IEnumerable<ClassViewModel>> GetClassesBySchoolId(Guid schoolId)
        {
            var classList = await _classRepository.GetAll().Where(x => x.SchoolId == schoolId).ToListAsync();

            var result = _mapper.Map<List<ClassViewModel>>(classList);
            return result;

        }

        public async Task<IEnumerable<CourseViewModel>> GetCoursesBySchoolId(Guid schoolId)
        {
            var courseList = await _courseRepository.GetAll().Where(x => x.SchoolId == schoolId).ToListAsync();

            var result = _mapper.Map<List<CourseViewModel>>(courseList);
            return result;

        }
        public async Task<IEnumerable<TeacherViewModel>> GetClassTeachersBySchoolId(Guid schoolId)
        {
            var classList = await _classRepository.GetAll().Where(x => x.SchoolId == schoolId).ToListAsync();

            var classTeachersList = await _classTeacherRepository.GetAll().Include(x => x.Teacher).Distinct().ToListAsync();

            var requiredClassList = classTeachersList.Where(x => classList.Any(y => y.ClassId == x.ClassId)).DistinctBy(x => x.TeacherId);

            var classTeachers = new List<Teacher>();
            foreach (var classTeacher in requiredClassList)
            {
                classTeachers.Add(classTeacher.Teacher);
            }

            var result = _mapper.Map<List<TeacherViewModel>>(classTeachers);
            return result;

        }

        public async Task<IEnumerable<TeacherViewModel>> GetCourseTeachersBySchoolId(Guid schoolId)
        {
            var courseList = await _courseRepository.GetAll().Where(x => x.SchoolId == schoolId).ToListAsync();

            var courseTeachersList = await _courseTeacherRepository.GetAll().Include(x => x.Teacher).Distinct().ToListAsync();

            var requiredCourseList = courseTeachersList.Where(x => courseList.Any(y => y.CourseId == x.CourseId)).DistinctBy(x => x.TeacherId);

            var courseTeachers = new List<Teacher>();
            foreach (var courseTeacher in requiredCourseList)
            {
                courseTeachers.Add(courseTeacher.Teacher);
            }

            var result = _mapper.Map<List<TeacherViewModel>>(courseTeachers);
            return result;

        }

        public async Task<IEnumerable<StudentViewModel>> GetClassStudentsBySchoolId(Guid schoolId)
        {
            var classList = await _classRepository.GetAll().Where(x => x.SchoolId == schoolId).ToListAsync();

            var classStudentsList = await _classStudentRepository.GetAll().Include(x => x.Student).Distinct().ToListAsync();

            var requiredClassList = classStudentsList.Where(x => classList.Any(y => y.ClassId == x.ClassId)).DistinctBy(x => x.StudentId);

            var classStudents = new List<Student>();
            foreach (var classStudent in requiredClassList)
            {
                classStudents.Add(classStudent.Student);
            }

            var result = _mapper.Map<List<StudentViewModel>>(classStudents);
            return result;

        }

        public async Task<IEnumerable<StudentViewModel>> GetCourseStudentsBySchoolId(Guid schoolId)
        {
            var courseList = await _courseRepository.GetAll().Where(x => x.SchoolId == schoolId).ToListAsync();

            var courseStudentsList = await _courseStudentRepository.GetAll().Include(x => x.Student).Distinct().ToListAsync();

            var requiredCourseList = courseStudentsList.Where(x => courseList.Any(y => y.CourseId == x.CourseId)).DistinctBy(x => x.StudentId);

            var courseStudents = new List<Student>();
            foreach (var courseStudent in requiredCourseList)
            {
                courseStudents.Add(courseStudent.Student);
            }

            var result = _mapper.Map<List<StudentViewModel>>(courseStudents);
            return result;

        }

        public async Task<IEnumerable<PostDetailsViewModel>> GetPostsBySchool(Guid schoolId, string loginUserId)
        {
            var courseList = await _postRepository.GetAll().Include(x => x.CreatedBy).Where(x => x.ParentId == schoolId).ToListAsync();

            var result = _mapper.Map<List<PostDetailsViewModel>>(courseList);
            var user = await _userManager.Users.Where(x => x.Id == loginUserId).FirstOrDefaultAsync();
            var role = await _userManager.GetRolesAsync(user);

            if (role.Any(x => x.Contains("School Owner")))
            {
                foreach (var post in result)
                {
                    var postDetail = await _postRepository.GetAll().Where(x => x.CreatedById == post.CreatedBy).FirstOrDefaultAsync();

                    post.Author = _mapper.Map<AuthorViewModel>(postDetail.CreatedBy);
                }
            }

            else
            {
                foreach (var post in result)
                {
                    var author = await _schoolRepository.GetAll().Where(x => x.SchoolId == post.AuthorId).FirstOrDefaultAsync();

                    post.Author = _mapper.Map<AuthorViewModel>(author);
                }
            }

            foreach (var post in result)
            {
                var owner = await _userManager.Users.Where(x => x.Id == post.CreatedBy).FirstOrDefaultAsync();
                post.Owner = _mapper.Map<OwnerViewModel>(owner);
            }

            return result;
        }
    }
}
