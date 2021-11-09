import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Hashtag, HashtagSchema } from "src/entities/hastag.entity";
import { HashtagsService } from "./hashtags.service";

@Module({
    imports: [MongooseModule.forFeature([
        {
            name: Hashtag.name,
            schema: HashtagSchema,
        }
    ])],
    providers: [HashtagsService],
    exports: [HashtagsService]
})
export class HashtagsModule {}