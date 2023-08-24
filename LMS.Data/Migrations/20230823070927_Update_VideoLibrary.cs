using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class Update_VideoLibrary : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CreatedById",
                table: "VideoLibrary",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedOn",
                table: "VideoLibrary",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "DeletedById",
                table: "VideoLibrary",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedOn",
                table: "VideoLibrary",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "VideoLibrary",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_VideoLibrary_CreatedById",
                table: "VideoLibrary",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_VideoLibrary_DeletedById",
                table: "VideoLibrary",
                column: "DeletedById");

            migrationBuilder.AddForeignKey(
                name: "FK_VideoLibrary_AspNetUsers_CreatedById",
                table: "VideoLibrary",
                column: "CreatedById",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_VideoLibrary_AspNetUsers_DeletedById",
                table: "VideoLibrary",
                column: "DeletedById",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_VideoLibrary_AspNetUsers_CreatedById",
                table: "VideoLibrary");

            migrationBuilder.DropForeignKey(
                name: "FK_VideoLibrary_AspNetUsers_DeletedById",
                table: "VideoLibrary");

            migrationBuilder.DropIndex(
                name: "IX_VideoLibrary_CreatedById",
                table: "VideoLibrary");

            migrationBuilder.DropIndex(
                name: "IX_VideoLibrary_DeletedById",
                table: "VideoLibrary");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "VideoLibrary");

            migrationBuilder.DropColumn(
                name: "CreatedOn",
                table: "VideoLibrary");

            migrationBuilder.DropColumn(
                name: "DeletedById",
                table: "VideoLibrary");

            migrationBuilder.DropColumn(
                name: "DeletedOn",
                table: "VideoLibrary");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "VideoLibrary");
        }
    }
}
