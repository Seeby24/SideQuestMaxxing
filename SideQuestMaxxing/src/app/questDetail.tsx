import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { supabase } from "@/lib/supabase";
import { Alert } from "react-native";
import { getQuestStatus } from "@/lib/questStatus";
import QuestCard from "@/components/questCard";

export default function QuestDetail() {

    const { id } = useLocalSearchParams();
    const [quest, setQuest] = useState<any>(null);
    const [blockedReason, setBlockedReason] = useState<string | null>(null);

    useEffect(() => {
        async function getQuest() {
            const { data, error } = await supabase
                .from("quests")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                console.log(error);
                return;
            }

            setQuest(data);
        }

        getQuest();
    }, [id]);

    useEffect(() => {
        async function checkStatus() {
            const status = await getQuestStatus();
            if (!status) return;

            const questId = String(id);

            if (status.completedIds.includes(questId)) {
                setBlockedReason("Bereits abgeschlossen");
            } else if (status.activeQuestId && status.activeQuestId !== questId) {
                setBlockedReason("Andere Quest aktiv");
            }
        }

        checkStatus();
    }, [id]);

    async function startQuest() {
        const status = await getQuestStatus();

        if (!status) {
            router.replace("/login");
            return;
        }

        const questId = String(id);

        if (status.completedIds.includes(questId)) {
            Alert.alert("Nicht möglich", "Diese Quest hast du schon abgeschlossen.");
            return;
        }

        if (status.activeQuestId && status.activeQuestId !== questId) {
            Alert.alert(
                "Nicht möglich",
                "Du hast bereits eine aktive Quest. Beende sie oder gib sie auf."
            );
            return;
        }

        const { error } = await supabase
            .from("profiles")
            .update({ active_quest_id: id })
            .eq("id", status.userId);

        if (error) {
            console.log(error);
            return;
        }

        router.push(`/activeQuest?id=${id}`);
    }

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
                Quest Details
            </Text>

            <QuestCard
                quest={quest}
                onPress={startQuest}
                showButton={true}
                disabled={!!blockedReason}
                buttonLabel={blockedReason ?? "Quest starten"}
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
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 20,
    },

});