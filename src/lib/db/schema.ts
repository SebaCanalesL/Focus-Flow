import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const habits = sqliteTable("habits", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  color: text("color"),
  frequency: text("frequency").notNull(),
  count: integer("count").notNull(),
  total_count: integer("total_count").notNull(),
  created_at: text("created_at"),
  completed_dates: text("completed_dates", { mode: "json" }).$type<string[]>(),
});

export const gratitudes = sqliteTable("gratitudes", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  text: text("text").notNull(),
  created_at: text("created_at"),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  image: text("image"),
  created_at: text("created_at"),
});

export const routines = sqliteTable("routines", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  image: text("image"),
  benefits: text("benefits", { mode: "json" }).$type<string[]>(),
  category: text("category"),
  frequency: text("frequency"),
  days: text("days", { mode: "json" }).$type<string[]>(),
  stepIds: text("stepIds", { mode: "json" }).$type<string[]>(),
});

export type Habit = typeof habits.$inferSelect;
export type Gratitude = typeof gratitudes.$inferSelect;
export type User = typeof users.$inferSelect;
export type Routine = typeof routines.$inferSelect;
