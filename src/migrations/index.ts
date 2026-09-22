import * as migration_20260912_134641_initial from './20260912_134641_initial';
import * as migration_20260922_212206_donations from './20260922_212206_donations';

export const migrations = [
  {
    up: migration_20260912_134641_initial.up,
    down: migration_20260912_134641_initial.down,
    name: '20260912_134641_initial',
  },
  {
    up: migration_20260922_212206_donations.up,
    down: migration_20260922_212206_donations.down,
    name: '20260922_212206_donations'
  },
];
