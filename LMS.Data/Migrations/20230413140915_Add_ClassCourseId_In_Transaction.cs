using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class Add_ClassCourseId_In_Transaction : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ClassId",
                table: "Transactions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CourseId",
                table: "Transactions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_ClassId",
                table: "Transactions",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_CourseId",
                table: "Transactions",
                column: "CourseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Classes_ClassId",
                table: "Transactions",
                column: "ClassId",
                principalTable: "Classes",
                principalColumn: "ClassId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Courses_CourseId",
                table: "Transactions",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "CourseId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Classes_ClassId",
                table: "Transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Courses_CourseId",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_ClassId",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_CourseId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "ClassId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "CourseId",
                table: "Transactions");
        }
    }
}
