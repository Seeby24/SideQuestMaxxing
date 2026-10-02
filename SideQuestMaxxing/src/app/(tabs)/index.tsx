import { useCallback, useState } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { supabase } from "@/lib/supabase";
import { getQuestStatus } from "@/lib/questStatus";
import { router, useFocusEffect } from "expo-router";
import QuestCard from "@/components/questCard";

export default function Home() {
  const [quests, setQuests] = useState<any[]>([]);
  const [quest, setQuest] = useState<any>(null);
  const [activeQuest, setActiveQuest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const status = await getQuestStatus();
        if (!status) return;

        const { data, error } = await supabase.from("quests").select("*");

        if (error || !data) {
          console.log(error);
          return;
        }

        setActiveQuest(
          status.activeQuestId
            ? data.find((q) => String(q.id) === status.activeQuestId) ?? null
            : null
        );

        const available = data.filter(
          (q) => !status.completedIds.includes(String(q.id))
        );
        setQuests(available);

        //  Zufall Quest behalten wenn verfügbar
        setQuest((prev: any) =>
          prev && available.some((q) => q.id === prev.id)
            ? prev
            : available.length > 0
            ? available[Math.floor(Math.random() * available.length)]
            : null
        );

        setLoading(false);
      }

      load();
    }, [])
  );

  function getNewQuest() {
    if (!quests || quests.length <= 1) return;

    let newQuest;

    do {
      const randomIndex = Math.floor(Math.random() * quests.length);
      newQuest = quests[randomIndex];
    } while (newQuest.id === quest.id);

    setQuest(newQuest);
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Quest wird geladen...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <View style={styles.welcome}>
        <Text style={styles.welcomeTitle}>
          Willkommen bei SideQuestMaxxing 👋
        </Text>

        <Text style={styles.welcomeText}>
          Bereit für deine nächste Side Quest?
        </Text>
      </View>

      {activeQuest ? (
        <>
          <Text style={styles.heading}>Deine aktive Quest</Text>

          <QuestCard
            quest={activeQuest}
            showButton={true}
            finishedQuest={false}
            buttonLabel="Zur aktiven Quest"
            onPress={() => router.push(`/activeQuest?id=${activeQuest.id}`)}
          />
        </>
      ) : quest ? (
        <>
          <Text style={styles.heading}>Deine Side Quest</Text>

          <QuestCard
            quest={quest}
            showButton={true}
            finishedQuest={false}
            onPress={() => router.push(`/questDetail?id=${quest.id}`)}
          />

          <Pressable style={styles.refresh} onPress={getNewQuest}>
            <Text style={styles.buttonText}>↻ Neue Quest</Text>
          </Pressable>
        </>
      ) : (
        <Text style={styles.heading}>
          🎉 Du hast alle Quests abgeschlossen!
        </Text>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 70,
    justifyContent: "center",
  },

  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  refresh: {
    marginTop: "auto",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    backgroundColor: "#000",
  },
  welcome: {
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  welcomeText: {
    fontSize: 16,
    marginTop: 5,
  },
});