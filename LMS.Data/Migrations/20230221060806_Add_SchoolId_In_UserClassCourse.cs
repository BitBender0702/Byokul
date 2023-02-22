using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class Add_SchoolId_In_UserClassCourse : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "SchoolId",
                table: "UserClassCourseFilters",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserClassCourseFilters_SchoolId",
                table: "UserClassCourseFilters",
                column: "SchoolId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserClassCourseFilters_Schools_SchoolId",
                table: "UserClassCourseFilters",
                column: "SchoolId",
                principalTable: "Schools",
                principalColumn: "SchoolId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserClassCourseFilters_Schools_SchoolId",
                table: "UserClassCourseFilters");

            migrationBuilder.DropIndex(
                name: "IX_UserClassCourseFilters_SchoolId",
                table: "UserClassCourseFilters");

            migrationBuilder.DropColumn(
                name: "SchoolId",
                table: "UserClassCourseFilters");
        }
    }
}
