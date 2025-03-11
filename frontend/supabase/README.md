# Supabase Setup for KitchenAI

This directory contains the database schema and migrations for the KitchenAI application.

## Setting Up Supabase

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Copy your project URL and anon key from the Supabase dashboard (Project Settings > API)
3. Add these values to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup

### Schema Setup

Run the SQL in `migrations/20240311_schema.sql` in the Supabase SQL Editor to create the necessary tables with proper Row Level Security (RLS) policies.

### Authentication Setup

1. Go to Authentication > Settings in your Supabase dashboard
2. Configure your site URL to match your application URL (e.g., `http://localhost:3000` for local development)
3. Configure email templates for confirmation, invitation, and password reset emails
4. Under Email Templates > Confirm signup, change the action URL to:
   ```
   {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email
   ```

## Row Level Security (RLS)

All tables in this application use Row Level Security to ensure that users can only access their own data. The RLS policies are defined in the migration files.

## Database Schema

### Prompts Table

The `prompts` table stores the metadata for each prompt:

- `id`: UUID primary key
- `title`: The title of the prompt
- `description`: A description of the prompt
- `created_by`: The user ID of the creator
- `created_at`: The timestamp when the prompt was created
- `updated_at`: The timestamp when the prompt was last updated
- `current_version`: The current version number of the prompt

### Prompt Versions Table

The `prompt_versions` table stores the different versions of each prompt:

- `id`: UUID primary key
- `prompt_id`: The ID of the prompt this version belongs to
- `version`: The version number
- `messages`: A JSONB array of messages (system, user, assistant)
- `created_by`: The user ID of the creator
- `created_at`: The timestamp when the version was created
- `notes`: Optional notes about the version

## Local Development with Supabase

For local development, you can use the Supabase CLI to run a local instance of Supabase:

1. Install the Supabase CLI: [https://supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli)
2. Initialize a local Supabase project:
   ```
   supabase init
   ```
3. Start the local Supabase instance:
   ```
   supabase start
   ```
4. Apply the migrations:
   ```
   supabase db push
   ```

## Deploying to Production

When deploying to production, make sure to:

1. Update your site URL in the Supabase dashboard
2. Set the correct environment variables in your hosting provider
3. Run the migrations on your production Supabase instance 