using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class Edit_Folder_table : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Folders_Classes_ClassId",
                table: "Folders");

            migrationBuilder.DropForeignKey(
                name: "FK_Folders_Courses_CourseId",
                table: "Folders");

            migrationBuilder.DropIndex(
                name: "IX_Folders_ClassId",
                table: "Folders");

            migrationBuilder.DropIndex(
                name: "IX_Folders_CourseId",
                table: "Folders");

            migrationBuilder.DropColumn(
                name: "ClassId",
                table: "Folders");

            migrationBuilder.RenameColumn(
                name: "CourseId",
                table: "Folders",
                newName: "ParentFolderId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ParentFolderId",
                table: "Folders",
                newName: "CourseId");

            migrationBuilder.AddColumn<Guid>(
                name: "ClassId",
                table: "Folders",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Folders_ClassId",
                table: "Folders",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_Folders_CourseId",
                table: "Folders",
                column: "CourseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Folders_Classes_ClassId",
                table: "Folders",
                column: "ClassId",
                principalTable: "Classes",
                principalColumn: "ClassId");

            migrationBuilder.AddForeignKey(
                name: "FK_Folders_Courses_CourseId",
                table: "Folders",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "CourseId");
        }
    }
}
