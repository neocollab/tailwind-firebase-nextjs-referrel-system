/**
 * Extra options returned for the invite options
 * Will be inputted into the next auth sign in function, and to personalize email invites
 *
 * @export
 * @interface InviteOptions
 */
export interface ExtraEmailOptions {
    email?: string;
    callbackUrl?: string;
    emailType?: 'invite';
    senderName?: string;
    emailSubject?: string;
};