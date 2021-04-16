import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { I18nJsonParser, I18nModule } from 'nestjs-i18n';
import { join } from 'path';
import { CategoriesModule } from './categories/categories.module';
import { PlayersModule } from './players/players.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    I18nModule.forRoot({
      fallbackLanguage: 'ptbr',
      parser: I18nJsonParser,
      parserOptions: {
        path: join(__dirname, '/common/i18n/'),
      },
    }),
    MongooseModule.forRoot(process.env.MONGO_DSN, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    }),
    CategoriesModule,
    PlayersModule,
  ],
})
export class AppModule {}
