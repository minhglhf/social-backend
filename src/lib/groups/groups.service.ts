import { BadRequestException, Injectable, InternalServerErrorException, Post } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Type } from 'class-transformer'
import { Model, Types } from 'mongoose'
import { AddMemberInput } from 'src/dtos/group/addMember.dto'
import { GroupsList } from 'src/dtos/group/getGroup.dto'
import { Group, GroupDocument } from 'src/entities/group.entity'
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper'
import { MediaFilesService } from '../mediaFiles/mediaFiles.service'

@Injectable()

export class GroupsService {
    constructor(
        @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
        private filesService: MediaFilesService,
        private stringHandlersHelper: StringHandlersHelper,
    ) { }

    public async create(userId: string, groupName: string, groupPrivacy: string, file: Express.Multer.File): Promise<Group> {
        try {
            const group = await this.groupModel.findOne({
                admin_id: userId,
                name: groupName
            })
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
                admin_id: userId,
                backgroundImage: uploadFile.url,
                name: groupName,
                privacy: groupPrivacy
            })
            return createGroup.save()
        }
        catch (err) {
            throw new InternalServerErrorException(err);
        }
    }
    public async getGroups(yourId: string): Promise<GroupsList> {
        try {
            const promises = await Promise.all([
                this.groupModel.find({ admin_id: yourId }),
                this.groupModel.find({ "member.member_id": yourId })
            ])
            const groups = {
                yourGroup: promises[0],
                joinedGroup: promises[1]
            }
            return groups
        }
        catch (err) {
            throw new InternalServerErrorException(err);
        }
    }
    public async getGroupById(yourId: string, groupId: string): Promise<Group> {
        try {
            const group = await this.groupModel.findById(groupId)
            if (!group) {
                throw new BadRequestException('group không tồn tại')
            }
            if (group?.privacy === 'public') {
                return group
            }
            if (group?.privacy === 'private') {
                if (String(group.admin_id) === yourId) return group
                else {
                    const checkIfMember = group.member.findIndex((mem: any) => {
                        return String(yourId) === String(mem.member_id)
                    })
                    if (checkIfMember !== -1) return group
                    else throw new BadRequestException('bạn không thể  xem do không phải admin hoặc chưa tham gia group')
                }
            }
            return group
        }
        catch (err) {
            throw new InternalServerErrorException(err);
        }
    }
    public async updateGroup(groupId: string): Promise<Group> {
        try {
            return this.groupModel.findOneAndUpdate({
                _id: groupId
            })
        }
        catch (err) {
            throw new InternalServerErrorException(err);
        }
    }
    public async deleteGroup(groupId: string): Promise<void> {
        try {
            await this.groupModel.deleteOne({ _id: groupId })
        }
        catch (err) {
            throw new InternalServerErrorException(err);
        }
    }
    public async addMember(admin_id: string, addMemberInput: AddMemberInput): Promise<Group> {
        try {
            const group = await this.groupModel.findById(addMemberInput.groupId)
            if (!group) {
                throw new BadRequestException('group không tồn tại')
            }
            if (group.admin_id.toString() !== admin_id) {
                throw new BadRequestException('bạn không có quyền thêm thành viên')
            }
            const checkMemberExist = group.member.findIndex((mem: any) => mem?.member_id.toString() === addMemberInput.userId)
            if (checkMemberExist !== -1 || addMemberInput.userId === admin_id) {
                throw new BadRequestException('member này đã tồn tại')
            }
            const gr = await this.groupModel.findOneAndUpdate(
                {
                    admin_id,
                    _id: addMemberInput.groupId
                },
                {
                    $push: {
                        member: {
                            member_id: Types.ObjectId(addMemberInput.userId),
                        }
                    },
                },
                {
                    new: true
                }
            )
            return gr
        }
        catch (err) {
            throw new InternalServerErrorException(err)
        }
    }
}