using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class Update_Schooltransactions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SchoolTransactions_AspNetUsers_UserId1",
                table: "SchoolTransactions");

            migrationBuilder.DropIndex(
                name: "IX_SchoolTransactions_UserId1",
                table: "SchoolTransactions");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "SchoolTransactions");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "SchoolTransactions");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "SchoolTransactions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserId1",
                table: "SchoolTransactions",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SchoolTransactions_UserId1",
                table: "SchoolTransactions",
                column: "UserId1");

            migrationBuilder.AddForeignKey(
                name: "FK_SchoolTransactions_AspNetUsers_UserId1",
                table: "SchoolTransactions",
                column: "UserId1",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
