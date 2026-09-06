import * as migration_20260906_125020_initial from './20260906_125020_initial';

export const migrations = [
  {
    up: migration_20260906_125020_initial.up,
    down: migration_20260906_125020_initial.down,
    name: '20260906_125020_initial'
  },
];
