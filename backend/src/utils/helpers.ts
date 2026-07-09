import slugify from 'slugify';

export const generateSlug = (text: string, suffix?: string): string => {
  const base = slugify(text, { lower: true, strict: true });
  const sfx = suffix || Math.random().toString(36).substring(2, 7);
  return `${base}-${sfx}`;
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const sanitizeUser = (user: Record<string, unknown>) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, resetPasswordToken, emailVerifyToken, ...safe } = user;
  return safe;
};
