import { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import {
    ACHIEVEMENTS,
    TIER_ICON,
    loadAchievementStats,
    Stats,
} from "@/lib/achievements";

export default function Achievements() {
    const [stats, setStats] = useState<Stats | null>(null);

    useFocusEffect(
        useCallback(() => {
            loadAchievementStats().then(setStats);
        }, [])
    );

    if (!stats) {
        return (
            <View style={styles.container}>
                <Text>Achievements werden geladen...</Text>
            </View>
        );
    }

    const unlockedCount = ACHIEVEMENTS.filter((a) => a.check(stats)).length;

    return (
        <View style={styles.container}>
            <FlatList
                data={ACHIEVEMENTS}
                keyExtractor={(a) => a.id}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <Text style={styles.heading}>
                        🏆 {unlockedCount} / {ACHIEVEMENTS.length}
                    </Text>
                }
                renderItem={({ item }) => {
                    const unlocked = item.check(stats);

                    return (
                        <View style={[styles.card, !unlocked && styles.locked]}>
                            <Text style={styles.name}>
                                {unlocked ? `${TIER_ICON[item.tier]} ${item.name}` : "❓ ?"}
                            </Text>
                            <Text style={styles.description}>
                                {unlocked ? item.description : "?"}
                            </Text>
                        </View>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
    heading: { fontSize: 30, fontWeight: "bold", marginBottom: 20 },
    card: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: "#f5f5f5",
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 4,
    },
    locked: { opacity: 0.5 },
    name: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
    description: { fontSize: 15, color: "#444" },
});