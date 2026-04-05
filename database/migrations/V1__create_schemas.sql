-- ISEP Database Schemas (SRS-06)
-- Run as application user with CREATE privilege in DEV; or as DBA in higher envs.
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS documents;
CREATE SCHEMA IF NOT EXISTS workflow;
CREATE SCHEMA IF NOT EXISTS collaboration;
CREATE SCHEMA IF NOT EXISTS correspondence;
CREATE SCHEMA IF NOT EXISTS notifications;
CREATE SCHEMA IF NOT EXISTS audit;
