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
import * as migration_20261001_131451_contact_retention from './20261001_131451_contact_retention';
import * as migration_20261003_142915_volunteer_status from './20261003_142915_volunteer_status';
import * as migration_20261003_144340_donation_project from './20261003_144340_donation_project';
import * as migration_20261003_144849_retention_members_donations from './20261003_144849_retention_members_donations';
import * as migration_20261003_224944_certificates from './20261003_224944_certificates';
import * as migration_20261006_112509_board_photo_and_bio from './20261006_112509_board_photo_and_bio';
import * as migration_20261006_181750_project_phase_and_order from './20261006_181750_project_phase_and_order';
import * as migration_20261006_184500_project_details from './20261006_184500_project_details';
import * as migration_20261006_190940_featured_items_source from './20261006_190940_featured_items_source';
import * as migration_20261013_183731_page_sections_and_highlights from './20261013_183731_page_sections_and_highlights';
import * as migration_20261014_113653_section_single_column from './20261014_113653_section_single_column';
import * as migration_20261014_124219_menu_groups_and_hero_banner from './20261014_124219_menu_groups_and_hero_banner';
import * as migration_20261016_220613_article_sections from './20261016_220613_article_sections';
import * as migration_20261021_170000_donation_fund_general from './20261021_170000_donation_fund_general';

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
    name: '20260925_023651_vacancies_and_vog',
  },
  {
    up: migration_20261001_131451_contact_retention.up,
    down: migration_20261001_131451_contact_retention.down,
    name: '20261001_131451_contact_retention',
  },
  {
    up: migration_20261003_142915_volunteer_status.up,
    down: migration_20261003_142915_volunteer_status.down,
    name: '20261003_142915_volunteer_status',
  },
  {
    up: migration_20261003_144340_donation_project.up,
    down: migration_20261003_144340_donation_project.down,
    name: '20261003_144340_donation_project',
  },
  {
    up: migration_20261003_144849_retention_members_donations.up,
    down: migration_20261003_144849_retention_members_donations.down,
    name: '20261003_144849_retention_members_donations',
  },
  {
    up: migration_20261003_224944_certificates.up,
    down: migration_20261003_224944_certificates.down,
    name: '20261003_224944_certificates',
  },
  {
    up: migration_20261006_112509_board_photo_and_bio.up,
    down: migration_20261006_112509_board_photo_and_bio.down,
    name: '20261006_112509_board_photo_and_bio',
  },
  {
    up: migration_20261006_181750_project_phase_and_order.up,
    down: migration_20261006_181750_project_phase_and_order.down,
    name: '20261006_181750_project_phase_and_order',
  },
  {
    up: migration_20261006_184500_project_details.up,
    down: migration_20261006_184500_project_details.down,
    name: '20261006_184500_project_details',
  },
  {
    up: migration_20261006_190940_featured_items_source.up,
    down: migration_20261006_190940_featured_items_source.down,
    name: '20261006_190940_featured_items_source',
  },
  {
    up: migration_20261013_183731_page_sections_and_highlights.up,
    down: migration_20261013_183731_page_sections_and_highlights.down,
    name: '20261013_183731_page_sections_and_highlights',
  },
  {
    up: migration_20261014_113653_section_single_column.up,
    down: migration_20261014_113653_section_single_column.down,
    name: '20261014_113653_section_single_column',
  },
  {
    up: migration_20261014_124219_menu_groups_and_hero_banner.up,
    down: migration_20261014_124219_menu_groups_and_hero_banner.down,
    name: '20261014_124219_menu_groups_and_hero_banner',
  },
  {
    up: migration_20261016_220613_article_sections.up,
    down: migration_20261016_220613_article_sections.down,
    name: '20261016_220613_article_sections',
  },
  {
    up: migration_20261021_170000_donation_fund_general.up,
    down: migration_20261021_170000_donation_fund_general.down,
    name: '20261021_170000_donation_fund_general',
  },
];
