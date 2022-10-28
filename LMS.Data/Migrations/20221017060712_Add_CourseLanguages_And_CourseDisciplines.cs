using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class Add_CourseLanguages_And_CourseDisciplines : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CourseDisciplines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CourseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DisciplineId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseDisciplines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseDisciplines_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "CourseId");
                    table.ForeignKey(
                        name: "FK_CourseDisciplines_Disciplines_DisciplineId",
                        column: x => x.DisciplineId,
                        principalTable: "Disciplines",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CourseLanguages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CourseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LanguageId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseLanguages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseLanguages_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "CourseId");
                    table.ForeignKey(
                        name: "FK_CourseLanguages_Languages_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "Languages",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_CourseDisciplines_CourseId",
                table: "CourseDisciplines",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseDisciplines_DisciplineId",
                table: "CourseDisciplines",
                column: "DisciplineId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseLanguages_CourseId",
                table: "CourseLanguages",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseLanguages_LanguageId",
                table: "CourseLanguages",
                column: "LanguageId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CourseDisciplines");

            migrationBuilder.DropTable(
                name: "CourseLanguages");
        }
    }
}
