import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  googleId: varchar("google_id", { length: 255 }),
  role: varchar("role", { length: 40 }).notNull().default("user"), // user|reporter|writer|editor|senior_editor|fact_checker|publisher|admin
  bio: text("bio").default(""),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  parentId: integer("parent_id"),
  description: text("description").default(""),
  icon: varchar("icon", { length: 60 }).default("newspaper"),
  color: varchar("color", { length: 20 }).default("#dc2626"),
  articleCount: integer("article_count").notNull().default(0),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
});

export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 300 }).notNull().unique(),
    title: varchar("title", { length: 500 }).notNull(),
    excerpt: text("excerpt").default(""),
    content: text("content").notNull(),
    coverImage: varchar("cover_image", { length: 500 }).default(""),
    authorId: integer("author_id").references(() => users.id),
    categoryId: integer("category_id").references(() => categories.id),
    country: varchar("country", { length: 120 }).default(""),
    region: varchar("region", { length: 120 }).default(""),
    type: varchar("type", { length: 40 }).notNull().default("news"), // news|opinion|investigation|feature|video|gallery|live
    status: varchar("status", { length: 40 }).notNull().default("published"), // draft|published|scheduled|archived
    factCheckStatus: varchar("fact_check_status", { length: 30 }).notNull().default("pending"), // verified|unverified|disputed|pending
    featured: boolean("featured").notNull().default(false),
    breaking: boolean("breaking").notNull().default(false),
    editorChoice: boolean("editor_choice").notNull().default(false),
    views: integer("views").notNull().default(0),
    likes: integer("likes").notNull().default(0),
    shares: integer("shares").notNull().default(0),
    readingTime: integer("reading_time").notNull().default(3),
    seoTitle: varchar("seo_title", { length: 300 }).default(""),
    seoDescription: text("seo_description").default(""),
    publishedAt: timestamp("published_at").defaultNow().notNull(),
    scheduledAt: timestamp("scheduled_at"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("articles_category_idx").on(t.categoryId),
    index("articles_country_idx").on(t.country),
    index("articles_region_idx").on(t.region),
    index("articles_status_idx").on(t.status),
    index("articles_published_idx").on(t.publishedAt),
    index("articles_views_idx").on(t.views),
  ]
);

export const articleTags = pgTable(
  "article_tags",
  {
    articleId: integer("article_id").references(() => articles.id, { onDelete: "cascade" }).notNull(),
    tagId: integer("tag_id").references(() => tags.id, { onDelete: "cascade" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.articleId, t.tagId] })]
);

export const articleSources = pgTable("article_sources", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").references(() => articles.id, { onDelete: "cascade" }).notNull(),
  label: varchar("label", { length: 200 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
});

export const articleVersions = pgTable("article_versions", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").references(() => articles.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  excerpt: text("excerpt").default(""),
  content: text("content").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").references(() => articles.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  authorName: varchar("author_name", { length: 120 }).notNull(),
  content: text("content").notNull(),
  status: varchar("status", { length: 30 }).notNull().default("visible"), // visible|hidden|flagged
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const likes = pgTable(
  "likes",
  {
    articleId: integer("article_id").references(() => articles.id, { onDelete: "cascade" }).notNull(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.articleId, t.userId] })]
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    articleId: integer("article_id").references(() => articles.id, { onDelete: "cascade" }).notNull(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.articleId, t.userId] })]
);

export const reads = pgTable("reads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id", { length: 128 }),
  articleId: integer("article_id").references(() => articles.id, { onDelete: "cascade" }).notNull(),
  at: timestamp("at").defaultNow().notNull(),
});

export const follows = pgTable(
  "follows",
  {
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    categoryId: integer("category_id").references(() => categories.id, { onDelete: "cascade" }),
    authorId: integer("author_id").references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.categoryId, t.authorId] })]
);

