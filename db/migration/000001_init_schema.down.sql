-- Drop tables in reverse order (to maintain foreign key constraints)
DROP TABLE IF EXISTS evaluations;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS prompt_versions;
DROP TABLE IF EXISTS prompts;
DROP TABLE IF EXISTS users; 