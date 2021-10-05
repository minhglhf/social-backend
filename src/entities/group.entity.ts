import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { GroupMemberRole } from "src/utils/enums";

@Schema()
export class Group {
    @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
    admin_id: Types.ObjectId
    @Prop({ type: String, required: true })
    name: string
    @Prop({ type: String, required: true })
    privacy: string
    @Prop({ type: String, required: false })
    backgroundImage: string
    @Prop({
        type: [{
            member_id: { type: Types.ObjectId, required: true, ref: 'User' },
            member_role: { type: String, enum: GroupMemberRole, default: GroupMemberRole.NormalUser }
        }],
        required: true,
        ref: 'User'
    })
    member: []
}

export const GroupSchema = SchemaFactory.createForClass(Group)
export type GroupDocument = Document & Group