export const breakingNews = pgTable("breaking_news", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  summary: text("summary").default(""),
  content: text("content").default(""),
  status: varchar("status", { length: 30 }).notNull().default("live"), // live|developing|resolved
  severity: varchar("severity", { length: 20 }).notNull().default("high"), // low|medium|high|critical
  country: varchar("country", { length: 120 }).default(""),
  categoryId: integer("category_id").references(() => categories.id),
  articleId: integer("article_id").references(() => articles.id),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const breakingUpdates = pgTable("breaking_updates", {
  id: serial("id").primaryKey(),
  breakingId: integer("breaking_id").references(() => breakingNews.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  url: varchar("url", { length: 500 }).notNull(),
  type: varchar("type", { length: 30 }).notNull().default("image"), // image|video|audio
  title: varchar("title", { length: 300 }).default(""),
  alt: varchar("alt", { length: 300 }).default(""),
  metadata: jsonb("metadata").default({}),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const searches = pgTable("searches", {
  id: serial("id").primaryKey(),
  query: varchar("query", { length: 300 }).notNull(),
  results: integer("results").notNull().default(0),
  sessionId: varchar("session_id", { length: 128 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const newsletter = pgTable("newsletter", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 40 }).notNull().default("info"),
  message: text("message").notNull(),
  link: varchar("link", { length: 500 }).default(""),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pageViews = pgTable(
  "page_views",
  {
    id: serial("id").primaryKey(),
    path: varchar("path", { length: 500 }).notNull(),
    articleId: integer("article_id").references(() => articles.id, { onDelete: "set null" }),
    sessionId: varchar("session_id", { length: 128 }),
    country: varchar("country", { length: 120 }).default(""),
    referrer: varchar("referrer", { length: 500 }).default(""),
    device: varchar("device", { length: 40 }).default("desktop"),
    at: timestamp("at").defaultNow().notNull(),
  },
  (t) => [index("page_views_at_idx").on(t.at), index("page_views_path_idx").on(t.path)]
);

export const factChecks = pgTable("fact_checks", {
  id: serial("id").primaryKey(),
  claim: text("claim").notNull(),
  verdict: varchar("verdict", { length: 30 }).notNull(), // true|false|misleading|unproven
  explanation: text("explanation").notNull(),
  articleId: integer("article_id").references(() => articles.id),
  checkerId: integer("checker_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const explainers = pgTable("explainers", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  summary: text("summary").default(""),
  content: text("content").notNull(),
  category: varchar("category", { length: 120 }).default("General"),
  difficulty: varchar("difficulty", { length: 30 }).default("easy"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull().unique(),
  code: varchar("code", { length: 5 }).notNull().unique(),
  region: varchar("region", { length: 120 }).notNull(),
  capital: varchar("capital", { length: 150 }).default(""),
  population: varchar("population", { length: 60 }).default(""),
  currency: varchar("currency", { length: 80 }).default(""),
  languages: varchar("languages", { length: 200 }).default(""),
  summary: text("summary").default(""),
  mapX: integer("map_x").default(0),
  mapY: integer("map_y").default(0),
});

export const animals = pgTable("animals", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  scientificName: varchar("scientific_name", { length: 200 }).default(""),
  slug: varchar("slug", { length: 250 }).notNull().unique(),
  habitat: varchar("habitat", { length: 200 }).default(""),
  diet: varchar("diet", { length: 120 }).default(""),
  conservation: varchar("conservation", { length: 80 }).default(""),
  lifespan: varchar("lifespan", { length: 80 }).default(""),
  facts: text("facts").default(""),
  emoji: varchar("emoji", { length: 10 }).default("🐾"),
});

export const spaceObjects = pgTable("space_objects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 250 }).notNull().unique(),
  type: varchar("type", { length: 60 }).notNull(), // planet|star|galaxy|mission
  distance: varchar("distance", { length: 120 }).default(""),
  diameter: varchar("diameter", { length: 120 }).default(""),
  description: text("description").default(""),
  facts: text("facts").default(""),
  emoji: varchar("emoji", { length: 10 }).default("🪐"),
});

export const timelineEvents = pgTable("timeline_events", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  title: varchar("title", { length: 400 }).notNull(),
  description: text("description").default(""),
  category: varchar("category", { length: 120 }).default("World"),
  country: varchar("country", { length: 120 }).default(""),
  emoji: varchar("emoji", { length: 10 }).default("📜"),
});

export type User = typeof users.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type BreakingNews = typeof breakingNews.$inferSelect;
