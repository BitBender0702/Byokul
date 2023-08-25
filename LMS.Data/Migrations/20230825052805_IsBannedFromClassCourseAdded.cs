using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class IsBannedFromClassCourseAdded : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsStudentBannedFromCourse",
                table: "CourseStudents",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsStudentBannedFromClass",
                table: "ClassStudents",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsStudentBannedFromCourse",
                table: "CourseStudents");

            migrationBuilder.DropColumn(
                name: "IsStudentBannedFromClass",
                table: "ClassStudents");
        }
    }
}
