import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Pressable, } from "react-native";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [quests, setQuests] = useState<any[]>([]);
  const [quest, setQuest] = useState<any>(null);

  useEffect(() => {
    async function getQuests() {
      const { data, error } = await supabase
        .from("quests")
        .select("*");

      if (error) {
        console.log(error);
        return;
      }

      if (data && data.length > 0) {
        setQuests(data);

        const randomIndex = Math.floor(Math.random() * data.length);
        setQuest(data[randomIndex]);
      }
    }

    getQuests();
  }, []);

  if (!quest) {
    return (
      <View style={styles.container}>
        <Text>Quest wird geladen...</Text>
      </View>
    );
  }


  function getNewQuest() {
    if (!quests || quests.length <= 1) return;

    let newQuest;

    do {
      const randomIndex = Math.floor(Math.random() * quests.length);
      newQuest = quests[randomIndex];
    } while (newQuest.id === quest.id);

    setQuest(newQuest);
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

      <Text style={styles.heading}>Deine Side Quest</Text>

      <View style={styles.card}>
        <Text style={styles.category}>{quest.category}</Text>

        <Text style={styles.title}>
          {quest.title}
        </Text>

        <Text style={styles.description}>
          {quest.description}
        </Text>

        <View style={styles.info}>
          <Text>{quest.difficulty}</Text>
          <Text>+{quest.points} Punkte</Text>
        </View>

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Quest starten</Text>
        </Pressable>
      </View>
      <Pressable style={styles.refresh} onPress={getNewQuest}>
        <Text style={styles.buttonText}>↻ Neue Quest</Text>
      </Pressable>
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

  card: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#eeeeee",
  },

  category: {
    fontSize: 14,
    marginBottom: 10,
    textTransform: "uppercase",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },

  description: {
    fontSize: 16,
    marginBottom: 20,
  },

  info: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  button: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#000",
    alignItems: "center",
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