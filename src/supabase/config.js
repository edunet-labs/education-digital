
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://oyuuoggizhycteybakeh.supabase.co';
const supabaseKey = 'sb_publishable_9evs6gjZXb0MKLNiY4m9WQ_whyH9_Vy';

export const supabase = createClient(supabaseUrl, supabaseKey);
