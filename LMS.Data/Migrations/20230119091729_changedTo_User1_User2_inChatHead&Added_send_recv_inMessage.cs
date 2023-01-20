using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class changedTo_User1_User2_inChatHeadAdded_send_recv_inMessage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Sender",
                table: "ChatHeads",
                newName: "User2");

            migrationBuilder.RenameColumn(
                name: "Receiver",
                table: "ChatHeads",
                newName: "User1");

            migrationBuilder.AddColumn<Guid>(
                name: "ReceiverId",
                table: "ChatMessages",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "SenderId",
                table: "ChatMessages",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReceiverId",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "SenderId",
                table: "ChatMessages");

            migrationBuilder.RenameColumn(
                name: "User2",
                table: "ChatHeads",
                newName: "Sender");

            migrationBuilder.RenameColumn(
                name: "User1",
                table: "ChatHeads",
                newName: "Receiver");
        }
    }
}
