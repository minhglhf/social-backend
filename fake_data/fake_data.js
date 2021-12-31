

var MongoClient = require('mongodb').MongoClient;
var faker = require('faker');
var url = "mongodb://localhost:27017/";
const a_reaction = ["love","like","sad","angry","haha","wow"];
const a_comment = [
  "bình luận",
  "hay",
  "tuyệt vời",
  "có vẻ được",
]
const a_fname = [
  "Nguyễn","Phạm","Võ","Ngô","Trần","Đỗ"
]
const a_sname = [
  "Thi","Văn","Khắc","Trung","Quang"
]
const a_lname = [
  "Hoàn","Duy","Trung","Dũng","Kiên","Anh","Mai","Hoa","Thi"
]
const a_image = [
  "https://firebasestorage.googleapis.com/v0/b/social-network-c414c.appspot.com/o/images%2Favatar%2F61af7564103ae73a343f7db56LhFj8BM2zmyjEk?alt=media&token=cf64cc31-2877-4404-94ac-b451754cbbf2",
  "https://firebasestorage.googleapis.com/v0/b/social-network-c414c.appspot.com/o/images%2Favatar%2F61af7564103ae73a343f7db5hSEaI5zZngxabwj?alt=media&token=c951033f-bc6c-41fd-b193-ebeebdaa8dda",
  "https://firebasestorage.googleapis.com/v0/b/social-network-c414c.appspot.com/o/images%2Favatar%2F61af7564103ae73a343f7db5wfgIVEo2jQSRJKr?alt=media&token=4d539eaa-b964-45ea-9b7a-75eef029937a"


];
const a_video = [
  "https://firebasestorage.googleapis.com/v0/b/social-network-c414c.appspot.com/o/post%2FimageOrVideos%2F61af7564103ae73a343f7db5AyqFzcEkA5TIFgT?alt=media&token=29f20fd9-984d-40da-999f-edf08867096c",
  "https://firebasestorage.googleapis.com/v0/b/social-network-c414c.appspot.com/o/post%2FimageOrVideos%2F61af7564103ae73a343f7db5nS8kWM1DvOlSzwh?alt=media&token=6b2e1849-d4db-4fa5-99c8-2777d4e10df4",
  "https://firebasestorage.googleapis.com/v0/b/social-network-c414c.appspot.com/o/post%2FimageOrVideos%2F61af7564103ae73a343f7db5lHnv98HdlieNUZ6?alt=media&token=ed5cd49b-435c-44ad-bdf4-0232b59abc11"
]
var hashtagRange = 10;
var a_users = [];
var a_posts = [];
var a_groups= [];

