import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = "https://cbalhcbegxfbpvsegnqf.supabase.co";
const supabaseKey = "sb_publishable_0ZUGN99fMZJGJx4FvMBrXw_a4QnncfN";

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});