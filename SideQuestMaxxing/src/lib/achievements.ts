import { supabase } from "@/lib/supabase";
import { getLevelInfo } from "@/lib/level";

// Wie heisst "schwer" in quests.difficulty? Hier anpassen:
const HARD_DIFFICULTY = "schwer";

export type Stats = {
    completed: number;
    categories: number;
    totalCategories: number;
    totalQuests: number;
    hard: number;
    friends: number;
    points: number;
    level: number;
    bestStreak: number;
    bestDay: number;
    night: number;      // 00:00–04:59
    morning: number;    // 05:00–06:59
    hasThreeAm: boolean;
};

export type Tier = "easy" | "mid" | "hard" | "rare" | "secret";

export type Achievement = {
    id: string;
    name: string;
    description: string;
    tier: Tier;
    check: (s: Stats) => boolean;
};

export const TIER_ICON: Record<Tier, string> = {
    easy: "🟢",
    mid: "🟡",
    hard: "🔴",
    rare: "🟣",
    secret: "🕵️",
};

const quests = (n: number) => (s: Stats) => s.completed >= n;
const friends = (n: number) => (s: Stats) => s.friends >= n;

export const ACHIEVEMENTS: Achievement[] = [
    // 🟢 einfach
    { id: "first_step", tier: "easy", name: "Erster Schritt", description: "Schliesse 1 Quest ab", check: quests(1) },
    { id: "lets_go", tier: "easy", name: "Los geht's!", description: "Schliesse 3 Quests ab", check: quests(3) },
    { id: "questling", tier: "easy", name: "Questling", description: "Schliesse 5 Quests ab", check: quests(5) },
    { id: "done", tier: "easy", name: "Auftrag erledigt", description: "Schliesse 10 Quests ab", check: quests(10) },
    { id: "sidequester", tier: "easy", name: "Sidequester", description: "Schliesse 25 Quests ab", check: quests(25) },
    { id: "small_trip", tier: "easy", name: "Kleine Reise", description: "Schliesse Quests aus 3 verschiedenen Kategorien ab", check: (s) => s.categories >= 3 },
    { id: "teamplayer", tier: "easy", name: "Teamplayer", description: "Füge 1 Freund hinzu", check: friends(1) },
    { id: "not_alone", tier: "easy", name: "Nicht allein", description: "Füge 3 Freunde hinzu", check: friends(3) },
    { id: "new_acquaint", tier: "easy", name: "Neue Bekanntschaften", description: "Füge 5 Freunde hinzu", check: friends(5) },

    // 🟡 mittel
    { id: "quest_machine", tier: "mid", name: "Quest Machine", description: "Schliesse 50 Quests ab", check: quests(50) },
    { id: "keep_going", tier: "mid", name: "Immer weiter", description: "Schliesse 7 Tage hintereinander eine Quest ab", check: (s) => s.bestStreak >= 7 },
    { id: "allrounder", tier: "mid", name: "Allrounder", description: "Schliesse in jeder Kategorie mindestens 1 Quest ab", check: (s) => s.totalCategories > 0 && s.categories >= s.totalCategories },
    { id: "full_send", tier: "mid", name: "Full Send", description: "Schliesse 10 schwere Quests ab", check: (s) => s.hard >= 10 },
    { id: "social_butterfly", tier: "mid", name: "Social Butterfly", description: "Füge 10 Freunde hinzu", check: friends(10) },
    { id: "xp_hunter", tier: "mid", name: "XP Hunter", description: "Sammle 500 XP", check: (s) => s.points >= 500 },
    { id: "level_up", tier: "mid", name: "Level Up!", description: "Erreiche Level 10", check: (s) => s.level >= 10 },
    { id: "halfway", tier: "mid", name: "Halbzeit", description: "Schliesse die Hälfte aller Quests ab", check: (s) => s.totalQuests > 0 && s.completed * 2 >= s.totalQuests },

    // 🔴 schwer
    { id: "unstoppable", tier: "hard", name: "Unstoppable", description: "Schliesse 100 Quests ab", check: quests(100) },
    { id: "grinder", tier: "hard", name: "The Grinder", description: "Schliesse 30 Tage hintereinander eine Quest ab", check: (s) => s.bestStreak >= 30 },
    { id: "overkill", tier: "hard", name: "Overkill", description: "Schliesse 5 Quests an einem Tag ab", check: (s) => s.bestDay >= 5 },
    { id: "unbreakable", tier: "hard", name: "Unbreakable", description: "Schliesse 25 schwere Quests ab", check: (s) => s.hard >= 25 },
    { id: "squad_leader", tier: "hard", name: "Squad Leader", description: "Füge 20 Freunde hinzu", check: friends(20) },
    { id: "quest_god", tier: "hard", name: "Quest God", description: "Erreiche Level 25", check: (s) => s.level >= 25 },
    { id: "maxxing", tier: "hard", name: "Maxxing", description: "Sammle 2'500 XP", check: (s) => s.points >= 2500 },

    // 🟣 sehr selten
    { id: "legend", tier: "rare", name: "The Legend", description: "Erreiche Level 35", check: (s) => s.level >= 35 },
    { id: "maxxed", tier: "rare", name: "MAXXED", description: "Erreiche Level 50", check: (s) => s.level >= 50 },
    { id: "completionist", tier: "rare", name: "Completionist", description: "Schliesse alle Quests ab", check: (s) => s.totalQuests > 0 && s.completed >= s.totalQuests },

    // 🕵️ geheim
    { id: "three_am", tier: "secret", name: "Geisterstunde", description: "Schliesse eine Quest um 03:00 Uhr ab", check: (s) => s.hasThreeAm },
    { id: "night_owl", tier: "secret", name: "Night Owl", description: "Schliesse 5 Quests zwischen 00:00 und 05:00 ab", check: (s) => s.night >= 5 },
    { id: "early_bird", tier: "secret", name: "Early Bird", description: "Schliesse 5 Quests zwischen 05:00 und 07:00 ab", check: (s) => s.morning >= 5 },
];

