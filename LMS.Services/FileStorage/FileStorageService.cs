using AutoMapper;
using LMS.Common.Enums;
using LMS.Common.ViewModels.FileStorage;
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

        public async Task<List<FolderViewModel>> GetFolders(Guid parentId)
        {
            var folders = await _folderRepository.GetAll().Where(x => x.ParentId == parentId && x.ParentFolderId == null).OrderByDescending(x => x.CreatedOn).ToListAsync();
            var response = _mapper.Map<List<FolderViewModel>>(folders);
            return response;
        }

        public async Task<List<FileViewModel>> SaveFiles(SaveFilesViewModel model, string createdById)
        {
            var requiredFiles = new List<File>();
            string containerName = this._config.GetValue<string>("Container:SchoolContainer");

            foreach (var file in model.Files)
            {
                string fileUrl = await _blobService.UploadFileAsync(file, containerName);
                string fileName = file.FileName;

                int index = file.ContentType.IndexOf('/');
                if (index > 0)
                {
                    if (file.ContentType.Substring(0, index) == "video")
                    {
                        model.FileType = FileTypeEnum.Video;
                    }
                    else
                    {
                        model.FileType = FileTypeEnum.Image;
                    }
                }

                var files = new File
                {
                    FileUrl = fileUrl,
                    FileName = fileName,
                    FolderId = model.FolderId,
                    FileType = (Data.Entity.Chat.FileTypeEnum)model.FileType,
                    ParentId = model.ParentId,
                    CreatedById = createdById,
                    CreatedOn = DateTime.UtcNow
                };
                _fileRepository.Insert(files);
                _fileRepository.Save();

                requiredFiles.Add(files);



            }

            var response = _mapper.Map<List<FileViewModel>>(requiredFiles);
            return response;

        }

        public async Task<List<FileViewModel>> GetFiles(Guid parentId)
        {
            var files = await _fileRepository.GetAll().Where(x => x.ParentId == parentId && x.FolderId == null).OrderByDescending(x => x.CreatedOn).ToListAsync();
            var response = _mapper.Map<List<FileViewModel>>(files);
            return response;
        }

        public async Task<NestedFoldersViewModel> GetNestedFolders(Guid folderId)
        {
            var nestedFolders = new NestedFoldersViewModel();
            var folders = await _folderRepository.GetAll().Where(x => x.ParentFolderId == folderId).OrderByDescending(x => x.CreatedOn).ToListAsync();

            var firstFolderFiles = await _fileRepository.GetAll().Where(x => x.FolderId == folderId).OrderByDescending(x => x.CreatedOn).ToListAsync();
            nestedFolders.Folders.AddRange(_mapper.Map<List<FolderViewModel>>(folders));
            nestedFolders.Files.AddRange(_mapper.Map<List<FileViewModel>>(firstFolderFiles));
            return nestedFolders;
        }


    }
}
