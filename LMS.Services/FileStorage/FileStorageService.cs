using AutoMapper;
using LMS.Common.Enums;
using LMS.Common.ViewModels.FileStorage;
using LMS.Common.ViewModels.Post;
using LMS.Data.Entity;
using LMS.DataAccess.Repository;
using LMS.Services.Blob;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using File = LMS.Data.Entity.File;

namespace LMS.Services.FileStorage
{
    public class FileStorageService : IFileStorageService
    {
        private readonly IMapper _mapper;
        private readonly IBlobService _blobService;
        private IConfiguration _config;
        private IGenericRepository<Folder> _folderRepository;
        private IGenericRepository<File> _fileRepository;

        public FileStorageService(IMapper mapper, IBlobService blobService, IConfiguration config, IGenericRepository<Folder> folderRepository, IGenericRepository<File> fileRepository)
        {
            _mapper = mapper;
            _blobService = blobService;
            _config = config;
            _folderRepository = folderRepository;
            _fileRepository = fileRepository;
        }


        public async Task<FolderViewModel> SaveFolder(FolderViewModel model, string createdById)
        {
            var folder = new Folder
            {
                FolderName = model.FolderName,
                ParentId = model.ParentId,
                ParentFolderId = model.ParentFolderId,
                CreatedById = createdById,
                CreatedOn = DateTime.UtcNow 
            };

            _folderRepository.Insert(folder);
            _folderRepository.Save();
            model.Id = folder.Id;
            return model;
        }

        public async Task<List<FolderViewModel>> GetFolders(Guid parentId, string? searchString)
        {
            var folders = await _folderRepository.GetAll().Where(x => x.ParentId == parentId && x.ParentFolderId == null && ((string.IsNullOrEmpty(searchString)) || (x.FolderName.Contains(searchString)))).OrderByDescending(x => x.CreatedOn).ToListAsync();
            var response = _mapper.Map<List<FolderViewModel>>(folders);
            return response;
        }

        public async Task<List<FileViewModel>> SaveFiles(SaveFilesViewModel model, string createdById)
        {
            var requiredFiles = new List<File>();
            string containerName = this._config.GetValue<string>("Container:PostContainer");
            foreach (var file in model.BlobUrls)
            {
                var files = new File
                {
                    FileUrl = file.BlobUrl,
                    FileName = file.BlobName,
                    FolderId = model.FolderId,
                    FileType = (Data.Entity.Chat.FileTypeEnum)file.FileType,
                    ParentId = model.ParentId,
                    CreatedById = createdById,
                    CreatedOn = DateTime.UtcNow
                };
                _fileRepository.Insert(files);
                _fileRepository.Save();

                requiredFiles.Add(files);



            }

            //foreach (var file in model.Files)
            //{
            //    string fileUrl = await _blobService.UploadFileAsync(file, containerName,true);
            //    string fileName = file.FileName;

            //    int index = file.ContentType.IndexOf('/');
            //    if (index > 0)
            //    {
            //        if (file.ContentType.Substring(0, index) == Constants.Image)
            //        {
            //            model.FileType = FileTypeEnum.Image;
            //        }

            //        if (file.ContentType.Substring(0, index) == Constants.Video)
            //        {
            //            model.FileType = FileTypeEnum.Video;
            //        }

            //        if (file.ContentType.Substring(index + 1) == Constants.Pdf)
            //        {
            //            model.FileType = FileTypeEnum.Pdf;
            //        }

            //        if (file.ContentType.Substring(index + 1) == Constants.Word)
            //        {
            //            model.FileType = FileTypeEnum.Word;
            //        }
            //        if (file.ContentType.Substring(index + 1) == Constants.Excel)
            //        {
            //            model.FileType = FileTypeEnum.Excel;
            //        }
            //        if (file.ContentType.Substring(index + 1) == Constants.PPT)
            //        {
            //            model.FileType = FileTypeEnum.Presentation;
            //        }
            //    }

            //    var files = new File
            //    {
            //        FileUrl = fileUrl,
            //        FileName = fileName,
            //        FolderId = model.FolderId,
            //        FileType = (Data.Entity.Chat.FileTypeEnum)model.FileType,
            //        ParentId = model.ParentId,
            //        CreatedById = createdById,
            //        CreatedOn = DateTime.UtcNow
            //    };
            //    _fileRepository.Insert(files);
            //    _fileRepository.Save();

            //    requiredFiles.Add(files);



            //}

            var response = _mapper.Map<List<FileViewModel>>(requiredFiles);
            return response;

        }

