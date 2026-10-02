import { useCallback, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    FlatList,
    StyleSheet,
    Alert,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";

type Friend = {
    friend_id: string;
    username: string;
    points: number;
    level: number;
    active_quest_title: string | null;
};

type FriendRequest = {
    requester_id: string;
    username: string;
};

export default function Crew() {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [username, setUsername] = useState("");

    async function load() {
        const { data: crew, error: crewError } = await supabase.rpc("get_crew");
        if (crewError) console.log(crewError);
        else setFriends(crew ?? []);

        const { data: reqs, error: reqError } = await supabase.rpc("get_friend_requests");
        if (reqError) console.log(reqError);
        else setRequests(reqs ?? []);
    }

    useFocusEffect(
        useCallback(() => {
            load();
        }, [])
    );

    async function addFriend() {
        const name = username.trim();

        if (!name) {
            Alert.alert("Fehler", "Bitte einen Username eingeben");
            return;
        }

        const { data, error } = await supabase.rpc("send_friend_request", {
            friend_username: name,
        });

        if (error) {
            Alert.alert("Fehler", error.message);
            return;
        }

        const messages: Record<string, string> = {
            ok: "Anfrage gesendet!",
            not_found: "Diesen Username gibt es nicht.",
            self: "Das bist du selbst 😄",
            exists: "Ihr seid schon befreundet oder die Anfrage läuft schon.",
        };

        Alert.alert("Crew", messages[data] ?? "Unbekannte Antwort");

        if (data === "ok") setUsername("");
    }

    async function respond(requesterId: string, accept: boolean) {
        const { error } = await supabase.rpc("respond_friend_request", {
            requester: requesterId,
            accept,
        });

        if (error) {
            Alert.alert("Fehler", error.message);
            return;
        }

        load();
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={friends}
                keyExtractor={(item) => item.friend_id}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View>
                        <Text style={styles.heading}>Crew</Text>

                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Freund hinzufügen</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Username eingeben"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />

                            <Pressable style={styles.button} onPress={addFriend}>
                                <Text style={styles.buttonText}>Hinzufügen</Text>
                            </Pressable>
                        </View>

                        {requests.length > 0 && (
                            <View>
                                <Text style={styles.sectionTitle}>Anfragen</Text>

                                {requests.map((r) => (
                                    <View key={r.requester_id} style={styles.card}>
                                        <Text style={styles.name}>👤 {r.username}</Text>

                                        <View style={styles.row}>
                                            <Pressable
                                                style={[styles.button, styles.flex]}
                                                onPress={() => respond(r.requester_id, true)}
                                            >
                                                <Text style={styles.buttonText}>Annehmen</Text>
                                            </Pressable>

                                            <Pressable
                                                style={[styles.buttonOutline, styles.flex]}
                                                onPress={() => respond(r.requester_id, false)}
                                            >
                                                <Text style={styles.outlineText}>Ablehnen</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        <Text style={styles.sectionTitle}>Deine Freunde</Text>
                    </View>
                }
                ListEmptyComponent={
                    <Text style={styles.empty}>
                        Noch keine Freunde. Füge jemanden über den Username hinzu!
                    </Text>
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.name}>👤 {item.username}</Text>

                        <Text style={styles.text}>
                            Level {item.level} · {item.points} XP
                        </Text>

                        <Text style={styles.text}>
                            🎯 {item.active_quest_title ?? "Keine aktive Quest"}
                        </Text>
                    </View>
                )}
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
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15,
    },
    card: {
        padding: 20,
        borderRadius: 20,
        backgroundColor: "#f5f5f5",
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 4,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        backgroundColor: "#fff",
    },
    name: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 6,
    },
    text: {
        fontSize: 16,
        marginBottom: 4,
    },
    empty: {
        fontSize: 16,
        color: "#666",
    },
    row: {
        flexDirection: "row",
        gap: 10,
        marginTop: 10,
    },
    flex: {
        flex: 1,
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
    buttonOutline: {
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: "center",
        backgroundColor: "#fff",
    },
    outlineText: {
        fontWeight: "bold",
    },
});