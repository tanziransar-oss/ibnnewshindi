"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { normalizeRole, type AppRole } from "@/lib/roles";


// --- TYPES ---
export interface Article {
  id: string;
  titleHindi: string;
  titleEnglish?: string;
  slug: string;
  excerpt: string;
  excerptEnglish?: string;
  content: string;
  contentEnglish?: string;
  featuredImage: string;
  gallery?: string[];
  category: string;
  subcategory?: string;
  locationTag: string; // Meerut, Muzaffarnagar, etc.
  language: "hindi" | "english" | "bilingual";
  tags: string[];
  isBreaking: boolean;
  isSticky: boolean;
  status: "Draft" | "Published" | "Scheduled";
  publishDate: string;
  expiryDate?: string;
  authorId: string;
  readTime: number; // in minutes
  views: number;
  metaTitle?: string;
  metaDescription?: string;
  isDeleted?: boolean;
  correspondent?: string | null;
  isEditorsChoice?: boolean | null;
}

export interface Category {
  id: string;
  name: string; // English key
  nameHindi: string;
  color: string; // Hex code
  order: number;
  subcategories: string[];
}

export interface LocationTag {
  id: string;
  name: string;
  nameHindi: string;
  parent?: string; // West UP, etc.
}

export interface Comment {
  id: string;
  articleId: string;
  articleTitle: string;
  author: string;
  email: string;
  content: string;
  date: string;
  status: "pending" | "approved" | "spam" | "trash";
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: "image" | "video" | "pdf";
  size: string;
  date: string;
  width?: number;
  height?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  avatar: string;
  storiesCount: number;
  bio?: string | null;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  url: string;
  sentAt: string;
  clicks: number;
}

export interface SiteSettings {
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

interface AppContextType {
  articles: Article[];
  categories: Category[];
  locations: LocationTag[];
  comments: Comment[];
  media: MediaItem[];
  users: User[];
  notifications: PushNotification[];
  settings: SiteSettings;
  currentUser: User;
  loading: boolean;
  
  // Dynamic Language Translation State
  languageMode: "hi" | "en";
  setLanguageMode: (lang: "hi" | "en") => void;
  
  // Actions
  addArticle: (article: Omit<Article, "id" | "views">) => void;
  editArticle: (id: string, updated: Partial<Article>) => void;
  deleteArticle: (id: string) => void;
  restoreArticle: (id: string) => void;
  hardDeleteArticle: (id: string) => void;
  
  addBreakingNews: (headline: string, summary: string, cat: string, loc: string, notify: boolean) => void;
  
  moderateComment: (id: string, status: Comment["status"]) => void;
  addComment: (comment: Omit<Comment, "id" | "date" | "status">) => void;
  
