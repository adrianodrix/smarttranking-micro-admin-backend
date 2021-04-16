import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException,
} from '@nestjs/microservices';
import { PlayerEvents } from 'src/categories/interfaces/player-events.enum';
import { BadRequestError } from 'src/common/errors/bad-request.error';
import { DuplicateKeyError } from 'src/common/errors/DuplicateKeyError.error';
import { NotFoundError } from 'src/common/errors/not-found.error';
import { IPlayer } from './interfaces/player.interface';
import { PlayersService } from './players.service';

@Controller()
export class PlayersController {
  private logger = new Logger(PlayersController.name);

  constructor(private readonly service: PlayersService) {}

  @EventPattern(PlayerEvents.CREATE)
  async create(@Payload() player: IPlayer, @Ctx() context: RmqContext) {
    this.logger.log(`create: ${JSON.stringify(player)}`);
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      await this.service.create(player);
      channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);

      if (
        error instanceof DuplicateKeyError ||
        error instanceof BadRequestError
      ) {
        channel.ack(originalMessage);
      }
      throw new RpcException(error.message);
    }
  }

  @EventPattern(PlayerEvents.UPDATE)
  async update(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`update: ${JSON.stringify(data)}`);

    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      const { id, updatePlayerDTO } = data;
      await this.service.update(id, updatePlayerDTO);
      channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);

      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        channel.ack(originalMessage);
      }
      throw new RpcException(error.message);
    }
  }

  @EventPattern(PlayerEvents.DELETE)
  async delete(@Payload() id: string, @Ctx() context: RmqContext) {
    this.logger.log(`delete: ${id}`);

    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      await this.service.delete(id);
      channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);

      if (error instanceof NotFoundError) {
        channel.ack(originalMessage);
      }
      throw new RpcException(error.message);
    }
  }

  @MessagePattern(PlayerEvents.FIND)
  async find(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`find: ${JSON.stringify(data)}`);
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      const { id, email } = data;

      if (id) {
        return await this.service.findById(id);
      }
      if (email) {
        return await this.service.findByEmail(email);
      }
      return await this.service.findAll();
    } finally {
      channel.ack(originalMessage);
    }
  }
}
