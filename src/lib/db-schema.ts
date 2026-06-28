export interface UserTable {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: "Admin" | "Editor" | "User";
  bio: string | null;
}

export interface SessionTable {
  id: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string;
}

export interface AccountTable {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  accessTokenExpiresAt: Date | null;
  refreshTokenExpiresAt: Date | null;
  scope: string | null;
  password?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationTable {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface ArticleTable {
  id: string;
  titleHindi: string;
  titleEnglish: string | null;
  slug: string;
  excerpt: string;
  excerptEnglish: string | null;
  content: string;
  contentEnglish: string | null;
  featuredImage: string;
  gallery: string[] | null;
  category: string;
  subcategory: string | null;
  locationTag: string;
  language: "hindi" | "english" | "bilingual";
  tags: string[] | null;
  isBreaking: boolean;
  isSticky: boolean;
  status: "Draft" | "Published";
  publishDate: Date;
  expiryDate: Date | null;
  authorId: string;
  readTime: number;
  views: number;
  metaTitle: string | null;
  metaDescription: string | null;
  isDeleted: boolean;
  correspondent: string | null;
  isEditorsChoice: boolean | null;
}

export interface CategoryTable {
  id: string;
  name: string;
  nameHindi: string;
  color: string;
  order: number;
  subcategories: string[] | null;
}

export interface LocationTable {
  id: string;
  name: string;
  nameHindi: string;
  parent: string | null;
}

export interface CommentTable {
  id: string;
  articleId: string;
  articleTitle: string;
  author: string;
  email: string;
  content: string;
  date: Date;
  status: "pending" | "approved" | "spam" | "trash";
}

export interface MediaItemTable {
  id: string;
  name: string;
  url: string;
  type: "image" | "video" | "pdf";
  size: string;
  date: string;
  width: number | null;
  height: number | null;
}

export interface PushNotificationTable {
  id: string;
  title: string;
  message: string;
  url: string;
  sentAt: Date;
  clicks: number;
}

export interface SiteSettingsTable {
  id: string;
  siteNameHindi: string;
  siteNameEnglish: string;
  logoUrl: string;
  faviconUrl: string;
  newsletterHeadline: string;
  newsletterHeadlineEnglish: string;
  newsletterSub: string;
  newsletterSubEnglish: string;
  whatsappNumber: string;
  facebookUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  googleAnalyticsId: string;
  adSlotHeader: string;
  adSlotSidebar: string;
  adSlotInContent: string;
  adSlotStickyFooter: string;
  trendingTopics: string | null;
  googleSiteVerification: string | null;
}

export interface VideoTable {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  thumbnailUrl: string;
  publishDate: Date;
  views: number;
}

export interface DatabaseSchema {
  user: UserTable;
  session: SessionTable;
  account: AccountTable;
  verification: VerificationTable;
  article: ArticleTable;
  category: CategoryTable;
  location: LocationTable;
  comment: CommentTable;
  media_item: MediaItemTable;
  push_notification: PushNotificationTable;
  site_settings: SiteSettingsTable;
  video: VideoTable;
}
