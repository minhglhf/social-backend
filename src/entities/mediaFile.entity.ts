import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";


@Schema({timestamps: true})
export class MediaFile{
    @Prop({type: Types.ObjectId})
    user: Types.ObjectId;
    @Prop({type: Types.ObjectId})
    group: Types.ObjectId;
    @Prop({Type: String})
    des: string;
    @Prop({type: String})
    type: string;
    @Prop({type: String})
    url: string
}
export const MediaFileSchema = SchemaFactory.createForClass(MediaFile);
export type MediaFileDocument = MediaFile & Document
