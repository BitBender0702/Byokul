using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LMS.Data.Entity.Chat
{
    public class ChatHead 
    {
        [Key]
        public Guid Id { get; set; }
        public Guid User1 { get; set; }
        public Guid User2 { get; set; }
        public string? LastMessage{ get; set; }
        public int UnreadMessageCount { get; set; }
        public virtual List<ChatMessage> Chat { get; set; }
        public ChatType ChatType { get; set; }
        public Guid? ChatTypeId { get; set; }
        public bool IsPinnedUser1 { get; set; } = false;
        public bool IsPinnedUser2 { get; set; } = false;
    }

    public enum ChatType
    {
        Personal = 1,
        Group,
        School,
        Class,
        Course
    }
}
