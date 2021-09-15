import { MailerService } from '@nestjs-modules/mailer';
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { clientUrl } from 'src/utils/constants';
import { Mail } from 'src/utils/enums';

@Processor('mail')
export class MailProcessor {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly mailerService: MailerService) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(
      `Processing job ${job.id} of type ${job.name}. Data: ${JSON.stringify(
        job.data,
      )}`,
    );
  }

  @OnQueueCompleted()
  onComplete(job: Job, result: any) {
    this.logger.debug(
      `Completed job ${job.id} of type ${job.name}. Result: ${JSON.stringify(
        result,
      )}`,
    );
  }

  @OnQueueFailed()
  onError(job: Job<any>, error: any) {
    this.logger.error(
      `Failed job ${job.id} of type ${job.name}: ${error.message}`,
      error.stack,
    );
  }

  @Process(Mail.Confirmation)
  async sendWelcomeEmail(
    job: Job<{ email: string; activationCode: string; displayName: string }>,
  ): Promise<any> {
    this.logger.log(`Sending confirmation email to '${job.data.email}'`);

    try {
      const result = await this.mailerService.sendMail({
        template: './confirmation',
        context: {
          displayName: job.data.displayName,
          activationCode: job.data.activationCode,
        },
        subject: 'Chào mừng đến với Will!',
        to: job.data.email,
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send invitation email to '${job.data.email}'`,
        error.stack,
      );
      throw error;
    }
  }
  @Process(Mail.Resetpassword)
  async sendPasswordResetMail(
    job: Job<{ email: string; token: string; displayName: string }>,
  ): Promise<any> {
    this.logger.log(`Sending password reset email to '${job.data.email}'`);
    const resetLink = `${clientUrl}/${job.data.token}`;
    try {
      const result = await this.mailerService.sendMail({
        template: './password-reset',
        context: {
          displayName: job.data.displayName,
          resetLink: resetLink,
        },
        subject: 'Đặt lại mật khẩu',
        to: job.data.email,
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send password reset to '${job.data.email}'`,
        error.stack,
      );
      throw error;
    }
  }
}
