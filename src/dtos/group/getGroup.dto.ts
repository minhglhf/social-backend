import { ApiProperty } from "@nestjs/swagger";
import { Group } from "src/entities/group.entity";

export class GroupsList {
    yourGroup: Group[]
    joinedGroup: Group[]
}
export class SuggestedGroupOutput {
    groupId: string;
    groupName: string;
    groupBackgroundImage: string;
    totalMembers: number;
    totalPostsLastWeek: number;
}