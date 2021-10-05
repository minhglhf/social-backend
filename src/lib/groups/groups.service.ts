import { Injectable, Post } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
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
            return err
        }
    }

    public async getGroups(): Promise<Group[]> {
        try {
            return this.groupModel.find({})
        }
        catch (err) {
            return err
        }
    }
}