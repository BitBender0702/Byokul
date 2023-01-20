using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class changed_filename_fileURL_Attachment_T : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "URL",
                table: "Attachments",
                newName: "FileURL");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Attachments",
                newName: "FileName");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "FileURL",
                table: "Attachments",
                newName: "URL");

            migrationBuilder.RenameColumn(
                name: "FileName",
                table: "Attachments",
                newName: "Name");
        }
    }
}
