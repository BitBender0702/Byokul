using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class Add_UserClassCourseFilter : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserClassCourseFilters",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ClassCourseFilterId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    ClassCourseFilterType = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserClassCourseFilters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserClassCourseFilters_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserClassCourseFilters_ClassCourseFilters_ClassCourseFilterId",
                        column: x => x.ClassCourseFilterId,
                        principalTable: "ClassCourseFilters",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserClassCourseFilters_ClassCourseFilterId",
                table: "UserClassCourseFilters",
                column: "ClassCourseFilterId");

            migrationBuilder.CreateIndex(
                name: "IX_UserClassCourseFilters_UserId",
                table: "UserClassCourseFilters",
                column: "UserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserClassCourseFilters");
        }
    }
}
