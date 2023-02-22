using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class Add_ChatType_In_Notification : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ChatType",
                table: "Notifications",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ChatTypeId",
                table: "Notifications",
                type: "uniqueidentifier",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ChatType",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "ChatTypeId",
                table: "Notifications");
        }
    }
}
