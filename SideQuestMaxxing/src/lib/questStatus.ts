import { supabase } from "@/lib/supabase";

export async function getQuestStatus() {
    const { data: userData, error } = await supabase.auth.getUser();

    if (error || !userData.user) return null;

    const userId = userData.user.id;

    const { data: profile } = await supabase
        .from("profiles")
        .select("active_quest_id")
        .eq("id", userId)
        .single();

    const { data: completed } = await supabase
        .from("completed_quests")
        .select("quest_id")
        .eq("user_id", userId);

    return {
        userId,
        activeQuestId:
            profile?.active_quest_id != null
                ? String(profile.active_quest_id)
                : null,
        completedIds: (completed ?? []).map((c) => String(c.quest_id)),
    };
}