using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class Update_SavedClassCourse : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_SavedClassCourses_ClassId",
                table: "SavedClassCourses",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_SavedClassCourses_CourseId",
                table: "SavedClassCourses",
                column: "CourseId");

            migrationBuilder.AddForeignKey(
                name: "FK_SavedClassCourses_Classes_ClassId",
                table: "SavedClassCourses",
                column: "ClassId",
                principalTable: "Classes",
                principalColumn: "ClassId");

            migrationBuilder.AddForeignKey(
                name: "FK_SavedClassCourses_Courses_CourseId",
                table: "SavedClassCourses",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "CourseId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SavedClassCourses_Classes_ClassId",
                table: "SavedClassCourses");

            migrationBuilder.DropForeignKey(
                name: "FK_SavedClassCourses_Courses_CourseId",
                table: "SavedClassCourses");

            migrationBuilder.DropIndex(
                name: "IX_SavedClassCourses_ClassId",
                table: "SavedClassCourses");

            migrationBuilder.DropIndex(
                name: "IX_SavedClassCourses_CourseId",
                table: "SavedClassCourses");
        }
    }
}
