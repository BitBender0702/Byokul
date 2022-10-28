using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class Add_ClassAccessibility_table : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ClassAccessibilityId",
                table: "Courses",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Courses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SchoolId",
                table: "Courses",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ServiceTypeId",
                table: "Courses",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ClassAccessibilityId",
                table: "Classes",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ClassAccessibilities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassAccessibilities", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Courses_ClassAccessibilityId",
                table: "Courses",
                column: "ClassAccessibilityId");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_SchoolId",
                table: "Courses",
                column: "SchoolId");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_ServiceTypeId",
                table: "Courses",
                column: "ServiceTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Classes_ClassAccessibilityId",
                table: "Classes",
                column: "ClassAccessibilityId");

            migrationBuilder.AddForeignKey(
                name: "FK_Classes_ClassAccessibilities_ClassAccessibilityId",
                table: "Classes",
                column: "ClassAccessibilityId",
                principalTable: "ClassAccessibilities",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Courses_ClassAccessibilities_ClassAccessibilityId",
                table: "Courses",
                column: "ClassAccessibilityId",
                principalTable: "ClassAccessibilities",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Courses_Schools_SchoolId",
                table: "Courses",
                column: "SchoolId",
                principalTable: "Schools",
                principalColumn: "SchoolId");

            migrationBuilder.AddForeignKey(
                name: "FK_Courses_ServiceTypes_ServiceTypeId",
                table: "Courses",
                column: "ServiceTypeId",
                principalTable: "ServiceTypes",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Classes_ClassAccessibilities_ClassAccessibilityId",
                table: "Classes");

            migrationBuilder.DropForeignKey(
                name: "FK_Courses_ClassAccessibilities_ClassAccessibilityId",
                table: "Courses");

            migrationBuilder.DropForeignKey(
                name: "FK_Courses_Schools_SchoolId",
                table: "Courses");

            migrationBuilder.DropForeignKey(
                name: "FK_Courses_ServiceTypes_ServiceTypeId",
                table: "Courses");

            migrationBuilder.DropTable(
                name: "ClassAccessibilities");

            migrationBuilder.DropIndex(
                name: "IX_Courses_ClassAccessibilityId",
                table: "Courses");

            migrationBuilder.DropIndex(
                name: "IX_Courses_SchoolId",
                table: "Courses");

            migrationBuilder.DropIndex(
                name: "IX_Courses_ServiceTypeId",
                table: "Courses");

            migrationBuilder.DropIndex(
                name: "IX_Classes_ClassAccessibilityId",
                table: "Classes");

            migrationBuilder.DropColumn(
                name: "ClassAccessibilityId",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "SchoolId",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "ServiceTypeId",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "ClassAccessibilityId",
                table: "Classes");
        }
    }
}
