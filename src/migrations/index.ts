import * as migration_20260912_134641_initial from './20260912_134641_initial';
import * as migration_20260922_212206_donations from './20260922_212206_donations';
import * as migration_20260922_213029_page_drafts from './20260922_213029_page_drafts';
import * as migration_20260922_223834_projects from './20260922_223834_projects';
import * as migration_20260922_225624_articles from './20260922_225624_articles';
import * as migration_20260923_051853_events from './20260923_051853_events';
import * as migration_20260924_143107_commissions from './20260924_143107_commissions';

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
    name: '20260922_213029_page_drafts',
  },
  {
    up: migration_20260922_223834_projects.up,
    down: migration_20260922_223834_projects.down,
    name: '20260922_223834_projects',
  },
  {
    up: migration_20260922_225624_articles.up,
    down: migration_20260922_225624_articles.down,
    name: '20260922_225624_articles',
  },
  {
    up: migration_20260923_051853_events.up,
    down: migration_20260923_051853_events.down,
    name: '20260923_051853_events',
  },
  {
    up: migration_20260924_143107_commissions.up,
    down: migration_20260924_143107_commissions.down,
    name: '20260924_143107_commissions'
  },
];
