import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { IPlayer } from 'src/players/interfaces/player.interface';
import { Player } from '../../players/entities/player.entity';
import { ICategory, IEvent } from '../interfaces/category.interface';

@Schema({ timestamps: true })
export class Category implements ICategory {
  @Prop({ required: true, unique: true })
  category: string;

  @Prop()
  description: string;

  @Prop([
    {
      name: { type: String },
      operation: { type: String },
      value: { type: Number },
    },
  ])
  events: IEvent[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: Player.name }] })
  players: IPlayer[];
}

export type CategoryDocument = Category & Document;
export const CategorySchema = SchemaFactory.createForClass(Category);
