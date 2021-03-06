import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { Model, Types } from 'mongoose';
import { AddMemberInput } from 'src/dtos/group/addMember.dto';
import { GroupsList, SuggestedGroupOutput } from 'src/dtos/group/getGroup.dto';
import { Group, GroupDocument } from 'src/entities/group.entity';
import { MapsHelper } from 'src/helpers/maps.helper';
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper';
import { GROUPS_SUGGESSTION_LENGTH, POSTS_PER_PAGE } from 'src/utils/constants';
import { Privacy, Time } from 'src/utils/enums';
import { MediaFilesService } from '../mediaFiles/mediaFiles.service';
import { PostsService } from '../posts/providers/posts.service';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @Inject(forwardRef(() => MediaFilesService))
    private filesService: MediaFilesService,
    private stringHandlersHelper: StringHandlersHelper, // private postsService: PostsService // private mapsHelper: MapsHelper,
    @Inject(forwardRef(() => PostsService)) private postsService: PostsService,
  ) {}

  public async create(
    userId: string,
    groupName: string,
    groupPrivacy: string,
    file: Express.Multer.File,
  ): Promise<Group> {
    try {
      const group = await this.groupModel.findOne({
        admin_id: userId,
        name: groupName,
      });
      console.log(group);
      if (group) {
        throw new BadRequestException('trùng tên group đã tạo');
      }
      const filePath = `group/groupBackgroundImage/${userId}/${groupName}/${this.stringHandlersHelper.generateString(
        15,
      )}`;
      const uploadFile = await this.filesService.saveFile(
        file,
        filePath,
        groupName,
        userId,
      );
      const createGroup = new this.groupModel({
        admin_id: Types.ObjectId(userId),
        backgroundImage: uploadFile.url,
        name: groupName,
        privacy: groupPrivacy,
        totalMember: {
          admins: 1,
          members: 0,
        },
      });
      return createGroup.save();
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async getGroups(yourId: string): Promise<GroupsList> {
    try {
      const promises = await Promise.all([
        this.groupModel
          .find({ admin_id: Types.ObjectId(yourId) })
          .populate('admin_id', ['displayName', 'avatar'])
          .populate('member.member_id', ['displayName', 'avatar']),
        this.groupModel
          .find({ 'member.member_id': yourId })
          .populate('admin_id', ['displayName', 'avatar'])
          .populate('member.member_id', ['displayName', 'avatar']),
        ,
      ]);
      const groups = {
        yourGroup: promises[0],
        joinedGroup: promises[1],
      };
      return groups;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  public async getGroupById(yourId: string, groupId: string): Promise<any> {
    try {
      const group: any = await this.groupModel
        .findById(groupId)
        .populate('admin_id', ['displayName', 'avatar'])
        .populate('member.member_id', ['displayName', 'avatar']);
      if (!group) {
        throw new BadRequestException('group không tồn tại');
      }
      if (group?.admin_id?._id.toString() === yourId.toString()) {
        return group;
      }
      if (group?.privacy === 'public') {
        const isJoined = await this.IsMemberOfGroup1(yourId, groupId);
        return {
          isJoined,
          group,
        };
      }
      if (group?.privacy === 'private') {
        if (String(group.admin_id) === String(yourId)) return group;
        else {
          const isJoined = await this.IsMemberOfGroup1(yourId, groupId);
          if (isJoined) {
            return {
              isJoined,
              group,
            };
          } else
            throw new BadRequestException(
              'bạn không thể  xem do không phải admin hoặc chưa tham gia group',
            );
        }
      }
      return group;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async joinGroupPublic(
    yourId: string,
    groupId: string,
  ): Promise<Group> {
    try {
      const group: any = await this.groupModel.findById(groupId);
      if (!group) {
        throw new BadRequestException('group không tồn tại');
      }
      if (group.privacy === Privacy.Private) {
        throw new BadRequestException(
          'Liên hệ với admin của group để được thêm vào',
        );
      }
      return await this.addMember(
        group.admin_id,
        {
          groupId: group._id,
          userId: yourId,
        },
        true,
      );
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  public async updateGroup(groupId: string): Promise<Group> {
    try {
      return this.groupModel.findOneAndUpdate({
        _id: groupId,
      });
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async deleteGroup(groupId: string): Promise<void> {
    try {
      await Promise.all([
        this.groupModel.deleteOne({ _id: groupId }),
        this.postsService.deleteManyPostsOfGroup(groupId),
      ]);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  public async addMember(
    admin_id: string,
    addMemberInput: AddMemberInput,
    requestJoin = false,
  ): Promise<Group> {
    try {
      const group = await this.groupModel.findById(addMemberInput.groupId);
      if (!group) {
        throw new BadRequestException('group không tồn tại');
      }
      if (group.admin_id.toString() !== admin_id && !requestJoin) {
        throw new BadRequestException('bạn không có quyền thêm thành viên');
      }
      const checkMemberExist = group.member.findIndex(
        (mem: any) => mem?.member_id.toString() === addMemberInput.userId,
      );
      if (checkMemberExist !== -1 || addMemberInput.userId === admin_id) {
        throw new BadRequestException('member này đã tồn tại');
      }
      const promises = await Promise.all([
        this.groupModel.findOneAndUpdate(
          {
            admin_id: Types.ObjectId(admin_id),
            _id: addMemberInput.groupId,
          },
          {
            $push: {
              member: {
                member_id: Types.ObjectId(addMemberInput.userId),
              },
            },
          },
          {
            new: true,
          },
        ),
        this.groupModel.findOneAndUpdate(
          {
            admin_id: Types.ObjectId(admin_id),
            _id: addMemberInput.groupId,
          },
          {
            $inc: {
              'totalMember.members': 1,
            },
          },
          {
            new: true,
          },
        ),
      ]);

      return promises[1];
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  public async searchGroups(
    userId: string,
    search: string,
    pageNumber: number,
  ) {
    try {
      if (!search) return [];
      const limit = POSTS_PER_PAGE;
      const skip = !pageNumber || pageNumber <= 0 ? 0 : pageNumber * limit;
      search = search.trim();
      const groups = await this.groupModel
        // .find({ description: { $regex: search } },)
        .find({
          name: { $regex: search },
          privacy: Privacy.Public,
        })
        .populate('admin_id', ['displayName', 'avatar'])
        .sort([['date', 1]])
        .select(['-__v', '-member'])
        .skip(skip)
        .limit(limit);
      const mapGroups = await Promise.all(
        groups.map(async (g: any) => {
          const isJoined = await this.IsMemberOfGroup(userId, g._id.toString());
          return {
            _id: g._id,
            admin_id: g.admin_id._id,
            adminDisplayName: g.admin_id.displayName,
            adminAvatar: g.admin_id.avatar,
            bgimg: g.backgroundImage,
            name: g.name,
            privacy: g.privacy,
            members: g.totalMember,
            isJoined,
          };
        }),
      );
      return {
        searchResults: mapGroups.length,
        groups: mapGroups,
      };
      // }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  public async getSuggestedGroup(
    userId: string,
  ): Promise<SuggestedGroupOutput[]> {
    try {
      const start = new Date(
        this.stringHandlersHelper.getStartAndEndDateWithTime(
          Time.Week,
          true,
        )[0],
      );
      const end = new Date(
        this.stringHandlersHelper.getStartAndEndDateWithTime(
          Time.Week,
          true,
        )[1],
      );
      const match = {
        admin_id: { $ne: Types.ObjectId(userId) },
        'member.member_id': { $ne: Types.ObjectId(userId) },
        privacy: Privacy.Public,
      };
      const groups = await this.groupModel.aggregate([
        {
          $match: match,
        },
        {
          $lookup: {
            from: 'posts',
            let: { groupId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$group', '$$groupId'] },
                      { $gte: ['$createdAt', start] },
                      { $lte: ['createdAt', end] },
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: null,

                  postsCount: { $sum: 1 },
                },
              },
              { $project: { postsCount: 1 } },
            ],
            as: 'postsResult',
          },
        },
        {
          $addFields: {
            totalPostsThisWeek: { $arrayElemAt: ['$postsResult', 0] },
          },
        },
        {
          $project: {
            _id: 0,
            groupId: '$_id',
            groupName: '$name',
            groupBackgroundImage: '$backgroundImage',
            totalPostsThisWeek: {
              $ifNull: ['$totalPostsThisWeek.postsCount', 0],
            },
          },
        },
        {
          $sort: { totalPostsThisWeek: -1, groupName: 1 },
        },
        {
          $limit: GROUPS_SUGGESSTION_LENGTH,
        },
      ]);
      return groups;
    } catch (err) {
      console.log(err);

      throw new InternalServerErrorException(err);
    }
  }
  public async getGroup(
    groupId: string,
    userId: string,
  ): Promise<Partial<GroupDocument>> {
    try {
      const match = {
        $and: [
          {
            _id: Types.ObjectId(groupId),
          },
          {
            $or: [
              { admin_id: Types.ObjectId(userId) },
              { 'member.member_id': Types.ObjectId(userId) },
            ],
          },
        ],
      };
      return await this.groupModel.findOne(match);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }


  public async IsMemberOfGroup1(
    userId: string,
    groupId: string,
  ): Promise<boolean> {
    try {
      const match = {
        $and: [
          {
            _id: Types.ObjectId(groupId),
          },
          {
            $or: [
              { admin_id: Types.ObjectId(userId.toString()) },
              { 'member.member_id': Types.ObjectId(userId) },
            ],
          },
        ],
      };
      const member = await this.groupModel.findOne(match);
      if (member) return true;
      return false;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  // Hàm này chỉ dùng lúc get thôi
  public async IsMemberOfGroup(
    userId: string,
    groupId: string,
  ): Promise<boolean> {
    try {
      const match = {
        $and: [
          {
            _id: Types.ObjectId(groupId),
          },
          {
            $or: [
              { admin_id: Types.ObjectId(userId.toString()) },
              { 'member.member_id': Types.ObjectId(userId) },
              { privacy: Privacy.Public },
            ],
          },
        ],
      };
      const member = await this.groupModel.findOne(match);
      if (member) return true;
      return false;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
