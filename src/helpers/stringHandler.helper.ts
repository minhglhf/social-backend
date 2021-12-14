import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
export class StringHandlersHelper {
  public generateString(length: number) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  public removeAccent(alias: string) {
    let str = alias;
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    str = str.replace(
      /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
      ' ',
    );
    str = str.replace(/ + /g, ' ');
    str = str.trim();
    return str;
  }
  public getHashtagFromString(description: string): string[] {
    let result = [];
    result = description.match(/#[a-z0-9_]+/g) as [string];
    if (!result) return [];
    return result;
  }
  public getStartAndEndDate(tz: string): string[] {
    dayjs.extend(timezone);
    dayjs.extend(utc);
    const end = dayjs().tz(tz).format();
    const start = dayjs().subtract(1, 'week').tz(tz).format();
    return [start, end];
  }
  public getDateWithTimezone(date: Date | string, tz: string): string {
    dayjs.extend(timezone);
    dayjs.extend(utc);
    return dayjs(date).tz(tz).format('YYYY-MM-DDTHH:mm:ss');
  }
}
