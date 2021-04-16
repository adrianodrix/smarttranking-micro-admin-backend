import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException,
} from '@nestjs/microservices';
import { DuplicateKeyError } from '../common/errors/DuplicateKeyError.error';
import { NotFoundError } from '../common/errors/not-found.error';
import { CategoriesService } from './categories.service';
import { CategoryEvents } from './interfaces/category-events.enum';
import { ICategory } from './interfaces/category.interface';

@Controller()
export class CategoriesController {
  private logger = new Logger(CategoriesController.name);

  constructor(private readonly service: CategoriesService) {}

  @EventPattern(CategoryEvents.CREATE)
  async create(@Payload() category: ICategory, @Ctx() context: RmqContext) {
    this.logger.log(`create: ${JSON.stringify(category)}`);
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      await this.service.create(category);
      channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);

      if (error instanceof DuplicateKeyError) {
        channel.ack(originalMessage);
      }
      throw new RpcException(error.message);
    }
  }

  @MessagePattern(CategoryEvents.FIND)
  async find(@Payload() id: string, @Ctx() context: RmqContext) {
    this.logger.log(`find: ${id}`);
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      if (id) {
        return await this.service.findOne(id);
      }
      return await this.service.findAll();
    } finally {
      channel.ack(originalMessage);
    }
  }

  @MessagePattern(CategoryEvents.UPDATE)
  async update(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`update: ${JSON.stringify(data)}`);

    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      const { id, updateCategoryDto } = data;
      await this.service.update(id, updateCategoryDto);
      channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);

      if (error instanceof NotFoundError) {
        channel.ack(originalMessage);
      }
      throw new RpcException(error.message);
    }
  }

  @MessagePattern(CategoryEvents.DELETE)
  async remove(@Payload() id: string, @Ctx() context: RmqContext) {
    this.logger.log(`remove: ${id}`);

    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      await this.service.remove(id);
      channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);

      if (error instanceof NotFoundError) {
        channel.ack(originalMessage);
      }
      throw new RpcException(error.message);
    }
  }

  @MessagePattern(CategoryEvents.ATTACH_PLAYER)
  async attachAPlayer(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`attachAPlayer: ${JSON.stringify(data)}`);
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      const { categoryId, playerId } = data;
      await this.service.attachAPlayer(categoryId, playerId);
      channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(`${error.name}: ${JSON.stringify(error.message)}`);

      if (error instanceof NotFoundError) {
        channel.ack(originalMessage);
      }
      throw new RpcException(error.message);
    }
  }
}