function getRandom(array){
  return array[getRandomInRange(array.length)];
}
function getUpdate(react,count) {
  const update = {
    $inc: {},
  };
  switch (react) {
    case "love":
      update.$inc = {
        'reactions.loves': count,
      };
      break;
    case "like":
      update.$inc = {
        'reactions.likes': count,
      };
      break;
    case "haha":
      update.$inc = {
        'reactions.hahas': count,
      };
      break;
    case "wow":
      update.$inc = {
        'reactions.wows': count,
      };
      break;
    case "sad":
      update.$inc = {
        'reactions.sads': count,
      };
      break;
    case "angry":
      update.$inc = {
        'reactions.angrys': count,
      };
      break;
  }
  return update;
}
function getRandomInRange(range){
  return Math.floor(Math.random() * range);
}
function getTimePreviousTime(times,days){
  var result = times;
  result.setDate(result.getDate() - days );
  result.setHours(result.getHours() - getRandomInRange(20));
  result.setMinutes(result.getMinutes() - getRandomInRange(40));
  return result;
}
function getTimeAfterTime(times,days){
  var result = times;
  result.setDate(result.getDate() + days );
  result.setHours(result.getHours() + getRandomInRange(4));
  result.setMinutes(result.getMinutes() + getRandomInRange(40));
  return result;
}
function randomHashtagArray(range,count){
  var a_ht = [];
  for (let i = 0; i < count; i++){
    a_ht.push("#hashtag" + getRandomInRange(range).toString());
  }
  return a_ht;
}
//main insert data
async function insertUser(a_users,number,dbo){
  let userPromise = new Promise(async function(resolve) {
    console.log("generate users");
    for (let i=0; i< number; i++){
      var name = getRandom(a_fname)+" " +getRandom(a_sname)+" " +getRandom(a_lname);
      var noAccent = name.toLowerCase();
      var avt = getRandom(a_image);
      var bg = getRandom(a_image);
      var date = new Date(2000, 1, 1, 0, 0, 0, 0);
      var userObject = {
      "email":faker.internet.email(),
      "password":"$2b$10$ENOX9H2CmatQBLTjMSiXJec.7NknF8r2kVhK4BHV9/G3cMxC2AT9.",
      "displayName":name,
      "displayNameNoAccent":noAccent,
      "address":{"province":-1,"district":-1,"ward":-1},
      "birthday":date,
      "isActive":true,
      "avatar":avt,
      "coverPhoto":bg,
      "sex":1,
      "followers":0,
      "followings":0,
      "createdAt": date,
      "updatedAt":date,
      "__v":0}
      var result = await dbo.collection("users").insertOne(userObject);
      a_users.push(result.insertedId);

      var a_media = [
        {
          type: "image",
          des: "Ảnh đại diện",
          url: avt
        },
        {
          type: "image",
          des: "Ảnh đại diện",
          url: bg
        }
      ]
      await insertMediaFile(result.insertedId,a_media,dbo,date);
    }
    resolve("insert users done.");
  });
  console.log(await userPromise);
}
async function insertFollowing(a_users,follow_number,dbo){
  let followPromise = new Promise( async function(resolve) {
    console.log("generate followings");
    for (let i=0; i< a_users.length; i++){
      var a_follow = [];
      for (let j=0; j< follow_number; j++){
        var follow_id = getRandom(a_users);
        while (follow_id.toString() == a_users[i].toString()) follow_id = getRandom(a_users);
        a_follow.push(getRandom(a_users));
      }
      a_follow = [...new Set(a_follow)];
      for (let j=0; j< a_follow.length; j++){   
        var follow_id = a_follow[j];
        var followObject = {
          "user":a_users[i],
          "following":follow_id,
          "__v":0}
        await dbo.collection("followings").insertOne(followObject);
        await dbo.collection("users").updateOne({_id:a_users[i]},{$inc :{followers:1}});
        await dbo.collection("users").updateOne({_id:follow_id},{$inc :{followings:1}});
      }
    }
    resolve("insert followings done");
  });
  console.log(await followPromise);
}
async function insertGroup(a_groups,a_users,a_posts,g_number,g_member,g_post,post_image,post_video,post_hashtag,post_react,post_comment,child_comment,dbo){
  let groupPromise = new Promise(async function(resolve) {
    console.log("generate groups");
    for (let i=0; i< g_number; i++){
      var count_member = getRandomInRange(g_member) + 1;
      a_members = [];
      for (var j = 0; j < count_member; j++){
        a_members.push(getRandom(a_users));
      }
      a_members = [...new Set(a_members)];
      var admin = a_members[a_members.length - 1];
      var a_obj_member = [];
      for (let j = 0; j < a_members.length - 1;j++){
        var obj_member = {
          "member_role":"normalUser",
          "member_id": a_members[j]
        }
        a_obj_member.push(obj_member);
      }
      var bg = getRandom(a_image);
      var groupObject = {
        "admin_id":admin,
        "backgroundImage":bg,
        "name":"group " + i,
        "privacy":"public",
        "totalMember":{"admins":1,"members":a_obj_member.length},
        "member":a_obj_member,
        "__v":0}
      var g_result = await dbo.collection("groups").insertOne(groupObject);
      a_groups.push(g_result.insertedId);
      await insertMediaFile(admin,[{type:"image",des:"group " + i,url:bg}],dbo);
      await insertPost(a_users,a_posts,g_post,post_image,post_video,post_hashtag,post_react,post_comment,child_comment,dbo,g_result.insertedId,a_members);
    }
    resolve("insert groups done.");
  });
  console.log(await groupPromise);
}
async function insertHagtash(a_ht,post_date,dbo){
  let hashtagPromise = new Promise(async function(resolve) {
    var start = new Date(
      post_date.getFullYear(),post_date.getMonth(),post_date.getDate(),-1,23,59,59,999);
    var end = new Date(
      post_date.getFullYear(),post_date.getMonth(),post_date.getDate(),24,0,0,0);
    for (let h = 0; h < a_ht.length; h++){
      var ht = a_ht[h];
      await dbo.collection("hashtags").updateOne(
      {
        hashtag:ht
      },
      {
        $inc :{popular:1},
        $set:{__v:0}
      },
      {
        upsert:true
      });
      await dbo.collection("hashtagbydates").updateOne(
      {
        hashtag: ht,
        createdAt: { $gte: start, $lte: end }
      },
      {
        $inc: { popularByDate: 1 },
        $set: {createdAt:post_date,updatedAt:post_date,__v:0}
      },
      {
        upsert: true
      });
    }
    resolve("insert hashtags done.");
  });
  console.log(await hashtagPromise);
}
async function insertComment(a_users,postId,post_comment,child_comment,post_date,dbo){
  let commentPromise = new Promise(async function(resolve) {
    var comment_count = getRandomInRange(post_comment + 1);
    for (var r=0;r<comment_count;r++){
      var child_comment_count = getRandomInRange(child_comment + 1);
      var comment_time = getTimeAfterTime(post_date,0);
      var commentObject = {
        "postId":postId,
        "userId":getRandom(a_users),
        "parentId":null,
        "comment":getRandom(a_comment),
        "replys":child_comment_count,
        "createdAt":comment_time,
        "updatedAt":comment_time,
        "__v":0
      }
      var r_comment = await dbo.collection("comments").insertOne(commentObject);
      await dbo.collection("posts").updateOne({_id:postId},{$inc:{comments:1}});

      for (var c=0;c<child_comment_count;c++){
        var child_time = getTimeAfterTime(comment_time,0);
        var childObject = {
          "postId":postId,
          "userId":getRandom(a_users),
          "parentId":r_comment.insertedId,
          "comment":getRandom(a_comment),
          "replys":0,
          "createdAt":child_time,
          "updatedAt":child_time,
          "__v":0
        }
        await dbo.collection("comments").insertOne(childObject);
        await dbo.collection("posts").updateOne({_id:postId},{$inc:{comments:1}});
      }
    }
    resolve("insert comments done");
  });
  console.log(await commentPromise);
}
async function insertReaction(a_users,postId,post_react,post_date,dbo){
  let reactionPromise = new Promise(async function(resolve) {
    var react_count = getRandomInRange(post_react + 1);
    for (var r=0;r<react_count;r++){
      var react_time = getTimeAfterTime(post_date,0);
      var action = getRandom(a_reaction);
      var reactObject = {
        "postId":postId,
        "userId":getRandom(a_users),
        "react":action,
        "createdAt":react_time,
        "updatedAt":react_time,
        "__v":0
      }
      await dbo.collection("reactions").insertOne(reactObject);
      await dbo.collection("posts").updateOne({_id:postId},getUpdate(action,1));
    }
    resolve("insert react done.");
  });
  console.log(await reactionPromise);
}
async function insertPost(a_users,a_posts,num_post,post_image,post_video,post_hashtag,post_react,post_comment,child_comment,dbo,groupId = null,a_members = null){
  let postPromise = new Promise(async function(resolve) {
    console.log("generate posts");

    if (!a_members) a_members = a_users;
    for (let i=0; i< a_members.length; i++)
      for (let j=0; j< num_post; j++){
        var a_ht = randomHashtagArray(hashtagRange,getRandomInRange(post_hashtag + 1));
        a_ht = [...new Set(a_ht)];

        let date = getTimePreviousTime(new Date(),getRandomInRange(180));

        var a_post_media = [];
        var a_mediafile = []
        for (let k=0; k< getRandomInRange(post_image + 1);k++){
          var post_media_obj = {
            type: "image",
            url: getRandom(a_image)
          }
          var mediafile_obj = {
            type: "image",
            url: getRandom(a_image),
            des: "bài đăng " + a_ht.join(" ")
          }
          a_post_media.push(post_media_obj);
          a_mediafile.push(mediafile_obj);
        }

        for (let k=0; k< getRandomInRange(post_video + 1);k++){
          var post_media_obj = {
            type: "video",
            url: getRandom(a_video)
          }
          var mediafile_obj = {
            type: "video",
            url: getRandom(a_video),
            des: "bài đăng " + a_ht.join(" ")
          }
          a_post_media.push(post_media_obj);
          a_mediafile.push(mediafile_obj);
        }

        var postObject;
        if (!groupId)
          postObject = {
            "user":a_members[i],
            "hashtags": a_ht,
            "isPublic":true,
            "description":"bài đăng " + a_ht.join(" "),
            "mediaFiles":a_post_media,
            "reactions":{"loves":0,"likes":0,"hahas":0,"wows":0,"sads":0,"angrys":0},
            "comments":0,
            "createdAt":date,
            "updatedAt":date,
            "__v":0
          };
        else postObject = {
        "user":a_members[i],
        "group": groupId,
        "hashtags": a_ht,
        "isPublic":true,
        "description":"bài đăng " + a_ht.join(" "),
        "mediaFiles":a_post_media,
        "reactions":{"loves":0,"likes":0,"hahas":0,"wows":0,"sads":0,"angrys":0},
        "comments":0,
        "createdAt":date,
        "updatedAt":date,
        "__v":0
        }
        var p_result = await dbo.collection("posts").insertOne(postObject);
        a_posts.push(p_result.insertedId);

        await insertMediaFile(a_members[i],a_mediafile,dbo,date,groupId);
        await insertHagtash(a_ht,date,dbo);
        await insertComment(a_users,p_result.insertedId,post_comment,child_comment,date,dbo);
        await insertReaction(a_users,p_result.insertedId,post_react,date,dbo);
    }
    resolve("insert posts done.");
  });
  console.log(await postPromise);
}

