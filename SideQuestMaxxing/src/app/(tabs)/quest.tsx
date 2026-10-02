import QuestCard from "@/components/questCard";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react"
import { View, Text , Pressable, StyleSheet} from "react-native"
export default function Quest() {
    const [quest, setQuest] = useState<any>(null);

    useEffect(() => {
        async function getQuest() {

            const { data, error } = await supabase
                .from("profile")
                .select("active_quest_id")
                .single();

            if (error) {
                console.log(error);
                return;
            }

            setQuest(data);
        }

        getQuest();
    }, [])

    if (!quest) {
        return (
            <View style={styles.container}>
                <Text>Quest wird geladen...</Text>
            </View>
        )
    }

        return (
            <View style={styles.container}>

                <Text style={styles.heading}>
                    Quest Details
                </Text>

                <View style={styles.card}>

                    <Text style={styles.category}>
                        {quest.category}
                    </Text>

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

                    <Pressable
                        style={styles.button}
           
                    >
                        <Text style={styles.buttonText}>
                            Quest starten
                        </Text>
                    </Pressable>

                </View>

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
            lineHeight: 24,
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
    })
