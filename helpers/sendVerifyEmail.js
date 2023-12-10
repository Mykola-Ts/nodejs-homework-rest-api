import { sendEmail } from "./index.js";

const { BASE_URL } = process.env;

export const sendVerifyEmail = async (email, verificationToken) => {
  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target='_blank' href='${BASE_URL}/users/verify/${verificationToken}'>Click to verify email</a>`,
  };

  await sendEmail(verifyEmail);
};
