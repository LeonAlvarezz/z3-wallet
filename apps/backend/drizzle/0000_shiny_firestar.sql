CREATE TYPE "public"."CategoryRuleTypeEnum" AS ENUM('SYSTEM', 'USER');--> statement-breakpoint
CREATE TYPE "public"."CategoryColorEnum" AS ENUM('DEFAULT', 'YELLOW', 'GREEN', 'BLUE', 'GRAY', 'PURPLE', 'PINK', 'RED', 'ORANGE', 'TEAL');--> statement-breakpoint
CREATE TYPE "public"."OAuthProvider" AS ENUM('github', 'google');--> statement-breakpoint
CREATE TYPE "public"."TransactionTypeEnum" AS ENUM('TOP_UP', 'EXPENSE');--> statement-breakpoint
CREATE TABLE "auths" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"password_hash" text NOT NULL,
	"password_updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"category_id" integer NOT NULL,
	"type" "CategoryRuleTypeEnum" DEFAULT 'USER' NOT NULL,
	"keyword" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"icon" text NOT NULL,
	"color" "CategoryColorEnum" NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_order_unique" UNIQUE("order")
);
--> statement-breakpoint
CREATE TABLE "oauths" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"provider" "OAuthProvider" NOT NULL,
	"provider_account_id" text NOT NULL,
	"provider_login" text,
	"provider_email" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"session_token_hash" text NOT NULL,
	"ip" text,
	"user_agent" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "sessions_session_token_hash_unique" UNIQUE("session_token_hash")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"wallet_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" text,
	"type" "TransactionTypeEnum" DEFAULT 'EXPENSE' NOT NULL,
	"category_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"avatar_url" text,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "users_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(50) DEFAULT 'Saving Account' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "wallets_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
ALTER TABLE "auths" ADD CONSTRAINT "auths_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_rules" ADD CONSTRAINT "category_rules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_rules" ADD CONSTRAINT "category_rules_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauths" ADD CONSTRAINT "oauths_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_personal_rule" ON "category_rules" USING btree ("keyword","user_id") WHERE "category_rules"."type" = 'USER'::"CategoryRuleTypeEnum";--> statement-breakpoint
CREATE INDEX "idx_category_rules_user_id" ON "category_rules" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_category_rules_category_id" ON "category_rules" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_oauths_provider_account" ON "oauths" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_oauths_user_provider" ON "oauths" USING btree ("user_id","provider");--> statement-breakpoint
CREATE INDEX "idx_oauth_accounts_user_id" ON "oauths" USING btree ("user_id");