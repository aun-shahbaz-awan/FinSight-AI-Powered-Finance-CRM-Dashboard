import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { getAllowedOrigins } from '../../config/cors';

type AuthenticatedSocket = Socket & {
  handshake: Socket['handshake'] & {
    auth?: {
      userId?: string;
    };
  };
};

@WebSocketGateway({
  cors: {
    origin: getAllowedOrigins(),
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: AuthenticatedSocket) {
    const userId = client.handshake.auth?.userId;

    if (userId) {
      void client.join(`user:${userId}`);
    }
  }

  @SubscribeMessage('join-ticket')
  joinTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { ticketId: string },
  ) {
    void client.join(`ticket:${payload.ticketId}`);
  }

  @SubscribeMessage('leave-ticket')
  leaveTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { ticketId: string },
  ) {
    void client.leave(`ticket:${payload.ticketId}`);
  }

  emitToUser(userId: string, event: string, payload: unknown) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  emitToTicket(ticketId: string, event: string, payload: unknown) {
    this.server.to(`ticket:${ticketId}`).emit(event, payload);
  }

  emitPublic(event: string, payload: unknown) {
    this.server.emit(event, payload);
  }
}
