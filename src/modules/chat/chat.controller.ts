import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('messages')
  async getMessagesBetween(
    @Query('userA') userA: string,
    @Query('userB') userB: string,
  ) {
    return this.chatService.getMessagesBetween(userA, userB);
  }

  @Get('conversations')
  async getConversations(@Query('userId') userId: string) {
    return this.chatService.getConversations(userId);
  }

  @Delete('conversations/user/:userId/provider/:providerId')
  async deleteConversation(
    @Param('userId') userId: string,
    @Param('providerId') providerId: string,
  ) {
    return this.chatService.deleteConversation(userId, providerId);
  }
}
