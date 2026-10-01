import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cbalhcbegxfbpvsegnqf.supabase.co";
const supabaseKey = "sb_publishable_0ZUGN99fMZJGJx4FvMBrXw_a4QnncfN";

export const supabase = createClient(
    supabaseUrl,
    supabaseKey
);