import 'server-only';

import { usingSupabase } from '../config';
import { demoStore } from './demo';
import { supabaseStore } from './supabase';
import type { Store } from './types';

/** El único punto donde se decide contra qué se está hablando. */
export const store: Store = usingSupabase ? supabaseStore : demoStore;

export type { Store } from './types';
