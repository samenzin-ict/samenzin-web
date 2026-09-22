import * as migration_20260912_134641_initial from './20260912_134641_initial';
import * as migration_20260922_212206_donations from './20260922_212206_donations';
import * as migration_20260922_213029_page_drafts from './20260922_213029_page_drafts';

export const migrations = [
  {
    up: migration_20260912_134641_initial.up,
    down: migration_20260912_134641_initial.down,
    name: '20260912_134641_initial',
  },
  {
    up: migration_20260922_212206_donations.up,
    down: migration_20260922_212206_donations.down,
    name: '20260922_212206_donations',
  },
  {
    up: migration_20260922_213029_page_drafts.up,
    down: migration_20260922_213029_page_drafts.down,
    name: '20260922_213029_page_drafts'
  },
];
