import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { Category, CategoryDocument } from './entities/category.entity';
import { ICategory } from './interfaces/categories/category.interface';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    private readonly i18n: I18nService,
  ) {}

  async createCategory(
    createCategoryDto: ICategory,
  ): Promise<CategoryDocument> {
    try {
      this.logger.log(`create: ${JSON.stringify(createCategoryDto)}`);
      const { category } = createCategoryDto;

      const categoryExists = await this.categoryModel
        .findOne({ category })
        .exec();
      if (categoryExists) {
        throw new Error(
          await this.i18n.t('categories.exists', {
            args: { category },
          }),
        );
      }
      return await this.categoryModel.create(createCategoryDto);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error)}`);
      throw new RpcException(error.message);
    }
  }

  async findAllCategories(): Promise<Category[]> {
    try {
      return await this.categoryModel.find().populate('players').lean();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error)}`);
      throw new RpcException(error.message);
    }
  }

  async findOneCategory(id: string): Promise<CategoryDocument> {
    try {
      const categoryFound = await this.categoryModel
        .findById(id)
        .populate('players')
        .exec();
      if (!categoryFound) {
        throw new Error(
          await this.i18n.t('categories.notFound', {
            args: { category: id },
          }),
        );
      }
      return categoryFound;
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error)}`);
      throw new RpcException(error.message);
    }
  }
}
