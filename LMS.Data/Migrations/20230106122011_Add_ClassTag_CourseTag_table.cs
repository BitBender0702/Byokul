using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class Add_ClassTag_CourseTag_table : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ThumbnailUrl",
                table: "Courses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ClassTags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClassId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ClassTagValue = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassTags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassTags_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "ClassId");
                });

            migrationBuilder.CreateTable(
                name: "CourseTags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CourseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CourseTagValue = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseTags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseTags_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "CourseId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClassTags_ClassId",
                table: "ClassTags",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseTags_CourseId",
                table: "CourseTags",
                column: "CourseId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClassTags");

            migrationBuilder.DropTable(
                name: "CourseTags");

            migrationBuilder.DropColumn(
                name: "ThumbnailUrl",
                table: "Courses");
        }
    }
}
