import { Injectable, InternalServerErrorException, Post } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { GroupsList } from 'src/dtos/group/getGroup.dto'
import { Group, GroupDocument } from 'src/entities/group.entity'

@Injectable()

export class GroupsService {
    constructor(
        @InjectModel(Group.name) private groupModel: Model<GroupDocument>
    ) { }

    public async create(adminId: String, groupName: String, groupPrivacy: String): Promise<Group> {
        try {
            const createGroup = new this.groupModel({
                admin_id: adminId,
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
            const yourGroup = await this.groupModel
                .find({ admin_id: yourId })
            const groups = {
                yourGroup,
                joinedGroup: []
            }
            return groups
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
}