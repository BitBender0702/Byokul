using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class Remove_ReplyAttachmentId_In_ChatMessages : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessages_ChatMessages_ReplyMessageId",
                table: "ChatMessages");

            migrationBuilder.DropIndex(
                name: "IX_ChatMessages_ReplyMessageId",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "ReplyMessageId",
                table: "ChatMessages");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ReplyMessageId",
                table: "ChatMessages",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_ReplyMessageId",
                table: "ChatMessages",
                column: "ReplyMessageId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessages_ChatMessages_ReplyMessageId",
                table: "ChatMessages",
                column: "ReplyMessageId",
                principalTable: "ChatMessages",
                principalColumn: "Id");
        }
    }
}
