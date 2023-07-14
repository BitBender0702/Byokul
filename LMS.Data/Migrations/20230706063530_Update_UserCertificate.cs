using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class Update_UserCertificate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserCertificates_AspNetUsers_UserId1",
                table: "UserCertificates");

            migrationBuilder.DropIndex(
                name: "IX_UserCertificates_UserId1",
                table: "UserCertificates");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "UserCertificates");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "UserCertificates",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.CreateIndex(
                name: "IX_UserCertificates_UserId",
                table: "UserCertificates",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserCertificates_AspNetUsers_UserId",
                table: "UserCertificates",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserCertificates_AspNetUsers_UserId",
                table: "UserCertificates");

            migrationBuilder.DropIndex(
                name: "IX_UserCertificates_UserId",
                table: "UserCertificates");

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                table: "UserCertificates",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddColumn<string>(
                name: "UserId1",
                table: "UserCertificates",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserCertificates_UserId1",
                table: "UserCertificates",
                column: "UserId1");

            migrationBuilder.AddForeignKey(
                name: "FK_UserCertificates_AspNetUsers_UserId1",
                table: "UserCertificates",
                column: "UserId1",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
