import * as migration_20260906_125020_initial from './20260906_125020_initial';
import * as migration_20260906_131633_add_featured_and_agenda_blocks from './20260906_131633_add_featured_and_agenda_blocks';

export const migrations = [
  {
    up: migration_20260906_125020_initial.up,
    down: migration_20260906_125020_initial.down,
    name: '20260906_125020_initial',
  },
  {
    up: migration_20260906_131633_add_featured_and_agenda_blocks.up,
    down: migration_20260906_131633_add_featured_and_agenda_blocks.down,
    name: '20260906_131633_add_featured_and_agenda_blocks'
  },
];
