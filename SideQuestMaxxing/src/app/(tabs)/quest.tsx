import QuestCard from "@/components/questCard";
import { supabase } from "@/lib/supabase";
import { getQuestStatus } from "@/lib/questStatus";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

export default function Quest() {
    const [activeQuest, setActiveQuest] = useState<any>(null);
    const [quest, setQuest] = useState<any>(null);
    const [completedIds, setCompletedIds] = useState<string[]>([]);

    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            async function load() {
                const status = await getQuestStatus();
                if (!status) return;

                const { data: questsData, error } = await supabase
                    .from("quests")
                    .select("*");

                if (error || !questsData) {
                    console.log(error);
                    return;
                }

                setQuest(questsData);
                setCompletedIds(status.completedIds);
                setActiveQuest(
                    status.activeQuestId
                        ? questsData.find(
                              (q) => String(q.id) === status.activeQuestId
                          ) ?? null
                        : null
                );
            }

            load();
        }, [])
    );

    if (!quest) {
        return (
            <View style={styles.container}>
                <Text>Quest wird geladen...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>

            <Text style={styles.heading}>
                Deine Quests
            </Text>

            <Text style={styles.subtitle}>
                Wähle eine Quest aus und leg los!
            </Text>

            {/* Aktuelle Quest */}
            {activeQuest && (
                <View>
                    <Text style={styles.sectionTitle}>
                        Aktuelle Quest
                    </Text>

                    <QuestCard
                        quest={activeQuest}
                        showButton={true}
                        finishedQuest={false}
                        buttonLabel="Zur aktiven Quest"
                        onPress={() =>
                            router.push(`/activeQuest?id=${activeQuest.id}`)
                        }
                    />
                </View>
            )}

            {/* Alle Quests */}
            <Text style={styles.sectionTitle}>
                Alle Quests
            </Text>

            <FlatList
                data={quest}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => {
                    const isCompleted = completedIds.includes(String(item.id));
                    const isActive =
                        activeQuest && String(activeQuest.id) === String(item.id);
                    const blockedByOther = activeQuest && !isActive;

                    let label = "Quest starten";
                    if (isCompleted) label = "Bereits abgeschlossen";
                    else if (isActive) label = "Zur aktiven Quest";
                    else if (blockedByOther) label = "Andere Quest aktiv";

                    return (
                        <QuestCard
                            quest={item}
                            showButton={true}
                            finishedQuest={false}
                            buttonLabel={label}
                            disabled={isCompleted || !!blockedByOther}
                            onPress={() =>
                                router.push(
                                    isActive
                                        ? `/activeQuest?id=${item.id}`
                                        : `/questDetail?id=${item.id}`
                                )
                            }
                        />
                    );
                }}
                showsVerticalScrollIndicator={false}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
    },

    heading: {
        fontSize: 30,
        fontWeight: "bold",
    },

    subtitle: {
        fontSize: 16,
        color: "#666",
        marginTop: 5,
        marginBottom: 25,
    },

    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15,
    },
});