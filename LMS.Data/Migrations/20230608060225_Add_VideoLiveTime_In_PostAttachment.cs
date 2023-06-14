using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class Add_VideoLiveTime_In_PostAttachment : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<float>(
                name: "VideoLiveTime",
                table: "PostAttachments",
                type: "real",
                nullable: true);

            migrationBuilder.AddColumn<float>(
                name: "VideoTotalTime",
                table: "PostAttachments",
                type: "real",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VideoLiveTime",
                table: "PostAttachments");

            migrationBuilder.DropColumn(
                name: "VideoTotalTime",
                table: "PostAttachments");
        }
    }
}
