using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class Rename_Accessibilty_table : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Classes_ClassAccessibilities_ClassAccessibilityId",
                table: "Classes");

            migrationBuilder.DropForeignKey(
                name: "FK_Courses_ClassAccessibilities_ClassAccessibilityId",
                table: "Courses");

            migrationBuilder.DropTable(
                name: "ClassAccessibilities");

            migrationBuilder.RenameColumn(
                name: "ClassAccessibilityId",
                table: "Courses",
                newName: "AccessibilityId");

            migrationBuilder.RenameIndex(
                name: "IX_Courses_ClassAccessibilityId",
                table: "Courses",
                newName: "IX_Courses_AccessibilityId");

            migrationBuilder.RenameColumn(
                name: "ClassAccessibilityId",
                table: "Classes",
                newName: "AccessibilityId");

            migrationBuilder.RenameIndex(
                name: "IX_Classes_ClassAccessibilityId",
                table: "Classes",
                newName: "IX_Classes_AccessibilityId");

            migrationBuilder.CreateTable(
                name: "Accessibilities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Accessibilities", x => x.Id);
                });

            migrationBuilder.AddForeignKey(
                name: "FK_Classes_Accessibilities_AccessibilityId",
                table: "Classes",
                column: "AccessibilityId",
                principalTable: "Accessibilities",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Courses_Accessibilities_AccessibilityId",
                table: "Courses",
                column: "AccessibilityId",
                principalTable: "Accessibilities",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Classes_Accessibilities_AccessibilityId",
                table: "Classes");

            migrationBuilder.DropForeignKey(
                name: "FK_Courses_Accessibilities_AccessibilityId",
                table: "Courses");

            migrationBuilder.DropTable(
                name: "Accessibilities");

            migrationBuilder.RenameColumn(
                name: "AccessibilityId",
                table: "Courses",
                newName: "ClassAccessibilityId");

            migrationBuilder.RenameIndex(
                name: "IX_Courses_AccessibilityId",
                table: "Courses",
                newName: "IX_Courses_ClassAccessibilityId");

            migrationBuilder.RenameColumn(
                name: "AccessibilityId",
                table: "Classes",
                newName: "ClassAccessibilityId");

            migrationBuilder.RenameIndex(
                name: "IX_Classes_AccessibilityId",
                table: "Classes",
                newName: "IX_Classes_ClassAccessibilityId");

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
        }
    }
}
