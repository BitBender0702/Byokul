using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Data.Entity.Common
{
    public class SchoolClassCourseTransaction
    {
        public Guid Id { get; set; }
        public string? ActionDoneBy { get; set; }
        [ForeignKey("ActionDoneBy")]
        public User User { get; set; }
        public string? SSCOwnerId { get; set; }
        public User SSCOwner { get; set; }
        public Guid? SchoolId { get; set; }
        public School? School { get; set; }
        public Guid? ClassId { get; set; }
        public Class? Class { get; set; }
        public Guid? CourseId { get; set; }
        public Course? Course { get; set; }
        public string ConversationId { get; set; }
        public string? PaymentId { get; set; }
        public string? Message { get; set; }
        public DateTime CreatedOn { get; set; }
        public int Status { get; set; }
        public bool IsActive { get; set; }
        public int Amount { get; set; }
        public bool IsRefund { get; set; }
    }
}
