CREATE TABLE "analysis" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"git_repo" text NOT NULL,
	"analysis_type" text NOT NULL,
	"context" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analysis" ADD CONSTRAINT "analysis_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "analysis_user_repo_type_idx" ON "analysis" USING btree ("user_id","git_repo","analysis_type");--> statement-breakpoint
CREATE INDEX "analysis_userId_idx" ON "analysis" USING btree ("user_id");