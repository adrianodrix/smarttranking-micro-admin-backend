import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { IPlayer } from 'src/players/interfaces/player.interface';
import { Category } from 'src/categories/entities/category.entity';

@Schema({ timestamps: true })
export class Player implements IPlayer {
  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  ranking: string;

  @Prop()
  positionRanking: number;

  @Prop()
  urlAvatar: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
  category: Category;
}

export type PlayerDocument = Player & Document;
export const PlayerSchema = SchemaFactory.createForClass(Player);