        public async Task<List<FileViewModel>> GetFiles(Guid parentId, string? searchString)
        {
            var files = await _fileRepository.GetAll().Where(x => x.ParentId == parentId && x.FolderId == null && ((string.IsNullOrEmpty(searchString)) || (x.FileName.Contains(searchString)))).OrderByDescending(x => x.CreatedOn).ToListAsync();
            var response = _mapper.Map<List<FileViewModel>>(files);
            return response;
        }

        public async Task<NestedFoldersViewModel> GetNestedFolders(Guid folderId, string? searchString)
        {
            var nestedFolders = new NestedFoldersViewModel();
            var folders = await _folderRepository.GetAll().Where(x => x.ParentFolderId == folderId && ((string.IsNullOrEmpty(searchString)) || (x.FolderName.Contains(searchString)))).OrderByDescending(x => x.CreatedOn).ToListAsync();

            var firstFolderFiles = await _fileRepository.GetAll().Where(x => x.FolderId == folderId && ((string.IsNullOrEmpty(searchString)) || (x.FileName.Contains(searchString)))).OrderByDescending(x => x.CreatedOn).ToListAsync();
            nestedFolders.Folders.AddRange(_mapper.Map<List<FolderViewModel>>(folders));
            nestedFolders.Files.AddRange(_mapper.Map<List<FileViewModel>>(firstFolderFiles));
            return nestedFolders;
        }

        public async Task<List<FileAttachmentViewModel>> GetAttachments(string userId)
        {
            var attachments = await _fileRepository.GetAll().Where(x => (int)x.FileType == (int)FileTypeEnum.Pdf && x.CreatedById == userId).Select(x => new FileAttachmentViewModel
            {
                FileName = x.FileName,
                FileUrl = x.FileUrl
            }).ToListAsync();

            return attachments;
        }

        public async Task<bool> IsFolderNameExist(string folderName, Guid parentId, Guid? parentFolderId)
        {
            if (parentFolderId == new Guid())
            {
                parentFolderId = null;
            }
            var result = await _folderRepository.GetAll().Where(x => x.FolderName.ToLower() == folderName.ToLower() && x.ParentId == parentId && x.ParentFolderId == parentFolderId).ToListAsync();

            if (result.Count == 1)
            {
                return true;
            }
            bool hasDuplicateProperty = result.GroupBy(x => x.ParentFolderId)
                                              .Any(g => g.Count() > 1);

            if (hasDuplicateProperty)
            {
                return true;
            }
            else
            {
                return false;
            }


            //foreach (var item in result)
            //{
            //   var isFolderExist = result.Any(x => x.ParentFolderId == result.First().ParentId);

            //}
            //if (result != null)
            //{
            //    return true;
            //}
            //return false;
        }

        public async Task<string> DeleteFolder(Guid folderId)
        {
            var isFolderParent = await _folderRepository.GetAll().AnyAsync(x => x.ParentFolderId == folderId);
            var isFileParent = await _fileRepository.GetAll().AnyAsync(x => x.FolderId == folderId);
            if (isFolderParent || isFileParent)
            {
                return Constants.FolderCantDeleted;
            }
            var folder = await _folderRepository.GetAll().Where(x => x.Id == folderId).FirstOrDefaultAsync();
            _folderRepository.Delete(folder.Id);
            _folderRepository.Save();
            return Constants.FolderDeleted;
        }

        public async Task<bool> DeleteFile(Guid fileId)
        {
            var file = await _fileRepository.GetAll().Where(x => x.Id == fileId).FirstOrDefaultAsync();
            _fileRepository.Delete(file.Id);
            _fileRepository.Save();
            return true;
        }




    }
}