  addCategory: (cat: Category) => void;
  editCategory: (id: string, updated: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  addLocation: (loc: LocationTag) => void;
  deleteLocation: (id: string) => void;
  
  addMediaItem: (item: MediaItem, skipDbInsert?: boolean) => void;
  deleteMediaItem: (id: string) => void;
  loadMedia: () => Promise<void>;
  
  addUser: (user: Omit<User, "id" | "storiesCount">) => void;
  deleteUser: (id: string) => void;
  updateUserRole: (id: string, role: User["role"]) => void;
  updateMyProfile: (updated: { name?: string; image?: string; bio?: string }) => Promise<User | null>;
  
  sendNotification: (title: string, message: string, url: string) => void;
  updateSettings: (updated: Partial<SiteSettings>) => void;
  incrementViews: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- INITIAL MOCK DATA ---
const INITIAL_CATEGORIES: Category[] = [
  { id: "1", name: "Meerut", nameHindi: "मेरठ", color: "#d6001c", order: 1, subcategories: ["Crime", "Politics", "Civic", "Education", "Health", "Business"] },
  { id: "2", name: "West UP", nameHindi: "पश्चिमी यूपी", color: "#d6001c", order: 2, subcategories: ["Farmers", "Muzaffarnagar", "Saharanpur", "Bijnor", "Baghpat", "Shamli"] },
  { id: "3", name: "National", nameHindi: "राष्ट्रीय", color: "#d6001c", order: 3, subcategories: ["Politics", "Economy", "Defense", "Foreign Policy"] },
  { id: "4", name: "Sports", nameHindi: "खेल", color: "#d6001c", order: 4, subcategories: ["Cricket", "IPL 2026", "Wrestling", "Athletics"] },
  { id: "5", name: "Tech", nameHindi: "टेक्नोलॉजी", color: "#d6001c", order: 5, subcategories: ["Mobiles", "AI & Robotics", "Internet", "Cyber Security"] },
];

const INITIAL_LOCATIONS: LocationTag[] = [
  { id: "1", name: "Meerut Sadar", nameHindi: "मेरठ सदर", parent: "Meerut" },
  { id: "2", name: "Kanker Khera", nameHindi: "कंकरखेड़ा", parent: "Meerut" },
  { id: "3", name: "Muzaffarnagar", nameHindi: "मुजफ्फरनगर", parent: "West UP" },
  { id: "4", name: "Saharanpur", nameHindi: "सहारनपुर", parent: "West UP" },
  { id: "5", name: "Bijnor", nameHindi: "बिजनौर", parent: "West UP" },
  { id: "6", name: "Shamli", nameHindi: "शामली", parent: "West UP" },
  { id: "7", name: "Baghpat", nameHindi: "बागपत", parent: "West UP" },
];

// Remove demo/fake users: keep users list empty by default
const INITIAL_USERS: User[] = [];

const GUEST_USER: User = {
  id: "",
  name: "Guest",
  email: "",
  role: "User",
  avatar: "",
  storiesCount: 0,
};

const INITIAL_MEDIA: MediaItem[] = [
  { id: "m1", name: "meerut_traffic.webp", url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&h=450&q=80", type: "image", size: "124 KB", date: "2026-05-23" },
  { id: "m2", name: "farmers_meeting.webp", url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&h=450&q=80", type: "image", size: "235 KB", date: "2026-05-22" },
  { id: "m3", name: "ipl_match_stadium.webp", url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&h=450&q=80", type: "image", size: "182 KB", date: "2026-05-21" },
  { id: "m4", name: "tech_ai_chip.webp", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&h=450&q=80", type: "image", size: "95 KB", date: "2026-05-23" },
];

const INITIAL_ARTICLES: Article[] = [
  {
    id: "art1",
    titleHindi: "मेरठ में भीषण सड़क हादसा: दिल्ली-देहरादून हाईवे पर कार और डंपर की टक्कर, 3 की मौत",
    titleEnglish: "Tragic Road Accident in Meerut: Car and Dumper Collide on Delhi-Dehradun Highway, 3 Dead",
    slug: "tragic-road-accident-in-meerut-highway-3-dead",
    excerpt: "मेरठ के कंकरखेड़ा क्षेत्र में बाईपास पर देर रात एक तेज रफ्तार कार बेकाबू होकर डंपर से टकरा गई। हादसे में 3 दोस्तों की मौके पर ही मौत हो गई।",
    excerptEnglish: "Three young friends from Meerut's Shastri Nagar died in a critical crash on Delhi-Dehradun Highway near Kanker Khera on Saturday night. Read more details.",
    content: `मेरठ के कंकरखेड़ा थाना क्षेत्र में शनिवार देर रात एक दर्दनाक हादसा हो गया। दिल्ली-देहरादून नेशनल हाईवे-58 पर तेज रफ्तार कार आगे चल रहे डंपर में पीछे से घुस गई। टक्कर इतनी भीषण थी कि कार के परखच्चे उड़ गए। कार सवार तीन युवकों की मौके पर ही मौत हो गई, जबकि दो गंभीर रूप से घायल हैं।

चश्मदीदों के अनुसार, कार की रफ्तार 100 किमी/घंटा से अधिक थी। पुलिस ने मौके पर पहुंचकर गैस कटर से कार के हिस्सों को काटकर शवों को बाहर निकाला। घायलों को सुभारती मेडिकल कॉलेज में भर्ती कराया गया है, जहां उनकी हालत नाजुक बनी हुई है।

मृतकों की पहचान अंकित (24), सुमित (26) और सागर (25) के रूप में हुई है, जो मेरठ के शास्त्रीनगर के रहने वाले थे। वे ऋषिकेश से वीकेंड मनाकर लौट रहे थे।

पुलिस क्षेत्राधिकारी ने बताया कि डंपर को कब्जे में ले लिया गया है और डंपर चालक की तलाश जारी है। हादसे के कारणों की जांच की जा रही है।`,
    contentEnglish: `In a horrifying incident in Meerut's Kanker Khera zone, three youths died on the spot when their speeding hatchback crashed into a dumper truck on the Delhi-Dehradun Highway (NH-58) late Saturday night. 

Two others are critically injured and hospitalized. The victims were returning from a weekend trip to Rishikesh. The deceased have been identified as Ankit (24), Sumit (26), and Sagar (25), residents of Shastri Nagar, Meerut. 

According to eyewitnesses, the car was speeding at over 100 km/h. Police arrived on the spot and had to use gas cutters to extract the bodies. The injured are undergoing treatment at Subharti Medical College where their condition remains highly critical.`,
    featuredImage: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&h=450&q=80",
    category: "Meerut",
    subcategory: "Crime",
    locationTag: "Kanker Khera",
    language: "bilingual",
    tags: ["MeerutAccident", "Highway58", "MeerutPolice", "Breaking"],
    isBreaking: true,
    isSticky: true,
    status: "Published",
    publishDate: "2026-05-23T20:30:00.000Z",
    authorId: "u2",
    readTime: 3,
    views: 1240,
    metaTitle: "Meerut Road Accident: 3 Dead on NH-58 Kanker Khera | IBN News",
    metaDescription: "Three young friends from Meerut's Shastri Nagar died in a critical crash on Delhi-Dehradun Highway near Kanker Khera on Saturday night. Read more details."
  },
  {
    id: "art2",
    titleHindi: "पश्चिमी यूपी में भारतीय किसान यूनियन (BKU) की महापंचायत: फसलों के दाम और बिजली बिल को लेकर किसानों का बड़ा ऐलान",
    titleEnglish: "BKU Mahapanchayat in West UP: Farmers Declare Mass Movement Over Crop Pricing and Electric Bills",
    slug: "bku-mahapanchayat-west-up-farmers-protest-announcement",
    excerpt: "मुजफ्फरनगर के राजकीय इंटर कॉलेज मैदान में बीकेयू की विशाल महापंचायत आयोजित की गई, जिसमें चौधरी नरेश टिकैत ने बिजली मीटरों के विरोध का आह्वान किया।",
    excerptEnglish: "BKU Mahapanchayat held in Muzaffarnagar ইন্টার College Ground, farmer leader Naresh Tikait issued protest calls against smart electricity meters starting June 1st.",
    content: `पश्चिमी उत्तर प्रदेश के मुजफ्फरनगर जिले में भारतीय किसान यूनियन (भाकियू) की महापंचायत में किसानों का जनसैलाब उमड़ पड़ा। राजकीय इंटर कॉलेज के विशाल मैदान में आयोजित इस महापंचायत में किसानों की विभिन्न समस्याओं, विशेष रूप से गन्ने की मूल्य वृद्धि, ट्यूबवेलों पर मुफ्त बिजली और स्मार्ट मीटर लगाने के विरोध में कड़े फैसले लिए गए।

महापंचायत को संबोधित करते हुए भाकियू के राष्ट्रीय अध्यक्ष चौधरी नरेश टिकैत ने कहा, "सरकार किसानों के धैर्य की परीक्षा न ले। यदि बिजली मीटरों के नाम पर शोषण बंद नहीं हुआ, तो किसान सड़कों पर उतरने के लिए मजबूर होंगे। हम आगामी 1 जून से पूरे वेस्ट यूपी में बड़ा आंदोलन शुरू करेंगे।"

किसान नेता राकेश टिकैत ने भी केंद्र व प्रदेश सरकार पर निशाना साधते हुए कहा कि स्वामीनाथन आयोग की सिफारिशों को लागू करना ही किसानों की भलाई का एकमात्र रास्ता है। महापंचायत में मेरठ, बागपत, शामली, बिजनौर और सहारनपुर से हजारों की संख्या में किसान ट्रैक्टर-ट्रॉली लेकर पहुंचे थे।`,
    contentEnglish: `Tens of thousands of farmers gathered at Muzaffarnagar's GIC Ground for the mega BKU Mahapanchayat. Led by Naresh Tikait and Rakesh Tikait, the union declared an aggressive regional agitation starting June 1st against prepaid electrical meters and low sugarcane state-advised prices.

Addressing the mahapanchayat, Naresh Tikait warned: "The government should not test the patience of our farmers. If exploitation under the guise of smart meters doesn't stop, we will take to the streets. A mass agitation will begin across West UP on June 1st."

Farmers from Meerut, Baghpat, Shamli, Bijnor, and Saharanpur arrived in thousands on tractor-trolleys to support the resolution.`,
    featuredImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&h=450&q=80",
    category: "West UP",
    subcategory: "Farmers",
    locationTag: "Muzaffarnagar",
    language: "bilingual",
    tags: ["FarmersProtest", "RakeshTikait", "MuzaffarnagarMahapanchayat", "UPGovernment"],
    isBreaking: false,
    isSticky: true,
    status: "Published",
    publishDate: "2026-05-23T18:15:00.000Z",
    authorId: "u3",
    readTime: 4,
    views: 890,
    metaTitle: "BKU Mahapanchayat Muzaffarnagar: Tikait Issues June 1 Protest Call",
    metaDescription: "Naresh Tikait addresses thousands of western UP farmers in Muzaffarnagar, opposing smart meters and demanding guaranteed MSP."
  },
  {
    id: "art3",
    titleHindi: "IPL 2026: लखनऊ सुपर जायंट्स ने चेन्नई सुपर किंग्स को 5 विकेट से हराया, केएल राहुल का धमाकेदार अर्धशतक",
    titleEnglish: "IPL 2026: Lucknow Super Giants Beat Chennai Super Kings by 5 Wickets, KL Rahul Scores Fifty",
    slug: "ipl-2026-lsg-vs-csk-kl-rahul-fifty-match-report",
    excerpt: "इकाना स्टेडियम में खेले गए रोमांचक मुकाबले में लखनऊ सुपर जायंट्स ने शानदार प्रदर्शन करते हुए चेन्नई सुपर किंग्स को 5 विकेट से शिकस्त दी।",
    excerptEnglish: "Lucknow Super Giants secured a comfortable 5-wicket victory over Chennai Super Kings at Ekana Stadium, thanks to captain KL Rahul's brilliant 65.",
    content: `आईपीएल 2026 के एक बेहद रोमांचक मुकाबले में लखनऊ सुपर जायंट्स (LSG) ने अपने घरेलू मैदान इकाना स्टेडियम में चेन्नई सुपर किंग्स (CSK) को 5 विकेट से हरा दिया। 176 रनों के लक्ष्य का पीछा करने उतरी लखनऊ की टीम ने 19.3 ओवर में 5 विकेट खोकर लक्ष्य हासिल कर लिया।

लखनऊ की जीत के हीरो रहे कप्तान केएल राहुल, जिन्होंने शानदार बल्लेबाजी करते हुए 43 गेंदों में 65 रनों की पारी खेली, जिसमें 6 चौके और 3 गगनचुंबी छक्के शामिल थे। मिडिल ऑर्डर में आयुष बदोनी ने 18 गेंदों में ताबड़तोड़ 32 रन बनाकर टीम को जीत की दहलीज पर पहुंचाया।

इससे पहले, चेन्नई सुपर किंग्स ने टॉस हारकर पहले बल्लेबाजी करते हुए ऋतुराज गायकवाड़ के 48 रनों और महेंद्र सिंह धोनी की आखरी ओवरों में खेली गई 9 गेंदों में 28 रनों की आतिशी पारी की बदौलत 20 ओवर में 6 विकेट खोकर 175 रन बनाए थे। लखनऊ की ओर से नवीन-उल-हक ने 2 विकेट चटकाए।`,
    contentEnglish: `Lucknow Super Giants (LSG) registered a clinical 5-wicket win over Chennai Super Kings (CSK) at Ekana Stadium in IPL 2026. Chasing a target of 176 runs, LSG reached 176/5 in 19.3 overs.

LSG captain KL Rahul led from the front with a spectacular knock of 65 off 43 balls (6 fours, 3 sixes). Ayush Badoni finished the chase in styling with a fiery 18-ball 32 in the death overs.

Earlier, CSK chose to bat and scored 175/6 in 20 overs, riding on Ruturaj Gaikwad's solid 48 and MS Dhoni's blistering cameo of 28 runs off just 9 balls. Naveen-ul-Haq took 2 wickets for LSG.`,
    featuredImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&h=450&q=80",
    category: "Sports",
    subcategory: "Cricket",
    locationTag: "National",
    language: "bilingual",
    tags: ["IPL2026", "LSGvsCSK", "KLRahul", "Dhoni"],
    isBreaking: false,
    isSticky: false,
    status: "Published",
    publishDate: "2026-05-22T21:40:00.000Z",
    authorId: "u4",
    readTime: 3,
    views: 2450,
    metaTitle: "LSG vs CSK IPL 2026: KL Rahul Fifty Guides Lucknow to Victory",
    metaDescription: "Lucknow Super Giants chased down 176 against Chennai Super Kings at Ekana Stadium, thanks to KL Rahul's brilliant 65-run knock."
  },
  {
    id: "art4",
    titleHindi: "भारत में लॉन्च हुआ नया 5G फ्लैगशिप प्रोसेसर, एआई फीचर्स से है लैस: मोबाइल गेमिंग का बदलेगा अनुभव",
    titleEnglish: "New AI-Powered 5G Flagship Processor Launched in India: Mobile Gaming Redefined",
    slug: "new-ai-5g-flagship-processor-launched-india-gaming",
    excerpt: "टेक जगत में आज एक बड़ा धमाका हुआ है। नए फ्लैगशिप एआई 5जी प्रोसेसर को भारतीय बाजार में पेश कर दिया गया है जो अत्यधिक तेज है।",
    excerptEnglish: "A next-generation AI-powered 5G flagship mobile processor launched in India, featuring 4nm architecture and advanced generative offline tools.",
    content: `भारतीय टेक बाजार में आज स्मार्टफोन प्रेमियों के लिए एक बेहद रोमांचक खबर आया है। प्रमुख प्रोसेसर निर्माता कंपनी ने अपने नवीनतम नेक्स्ट-जेनरेशन फ्लैगशिप 5जी चिपसेट को आधिकारिक तौर पर पेश कर दिया है। यह नया प्रोसेसर न केवल सुपरफास्ट 5G कनेक्टिविटी देता है, बल्कि ऑन-डिवाइस जेनेरेटिव एआई क्षमता से भी लैस है।

विशेषज्ञों का मानना है कि यह चिपसेट मोबाइल गेमिंग और मल्टीटास्किंग के अनुभव को पूरी तरह बदल देगा। इसमें 4 नैनोमीटर आर्किटेक्चर का उपयोग किया गया है जिससे बैटरी की खपत लगभग 30 प्रतिशत कम होगी। 

इसके साथ ही, इसमें इंटीग्रेटेड न्यूरल प्रोसेसिंग यूनिट (NPU) है जो रियल-टाइम फोटो एन्हांसमेंट, लाइव वॉयस ट्रांसलेशन और स्मार्ट प्रेडिक्टिव टेक्स्ट फीचर्स को बिना इंटरनेट कनेक्टिविटी के चलाने की सुविधा देती है। इस प्रोसेसर वाले पहले स्मार्टफोन अगले महीने के मध्य तक बाजार में देखने को मिल सकते हैं।`,
    contentEnglish: `Indian smartphone market witnessed a major technological launch today with the official release of a next-generation flagship 5G chipset. This new processor brings ultra-fast 5G alongside massive on-device Generative AI processing.

Engineered on a highly efficient 4nm architecture, it consumes 30% less battery during heavy workloads. An integrated neural processing unit (NPU) powers real-time offline photo edits, instant language translations, and smart predictions. The first batch of smartphones carrying this chipset is expected next month.`,
    featuredImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&h=450&q=80",
    category: "Tech",
    subcategory: "Mobiles",
    locationTag: "National",
    language: "bilingual",
    tags: ["TechNews", "5GProcessor", "ArtificialIntelligence", "MobileGaming"],
    isBreaking: false,
    isSticky: false,
    status: "Published",
    publishDate: "2026-05-23T11:00:00.000Z",
    authorId: "u1",
    readTime: 3,
    views: 450,
    metaTitle: "Flagship AI 5G Processor Launch India: What's New | IBN Tech",
    metaDescription: "Read about the newly launched 5G AI flagship processor in India, featuring 4nm architecture, 30% battery efficiency, and advanced offline gaming."
  },
  {
    id: "art5",
    titleHindi: "मेरठ का ऐतिहासिक नौचंदी मेला इस साल नए रूप में: 25 मई से शुरू, सुरक्षा के कड़े इंतजाम",
    titleEnglish: "Meerut's Historic Nauchandi Mela in a New Avatar This Year: Starts May 25, Elaborate Security Arranged",
    slug: "meerut-nauchandi-mela-starts-may-25-security-updates",
    excerpt: "मेरठ की साझी विरासत का प्रतीक ऐतिहासिक नौचंदी मेला इस वर्ष भव्य रूप में आयोजित होने जा रहा है। कमिश्नर ने तैयारियों का जायजा लिया।",
    excerptEnglish: "The historic Nauchandi Mela in Meerut starts on May 25 with grand cultural themes and comprehensive high-tech drone security networks.",
    content: `मेरठ की ऐतिहासिक धरोहर और साझी संस्कृति का प्रतीक 'नौचंदी मेला' इस वर्ष 25 मई से शुरू होने जा रहा है। प्रशासनिक स्तर पर तैयारियों को अंतिम रूप दिया जा रहा है। इस बार मेले को आधुनिक और अधिक आकर्षक रूप देने के लिए विशेष लेजर शो, विशाल फूड कोर्ट और सांस्कृतिक मंच तैयार किए जा रहे हैं।

मेरठ की मंडलायुक्त (कमिश्नर) ने अधिकारियों के साथ मेला ग्राउंड का निरीक्षण किया और सुरक्षा के साथ-साथ साफ-सफाई के कड़े निर्देश दिए। मेले में इस बार सीसीटीवी कैमरों और ड्रोन कैमरों से चप्पे-चप्पे पर नजर रखी जाएगी। 

मेले की सुरक्षा व्यवस्था के लिए 500 से अधिक अतिरिक्त पुलिसकर्मी, पीएसी की दो कंपनियां और महिला पुलिस बल तैनात किया गया है। इसके अलावा, ट्रैफिक डायवर्जन प्लान भी तैयार किया गया है ताकि शहरवासियों को जाम की समस्या से न जूझना पड़े। मेले का उद्घाटन 25 मई की शाम भव्य रंगारंग कार्यक्रमों के साथ किया जाएगा।`,
    contentEnglish: `The historic Nauchandi Mela, a symbol of communal harmony and Meerut's rich heritage, is set to commence on May 25th with a grand opening ceremony. Local administration has installed robust CCTV coverage, drone monitoring networks, and deployed 500+ police personnel to manage security.

The Divisional Commissioner visited the grounds, directing strict cleanliness and crowd management protocols. Dedicated laser shows, diverse food courts, and multiple cultural stages are being prepared to make the event memorable.`,
    featuredImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&h=450&q=80",
    category: "Meerut",
    subcategory: "Civic",
    locationTag: "Meerut Sadar",
    language: "bilingual",
    tags: ["NauchandiMela", "MeerutHeritage", "UPTourism", "MeerutCivic"],
    isBreaking: false,
    isSticky: false,
    status: "Published",
    publishDate: "2026-05-23T14:20:00.000Z",
    authorId: "u2",
    readTime: 3,
    views: 670,
    metaTitle: "Meerut Nauchandi Mela 2026: Dates, Theme, Security & Highlights",
    metaDescription: "Historical Nauchandi Mela starting on May 25 in Meerut with high-tech surveillance and vibrant cultural stages. Get details here."
  }
];

const INITIAL_COMMENTS: Comment[] = [
  {
    id: "c1",
    articleId: "art1",
    articleTitle: "मेरठ में भीषण सड़क हादसा: दिल्ली-देहरादून हाईवे पर कार और डंपर की टक्कर, 3 की मौत",
    author: "अमित चौधरी",
    email: "amit.c@gmail.com",
    content: "यह बहुत ही दुखद समाचार है। इस हाईवे पर रात में तेज रफ्तार ट्रकों और डंपरों पर कोई नियंत्रण नहीं रहता। प्रशासन को इस पर कड़ा कदम उठाना चाहिए!",
    date: "2026-05-23T20:45:00.000Z",
    status: "approved"
  },
  {
    id: "c2",
    articleId: "art1",
    articleTitle: "मेरठ में भीषण सड़क हादसा: दिल्ली-देहरादून हाईवे पर कार और डंपर की टक्कर, 3 की मौत",
    author: "Rahul Sharma",
    email: "rahul.sharma@yahoo.com",
    content: "Very sad news. Highway NH-58 needs strict speed limit checks. Condolences to the families of Shastri Nagar boys.",
    date: "2026-05-23T20:50:00.000Z",
    status: "approved"
  },
  {
    id: "c3",
    articleId: "art2",
    articleTitle: "पश्चिमी यूपी में भारतीय किसान यूनियन (BKU) की महापंचायत: फसलों के दाम...",
    author: "सचिन चौधरी",
    email: "sachin.farmers@outlook.com",
    content: "किसानों की मांगें बिल्कुल जायज हैं। बिजली का निजीकरण और प्रीपेड मीटर लगाना खेती को पूरी तरह बर्बाद कर देगा। हम सब मिलकर 1 जून के आंदोलन का समर्थन करेंगे।",
    date: "2026-05-23T19:00:00.000Z",
    status: "pending"
  }
];

const INITIAL_NOTIFICATIONS: PushNotification[] = [
  { id: "n1", title: "🚨 Breaking News", message: "मेरठ हाईवे पर दर्दनाक हादसा, 3 युवकों की मौत। पढ़ें लाइव अपडेट्स...", url: "/article/tragic-road-accident-in-meerut-highway-3-dead", sentAt: "2026-05-23T20:32:00.000Z", clicks: 312 },
  { id: "n2", title: "🌾 किसान आंदोलन", message: "भाकियू ने किया वेस्ट यूपी में बड़े आंदोलन का ऐलान, 1 जून से महाक्रांति।", url: "/article/bku-mahapanchayat-west-up-farmers-protest-announcement", sentAt: "2026-05-23T18:20:00.000Z", clicks: 145 }
];

const INITIAL_SETTINGS: SiteSettings = {
  siteNameHindi: "आईबीएन न्यूज हिन्दी",
  siteNameEnglish: "IBN News Hindi",
  logoUrl: "/logo.png",
  faviconUrl: "/favicon.ico",
  newsletterHeadline: "मेरठ और पश्चिमी उत्तर प्रदेश की खबरें पाएं सीधे ईमेल पर",
  newsletterHeadlineEnglish: "Get Meerut & West UP News Directly in Your Inbox",
  newsletterSub: "रोजाना सुबह की ताजा खबरों और महत्वपूर्ण समाचारों के लिए आज ही सब्सक्राइब करें।",
  newsletterSubEnglish: "Subscribe today to receive daily local news digests, reports and breaking alerts.",
  whatsappNumber: "+919876543210",
  facebookUrl: "https://facebook.com/ibnnewshindi",
  twitterUrl: "https://twitter.com/ibnnewshindi",
  youtubeUrl: "https://youtube.com/ibnnewshindi",
  instagramUrl: "https://instagram.com/ibnnewshindi",
  googleAnalyticsId: "UA-12345678-9",
  adSlotHeader: "Header Ad Banner Placeholder (728x90 px)",
  adSlotSidebar: "Sidebar Ad Widget Placeholder (300x250 px)",
  adSlotInContent: "In-Content Inline Ad Unit (Responsive)",
  adSlotStickyFooter: "Sticky Footer Anchor Ad Unit (320x50 px)",
  trendingTopics: null,
  googleSiteVerification: null,
};

// --- PROVIDER COMPONENT ---
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationTag[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [profile, setProfile] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const { data: session } = authClient.useSession();
  const sessionUser = session?.user;
  const resolvedCurrentUser = profile
    ?? (sessionUser ? users.find((user) => user.id === sessionUser.id || user.email === sessionUser.email) : null);
  const currentUser: User = resolvedCurrentUser
    ? resolvedCurrentUser
    : sessionUser
      ? {
          id: sessionUser.id,
          name: sessionUser.name,
          email: sessionUser.email,
          role: normalizeRole((sessionUser as any).role),
          avatar: sessionUser.image || "",
          storiesCount: articles.filter((art) => art.authorId === sessionUser.id).length,
        }
      : GUEST_USER;
  const [loading, setLoading] = useState(true);
  
  // Dynamic Global Language Switcher Mode
  const [languageMode, setLanguageModeState] = useState<"hi" | "en">("hi");

  const loadMedia = useCallback(async () => {
    try {
      const res = await fetch("/api/media").then(r => r.ok ? r.json() : INITIAL_MEDIA);
      setMedia(res);
    } catch (err) {
      console.error("Error lazy loading media library:", err);
    }
  }, []);

  // 1. Fetch unified bootstrap collections from Neon DB backend on mount
  useEffect(() => {
    async function loadDatabase() {
      try {
        const bootstrap = await fetch("/api/bootstrap").then(r => {
          if (!r.ok) throw new Error("Bootstrap request failed");
          return r.json();
        });

        // Set all React states batching them in one render sequence
        setArticles(bootstrap.articles || []);
        setCategories(bootstrap.categories || []);
        setLocations(bootstrap.locations || []);
        setComments(bootstrap.comments || []);
        setNotifications(bootstrap.notifications || []);
        setUsers(bootstrap.users || []);

        if (bootstrap.profile) {
          setProfile({
            id: bootstrap.profile.id,
            name: bootstrap.profile.name,
            email: bootstrap.profile.email,
            avatar: bootstrap.profile.image || "",
            role: bootstrap.profile.role,
            storiesCount: (bootstrap.articles || []).filter((art: any) => art.authorId === bootstrap.profile.id).length,
            bio: bootstrap.profile.bio || "",
          });
          // ensure DB persists Google photo on first sign-in
          if (bootstrap.profile.image) {
            fetch("/api/profile", { method: "POST" }).catch(() => {});
          }
        }
        if (bootstrap.settings) setSettings(bootstrap.settings);

        // Conditional lazy loading: if user starts on /admin, fetch media immediately in the background
        const isAdminPath = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
        if (isAdminPath) {
          loadMedia();
        }
      } catch (err) {
        console.error("Failed to connect to Neon DB bootstrap. Falling back to default mock data.", err);
        const parsedArticles = INITIAL_ARTICLES.map((art: any) => ({
          ...art,
          views: Number(art.views) || 0,
          readTime: Number(art.readTime) || 0,
        }));
        setArticles(parsedArticles);
        setCategories(INITIAL_CATEGORIES);
        setLocations(INITIAL_LOCATIONS);
        setComments(INITIAL_COMMENTS);
        setMedia(INITIAL_MEDIA);
        setNotifications(INITIAL_NOTIFICATIONS);
        setUsers(INITIAL_USERS);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    if (typeof window !== "undefined") {
      const storedLang = localStorage.getItem("ibn_language_mode") as "hi" | "en";
      if (storedLang) setLanguageModeState(storedLang);
    }
    loadDatabase();
  }, []);

  const setLanguageMode = (lang: "hi" | "en") => {
    setLanguageModeState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("ibn_language_mode", lang);
    }
  };

  // --- ACTIONS WITH LIVE NEON DB SYNC ---

  const addArticle = async (newArt: Omit<Article, "id" | "views">) => {
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newArt),
      });
      const saved = await res.json();
      setArticles(prev => [saved, ...prev]);

      if (saved.isBreaking) {
        sendNotification("🚨 " + saved.titleHindi, saved.excerpt, `/article/${saved.slug}`);
      }
    } catch (err) {
      console.error("Error creating article:", err);
    }
  };

  const editArticle = async (id: string, updated: Partial<Article>) => {
    try {
      await fetch(`/api/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      setArticles(prev => prev.map(art => (art.id === id ? { ...art, ...updated } : art)));
    } catch (err) {
      console.error("Error updating article:", err);
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      await fetch(`/api/articles/${id}`, { method: "DELETE" });
      setArticles(prev => prev.map(art => (art.id === id ? { ...art, isDeleted: true } : art)));
    } catch (err) {
      console.error("Error soft-deleting article:", err);
    }
  };

  const restoreArticle = async (id: string) => {
    try {
      await fetch(`/api/articles/${id}?action=restore`, { method: "PATCH" });
      setArticles(prev => prev.map(art => (art.id === id ? { ...art, isDeleted: false } : art)));
    } catch (err) {
      console.error("Error restoring article:", err);
    }
  };

  const hardDeleteArticle = async (id: string) => {
    try {
      await fetch(`/api/articles/${id}?hard=true`, { method: "DELETE" });
      setArticles(prev => prev.filter(art => art.id !== id));
    } catch (err) {
      console.error("Error hard-deleting article:", err);
    }
  };

  const addBreakingNews = async (headline: string, summary: string, cat: string, loc: string, notify: boolean) => {
    const generatedSlug = headline.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/g, "-");
    const freshPayload = {
      titleHindi: headline,
      titleEnglish: headline,
      slug: generatedSlug || "breaking-" + Date.now(),
      excerpt: summary || headline,
      content: summary || headline,
      featuredImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&h=450&q=80",
      category: cat || "Meerut",
      locationTag: loc || "National",
      language: "hindi" as const,
      tags: ["Breaking"],
      isBreaking: true,
      isSticky: true,
      status: "Published" as const,
      authorId: currentUser.id,
      readTime: 1,
    };

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(freshPayload),
      });
      const saved = await res.json();
      setArticles(prev => [saved, ...prev]);

      if (notify) {
        sendNotification("🚨 " + headline, summary || "ब्रेकिंग न्यूज़ अलर्ट", `/article/${saved.slug}`);
      }
    } catch (err) {
      console.error("Error dispatching breaking news:", err);
    }
  };

  const moderateComment = async (id: string, status: Comment["status"]) => {
    try {
      await fetch("/api/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setComments(prev => prev.map(c => (c.id === id ? { ...c, status } : c)));
    } catch (err) {
      console.error("Error moderating comment:", err);
    }
  };

  const addComment = async (newComment: Omit<Comment, "id" | "date" | "status">) => {
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComment),
      });
      const saved = await res.json();
      setComments(prev => [saved, ...prev]);
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const addCategory = async (cat: Category) => {
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cat),
      });
      const saved = await res.json();
      setCategories(prev => [...prev, saved].sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error("Error adding category:", err);
    }
  };

  const editCategory = async (id: string, updatedFields: Partial<Category>) => {
    try {
      await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updatedFields }),
      });
      setCategories(prev => prev.map(cat => (cat.id === id ? { ...cat, ...updatedFields } : cat)));
    } catch (err) {
      console.error("Error updating category:", err);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  const addLocation = async (loc: LocationTag) => {
    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loc),
      });
      const saved = await res.json();
      setLocations(prev => [...prev, saved]);
    } catch (err) {
      console.error("Error adding location bureau:", err);
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      await fetch(`/api/locations?id=${id}`, { method: "DELETE" });
      setLocations(prev => prev.filter(loc => loc.id !== id));
    } catch (err) {
      console.error("Error deleting location bureau:", err);
    }
  };

  const addMediaItem = async (item: MediaItem, skipDbInsert = false) => {
    try {
      if (skipDbInsert) {
        setMedia(prev => [item, ...prev]);
        return;
      }
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      const saved = await res.json();
      setMedia(prev => [saved, ...prev]);
    } catch (err) {
      console.error("Error registering media record:", err);
    }
  };

  const deleteMediaItem = async (id: string) => {
    try {
      await fetch(`/api/media?id=${id}`, { method: "DELETE" });
      setMedia(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error("Error purging media file:", err);
    }
  };

  const addUser = (newUser: Omit<User, "id" | "storiesCount">) => {
    const fresh: User = {
      ...newUser,
      id: "u_" + Date.now(),
      storiesCount: 0,
    };
    setUsers(prev => [...prev, fresh]);
  };

  const updateMyProfile = async (updated: { name?: string; image?: string; bio?: string }) => {
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (!res.ok) {
        return null;
      }

      const saved = await res.json();
      setProfile(saved);
      setUsers(prev => prev.map((user) => (user.id === saved.id || user.email === saved.email ? { ...user, ...saved } : user)));
      return saved;
    } catch (err) {
      console.error("Error updating profile:", err);
      return null;
    }
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const updateUserRole = async (id: string, role: User["role"]) => {
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
      } else {
        console.error("Failed to update user role in Neon DB");
      }
    } catch (err) {
      console.error("Error updating user role:", err);
    }
  };

  const sendNotification = async (title: string, message: string, url: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, url }),
      });
      const saved = await res.json();
      setNotifications(prev => [saved, ...prev]);

      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification(title, { body: message });
        }
      }
    } catch (err) {
      console.error("Error pushing alert:", err);
    }
  };

  const updateSettings = async (updated: Partial<SiteSettings>) => {
    const payload = { ...settings, ...updated };
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const saved = await res.json();
      setSettings(saved);
    } catch (err) {
      console.error("Error saving site config:", err);
    }
  };

  const incrementViews = async (id: string) => {
    try {
      await fetch(`/api/articles/${id}?action=view`, { method: "PATCH" });
      setArticles(prev => prev.map(art => (art.id === id ? { ...art, views: Number(art.views || 0) + 1 } : art)));
    } catch (err) {
      console.error("Error logging viewership metric:", err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        articles,
        categories,
        locations,
        comments,
        media,
        users,
        notifications,
        settings,
        currentUser,
        loading,
        
        languageMode,
        setLanguageMode,
        
        addArticle,
        editArticle,
        deleteArticle,
        restoreArticle,
        hardDeleteArticle,
        addBreakingNews,
        moderateComment,
        addComment,
        addCategory,
        editCategory,
        deleteCategory,
        addLocation,
        deleteLocation,
        addMediaItem,
        deleteMediaItem,
        loadMedia,
        addUser,
        deleteUser,
        updateUserRole,
        updateMyProfile,
        sendNotification,
        updateSettings,
        incrementViews,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