async function insertMediaFile(userId,a_media,dbo,date = null,groupId = null){
  let mediaFilePromise = new Promise(async function(resolve) {
    for (var i=0;i<a_media.length;i++){
      var media = a_media[i];
      if (!date) date = new Date(2010,1,1,4,3,5);
      var mediaFileObj;
      if (!groupId){
        mediaFileObj = {
        "user":userId,
        "type":media.type,
        "des":media.des,
        "url":media.url,
        "createdAt":date,
        "updatedAt":date,
        "__v":0};
      }
      else {
        mediaFileObj = {
        "user":userId,
        "group":groupId,
        "type":media.type,
        "des":media.des,
        "url":media.url,
        "createdAt":date,
        "updatedAt":date,
        "__v":0};
      }
      await dbo.collection("mediafiles").insertOne(mediaFileObj);
      }
    resolve("insert mediafiles dones.");
    });
  console.log(await mediaFilePromise);
}

MongoClient.connect(url,async function(err, db) {
  if (err) throw err;
  dbo = db.db("socialnetwork");
  let startPromise = new Promise(async function(resolve) {
    //reset users data
    var drop_users = await dbo.collection("users").drop();
    if (drop_users) console.log("Collection users deleted!");
    var create_users = await dbo.createCollection("users");
    if (create_users) console.log("Collection users created!");

    //reset posts data
    var drop_posts = await dbo.collection("posts").drop();
    if (drop_posts) console.log("Collection posts deleted!");
    var create_posts = await dbo.createCollection("posts");
    if (create_posts) console.log("Collection posts created!");

    //reset groups data
    var drop_groups = await dbo.collection("groups").drop();
    if (drop_groups) console.log("Collection groups deleted!");
    var create_groups = await dbo.createCollection("groups");
    if (create_groups) console.log("Collection groups created!");

    //reset hashtag data
    var drop_hashtags = await dbo.collection("hashtags").drop();
    if (drop_hashtags) console.log("Collection hashtags deleted!");
    var create_hashtags = await dbo.createCollection("hashtags");
    if (create_hashtags) console.log("Collection hashtags created!");

    //reset hashtagbydates data
    var drop_hashtagbydates = await dbo.collection("hashtagbydates").drop();
    if (drop_hashtagbydates) console.log("Collection hashtagbydates deleted!");
    var create_hashtagbydates = await dbo.createCollection("hashtagbydates");
    if (create_hashtagbydates) console.log("Collection hashtagbydates created!");

    //reset followings data
    var drop_followings = await dbo.collection("followings").drop();
    if (drop_followings) console.log("Collection followings deleted!");
    var create_followings = await dbo.createCollection("followings");
    if (create_followings) console.log("Collection followings created!");

    //reset comments data
    var drop_comments = await dbo.collection("comments").drop();
    if (drop_comments) console.log("Collection comments deleted!");
    var create_comments = await dbo.createCollection("comments");
    if (create_comments) console.log("Collection comments created!");

    //reset reactions data
    var drop_reactions = await dbo.collection("reactions").drop();
    if (drop_reactions) console.log("Collection reactions deleted!");
    var create_reactions = await dbo.createCollection("reactions");
    if (create_reactions) console.log("Collection reactions created!");

    
    resolve("reset data done");
  });
  console.log(await startPromise);

  //insert data
  var num_user = 20;
  var num_follow = 5;
  var num_post_private = 200;
  var num_post_image = 3;
  var num_post_video = 1;
  var num_post_hashtag = 5;
  var num_post_reaction = 20;
  var num_post_comment = 10;
  var num_post_child_comment = 2;
  var num_group = 10;
  var num_member = 10;
  var num_post_member = 5;
  await insertUser(a_users,num_user,dbo);
  await insertFollowing(a_users,num_follow,dbo);
  await insertPost(a_users,a_posts,num_post_private,num_post_image,num_post_video,
                    num_post_hashtag,num_post_reaction,num_post_comment,num_post_child_comment,dbo);
  await insertGroup(a_groups,a_users,a_posts,
                    num_group,num_member,num_post_member,
                    num_post_image,num_post_video,
                    num_post_hashtag,num_post_reaction,num_post_comment,num_post_child_comment,dbo);

  
  db.close();
  console.log("db close");
});