import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { supabase } from "@/lib/supabase";
import QuestCard from "@/components/questCard";


export default function FinishedQuest() {

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
                🎉 Quest geschafft!
            </Text>

            <QuestCard quest={quest} showButton={false} finishedQuest={true}/>


            <Pressable
                style={styles.refresh}
                onPress={() => router.replace("/")}
            >
                <Text style={styles.buttonText}>
                    Home
                </Text>
            </Pressable>

        </View>
    )
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
    
});