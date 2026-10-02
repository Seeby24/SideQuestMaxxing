import { router, useLocalSearchParams } from "expo-router";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import QuestCard from "@/components/questCard";

export default function ActiveQuest() {
  const { id } = useLocalSearchParams();
  const [quest, setQuest] = useState<any>(null);



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

  async function finishQuest() {
            const { data: userData, error: userError } =
                await supabase.auth.getUser();

            if (userError || !userData.user) {
                console.log("Nicht eingeloggt");
                router.replace("/login");
                return;
            }

            const userId = userData.user.id;


            const { error: completedError } = await supabase
                .from("completed_quests")
                .insert({
                    user_id: userId,
                    quest_id: id,
                });

            if (completedError) {
                console.log(completedError);
                return;
            }

            const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("points")
                    .eq("id", userId)
                    .single();

            if (profileError) {
                console.log(profileError);
                return;
            }

            const { error: updateError } =
                await supabase
                    .from("profiles")
                    .update({
                        points: profile.points + quest.points,
                        active_quest_id: null,
                    })
                    .eq("id", userId);

            if (updateError) {
                console.log(updateError);
                return;
            }

            router.replace(`/finishedQuest?id=${id}`);
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
        Deine aktive Quest
      </Text>

      <QuestCard quest={quest}/>
      <Pressable
        style={styles.refresh}
        onPress={finishQuest}
      >
        <Text style={styles.buttonText}>
          Quest beenden
        </Text>
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
        backgroundColor: "#f5f5f5",
        marginBottom: 15,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 5,

        elevation: 4,
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