export async function loadAchievementStats(): Promise<Stats | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const uid = userData.user.id;

    const [profileRes, questsRes, completedRes, crewRes] = await Promise.all([
        supabase.from("profiles").select("points").eq("id", uid).single(),
        supabase.from("quests").select("id, category, difficulty"),
        supabase.from("completed_quests").select("quest_id, completed_at").eq("user_id", uid),
        supabase.rpc("get_crew"),
    ]);

    const allQuests = questsRes.data ?? [];
    const completed = completedRes.data ?? [];
    const points = profileRes.data?.points ?? 0;

    const questById = new Map(allQuests.map((q) => [String(q.id), q]));

    const categories = new Set<string>();
    let hard = 0;
    let night = 0;
    let morning = 0;
    let hasThreeAm = false;
    const perDay = new Map<number, number>();

    for (const c of completed) {
        const q = questById.get(String(c.quest_id));
        if (q) {
            categories.add(q.category);
            if (q.difficulty === HARD_DIFFICULTY) hard++;
        }

        if (!c.completed_at) continue;
        const d = new Date(c.completed_at);
        const hour = d.getHours();

        if (hour < 5) night++;
        if (hour >= 5 && hour < 7) morning++;
        if (hour === 3) hasThreeAm = true;

        const day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
        perDay.set(day, (perDay.get(day) ?? 0) + 1);
    }

    // längste Serie aufeinanderfolgender Tage
    const days = [...perDay.keys()].sort((a, b) => a - b);
    let bestStreak = 0;
    let run = 0;
    days.forEach((day, i) => {
        run = i > 0 && day === days[i - 1] + 1 ? run + 1 : 1;
        bestStreak = Math.max(bestStreak, run);
    });

    return {
        completed: completed.length,
        categories: categories.size,
        totalCategories: new Set(allQuests.map((q) => q.category)).size,
        totalQuests: allQuests.length,
        hard,
        friends: (crewRes.data ?? []).length,
        points,
        level: getLevelInfo(points).level,
        bestStreak,
        bestDay: Math.max(0, ...perDay.values()),
        night,
        morning,
        hasThreeAm,
    };
}