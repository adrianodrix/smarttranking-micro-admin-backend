import { Controller, Get, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { ICategory } from './interfaces/categories/category.interface';

@Controller()
export class AppController {
  private logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @EventPattern('create-category')
  createCategory(@Payload() category: ICategory) {
    this.logger.log(`createCategory: ${JSON.stringify(category)}`);
    this.appService.createCategory(category);
  }

  @MessagePattern('find-categories')
  async findCategories(@Payload() idCategory: string) {
    this.logger.log(`findCategories: ${idCategory}`);

    if (idCategory) {
      return await this.appService.findOneCategory(idCategory);
    }
    return await this.appService.findAllCategories();
  }
}
