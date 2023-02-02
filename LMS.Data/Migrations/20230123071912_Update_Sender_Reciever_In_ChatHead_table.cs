using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Data.Migrations
{
    public partial class Update_Sender_Reciever_In_ChatHead_table : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ReceiverId",
                table: "ChatHeads",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SenderId",
                table: "ChatHeads",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChatHeads_ReceiverId",
                table: "ChatHeads",
                column: "ReceiverId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatHeads_SenderId",
                table: "ChatHeads",
                column: "SenderId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatHeads_AspNetUsers_ReceiverId",
                table: "ChatHeads",
                column: "ReceiverId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatHeads_AspNetUsers_SenderId",
                table: "ChatHeads",
                column: "SenderId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatHeads_AspNetUsers_ReceiverId",
                table: "ChatHeads");

            migrationBuilder.DropForeignKey(
                name: "FK_ChatHeads_AspNetUsers_SenderId",
                table: "ChatHeads");

            migrationBuilder.DropIndex(
                name: "IX_ChatHeads_ReceiverId",
                table: "ChatHeads");

            migrationBuilder.DropIndex(
                name: "IX_ChatHeads_SenderId",
                table: "ChatHeads");

            migrationBuilder.DropColumn(
                name: "ReceiverId",
                table: "ChatHeads");

            migrationBuilder.DropColumn(
                name: "SenderId",
                table: "ChatHeads");
        }
    }
}
