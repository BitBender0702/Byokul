using AutoMapper;
using LMS.Common.ViewModels.Chat;
using LMS.Data.Entity.Chat;

namespace LMS.DataAccess.Automapper
{
    public class ChatProfile : Profile
    {
        public ChatProfile()
        {
            CreateMap<ChatMessage, ChatMessageViewModel>().ReverseMap();
            CreateMap<Attachment, AttachmentViewModel>().ReverseMap();

            CreateMap<ChatHead, ChatHeadViewModel>().ReverseMap();
        }
    }
}
