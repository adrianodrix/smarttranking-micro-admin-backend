import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { BadRequestError } from 'src/common/errors/bad-request.error';
import { CreatePlayerDTO } from './dto/create-player.dto';
import { UpdatePlayerDTO } from './dto/update-player.dto';
import { Player, PlayerDocument } from './entities/player.entity';
import { IPlayer } from './interfaces/player.interface';

@Injectable()
export class PlayersService {
  private readonly logger = new Logger(PlayersService.name);

  constructor(
    @InjectModel(Player.name)
    private readonly playerModel: Model<PlayerDocument>,
    private readonly i18n: I18nService,
  ) {}

  async create(createPlayerDTO: CreatePlayerDTO): Promise<IPlayer> {
    this.logger.log(`create: ${JSON.stringify(createPlayerDTO)}`);

    const { email, phoneNumber, ...rest } = createPlayerDTO;

    const playerExists =
      (await this.playerModel
        .findOne({
          email: email.toLocaleLowerCase(),
        })
        .exec()) ?? (await this.playerModel.findOne({ phoneNumber }).exec());
    if (playerExists) {
      throw new BadRequestError(
        await this.i18n.t('players.exists', {
          args: { player: `${email} | ${phoneNumber}` },
        }),
      );
    }

    const player: IPlayer = {
      email: email.toLocaleLowerCase(),
      phoneNumber,
      ...rest,
      ranking: 'A',
      positionRanking: 1,
      urlAvatar: 'https://i.pravatar.cc/300',
    };

    return await this.playerModel.create(player);
  }

  async update(id: string, updatePlayerDTO: UpdatePlayerDTO): Promise<IPlayer> {
    this.logger.log(`update: ${JSON.stringify(updatePlayerDTO)}`);

    const playerFound = await this.findById(id);
    return await this.playerModel
      .findOneAndUpdate(
        { _id: playerFound.id },
        { $set: updatePlayerDTO },
        { returnOriginal: false },
      )
      .exec();
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`delete: ${id}`);

    const playerFound = await this.findById(id);
    await this.playerModel.deleteOne({ _id: playerFound._id }).exec();
  }

  async findAll(): Promise<IPlayer[]> {
    this.logger.log('findAll');
    return await this.playerModel.find().populate('category').lean();
  }

  async findByEmail(email: string): Promise<PlayerDocument> {
    this.logger.log(`findByEmail: ${email}`);

    return await this.playerModel
      .findOne({
        email: email.toLocaleLowerCase(),
      })
      .populate('category')
      .exec();
  }

  async findById(id: string): Promise<PlayerDocument> {
    this.logger.log(`findById: ${id}`);

    return await this.playerModel.findById(id).populate('category').exec();
  }

  async findByListIds(ids: string[]) {
    return await this.playerModel.where('_id').in(ids).exec();
  }
}
