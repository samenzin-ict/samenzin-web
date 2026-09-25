import * as migration_20260912_134641_initial from './20260912_134641_initial';
import * as migration_20260922_212206_donations from './20260922_212206_donations';
import * as migration_20260922_213029_page_drafts from './20260922_213029_page_drafts';
import * as migration_20260922_223834_projects from './20260922_223834_projects';
import * as migration_20260922_225624_articles from './20260922_225624_articles';
import * as migration_20260923_051853_events from './20260923_051853_events';
import * as migration_20260924_143107_commissions from './20260924_143107_commissions';
import * as migration_20260924_150346_volunteer_applications from './20260924_150346_volunteer_applications';
import * as migration_20260924_151246_courses from './20260924_151246_courses';
import * as migration_20260924_164954_membership_applications from './20260924_164954_membership_applications';
import * as migration_20260924_215010_members from './20260924_215010_members';
import * as migration_20260924_222526_volunteer_hours from './20260924_222526_volunteer_hours';
import * as migration_20260924_230318_article_categories from './20260924_230318_article_categories';
import * as migration_20260924_231355_volunteer_intake from './20260924_231355_volunteer_intake';
import * as migration_20260925_022716_member_portal from './20260925_022716_member_portal';
import * as migration_20260925_023651_vacancies_and_vog from './20260925_023651_vacancies_and_vog';

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
    name: '20260924_143107_commissions',
  },
  {
    up: migration_20260924_150346_volunteer_applications.up,
    down: migration_20260924_150346_volunteer_applications.down,
    name: '20260924_150346_volunteer_applications',
  },
  {
    up: migration_20260924_151246_courses.up,
    down: migration_20260924_151246_courses.down,
    name: '20260924_151246_courses',
  },
  {
    up: migration_20260924_164954_membership_applications.up,
    down: migration_20260924_164954_membership_applications.down,
    name: '20260924_164954_membership_applications',
  },
  {
    up: migration_20260924_215010_members.up,
    down: migration_20260924_215010_members.down,
    name: '20260924_215010_members',
  },
  {
    up: migration_20260924_222526_volunteer_hours.up,
    down: migration_20260924_222526_volunteer_hours.down,
    name: '20260924_222526_volunteer_hours',
  },
  {
    up: migration_20260924_230318_article_categories.up,
    down: migration_20260924_230318_article_categories.down,
    name: '20260924_230318_article_categories',
  },
  {
    up: migration_20260924_231355_volunteer_intake.up,
    down: migration_20260924_231355_volunteer_intake.down,
    name: '20260924_231355_volunteer_intake',
  },
  {
    up: migration_20260925_022716_member_portal.up,
    down: migration_20260925_022716_member_portal.down,
    name: '20260925_022716_member_portal',
  },
  {
    up: migration_20260925_023651_vacancies_and_vog.up,
    down: migration_20260925_023651_vacancies_and_vog.down,
    name: '20260925_023651_vacancies_and_vog'
  },
];
