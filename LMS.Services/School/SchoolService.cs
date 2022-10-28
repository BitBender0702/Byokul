using AutoMapper;
using LMS.Common.ViewModels.School;
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
        private readonly UserManager<User> _userManager;
        public SchoolService(IMapper mapper, IGenericRepository<School> schoolRepository, IGenericRepository<SchoolCertificate> schoolCertificateRepository, IGenericRepository<SchoolTag> schoolTagRepository, IGenericRepository<Country> countryRepository, IGenericRepository<Specialization> specializationRepository, IGenericRepository<Language> languageRepository, IGenericRepository<SchoolUser> schoolUserRepository, IGenericRepository<SchoolFollower> schoolFollowerRepository, IGenericRepository<SchoolLanguage> schoolLanguageRepository, UserManager<User> userManager)
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
                CountryId = schoolViewModel.CountryId
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

            //if (schoolViewModel.SchoolCertificateViewModel != null)
            //{
            //    await UpdateSchoolCertificates(schoolViewModel.SchoolCertificateViewModel, school.SchoolId);
            //}

            //if (schoolViewModel.SchoolTags != null)
            //{
            //    await UpdateSchoolTags(schoolViewModel, school.CreatedById);
            //}
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


        public async Task<SchoolDetailsViewModel> GetSchoolById(Guid schoolId)
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
                Description = x.Description,
                //Country = x.Country,
                //Specialization = x.Specialization
            });

            var response = await GetAllCertificates(model.ToList());
            // here we can also add all the tags in the response if needed same as certificates.
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
        public async Task SaveSchoolFollower(SchoolFollowerViewModel schoolFollowerViewModel)
        {
            var schoolFollower = new SchoolFollower
            {
                SchoolId = schoolFollowerViewModel.SchoolId,
                UserId = schoolFollowerViewModel.UserId
            };

            _schoolFollowerRepository.Insert(schoolFollower);
            _schoolFollowerRepository.Save();
        }

        public async Task<IEnumerable<SchoolFollowerViewModel>> FollowerList()
        {
            var followerList = await _schoolFollowerRepository.GetAll()
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
    }
}
