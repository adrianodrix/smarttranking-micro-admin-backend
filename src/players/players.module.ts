import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Player, PlayerSchema } from './entities/player.entity';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
  ],
  providers: [PlayersService],
  exports: [PlayersService],
  controllers: [PlayersController],
})
export class PlayersModule {}
