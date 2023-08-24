using AutoMapper;
using LMS.Common.ViewModels.School;
using LMS.Data.Entity;
using LMS.DataAccess.Repository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services
{
    public class VideoLibraryService : IVideoLibraryService
    {
        private readonly IMapper _mapper;
        private IGenericRepository<VideoLibrary> _videoLibraryRepository;

        public VideoLibraryService(IMapper mapper, IGenericRepository<VideoLibrary> videoLibraryRepository)
        {
            _mapper = mapper;
            _videoLibraryRepository = videoLibraryRepository;

        }
        public async Task<List<VideoLibraryViewModel>> GetSchoolLibraryVideos(Guid schoolId)
        {
            var libraryVideos = await _videoLibraryRepository.GetAll().Where(x => x.SchoolId == schoolId).OrderByDescending(x => x.CreatedOn).ToListAsync();
            var response = _mapper.Map<List<VideoLibraryViewModel>>(libraryVideos);
            return response;
        }

        public async Task<bool> DeleteFile(Guid fileId)
        {
            var file = await _videoLibraryRepository.GetAll().Where(x => x.Id == fileId).FirstOrDefaultAsync();
            _videoLibraryRepository.Delete(file.Id);
            _videoLibraryRepository.Save();
            return true;
        }

        public async Task<VideoLibraryViewModel> SaveFile(VideoLibraryViewModel model, string createdById)
        {
            var videoLibrary = new VideoLibrary
            {
                FileName = model.FileName,
                FileUrl = model.BlobUrls.BlobUrl,
                FileThumbnail = model.BlobUrls.FileThumbnail,
                SchoolId = model.SchoolId,
                CreatedById = createdById,
                CreatedOn = DateTime.UtcNow
            };
            _videoLibraryRepository.Insert(videoLibrary);
            _videoLibraryRepository.Save();

            model.BlobUrlsJson = null;
            model.BlobUrls = null;
            model.FileName = videoLibrary.FileName;
            model.FileThumbnail = videoLibrary.FileThumbnail;
            model.Id = videoLibrary.Id;
            return model;
        }


    }
}
