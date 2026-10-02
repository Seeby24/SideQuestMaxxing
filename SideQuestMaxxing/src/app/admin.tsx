import { useCallback, useState } from "react";
import { View, Text, FlatList, Image, Pressable, StyleSheet, Alert } from "react-native";
import { useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";

type Submission = {
    id: string;
    username: string;
    quest_title: string;
    quest_description: string;
    image_path: string;
    created_at: string;
    url?: string;
};

export default function Admin() {
    const [items, setItems] = useState<Submission[]>([]);

    const load = useCallback(async () => {
        const { data, error } = await supabase.rpc("get_pending_submissions");

        if (error) {
            Alert.alert("Fehler", error.message);
            return;
        }

        const rows: Submission[] = data ?? [];

        if (rows.length > 0) {
            const { data: signed } = await supabase.storage
                .from("proofs")
                .createSignedUrls(rows.map((r) => r.image_path), 3600);

            rows.forEach((r) => {
                r.url = signed?.find((s) => s.path === r.image_path)?.signedUrl ?? undefined;
            });
        }

        setItems(rows);
    }, []);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load])
    );

    async function review(id: string, approve: boolean) {
        const { error } = await supabase.rpc("review_submission", {
            sub_id: id,
            approve,
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
                data={items}
                keyExtractor={(item) => item.id}
                refreshing={false}
                onRefresh={load}
                ListHeaderComponent={
                    <Text style={styles.heading}>Offene Prüfungen ({items.length})</Text>
                }
                ListEmptyComponent={<Text>Keine offenen Einreichungen 🎉</Text>}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.name}>👤 {item.username}</Text>
                        <Text style={styles.title}>{item.quest_title}</Text>
                        <Text style={styles.description}>{item.quest_description}</Text>

                        {item.url && (
                            <Image
                                source={{ uri: item.url }}
                                style={styles.image}
                                resizeMode="contain"
                            />
                        )}

                        <View style={styles.row}>
                            <Pressable
                                style={[styles.button, styles.flex]}
                                onPress={() => review(item.id, true)}
                            >
                                <Text style={styles.buttonText}>✅ Erledigt</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.buttonOutline, styles.flex]}
                                onPress={() => review(item.id, false)}
                            >
                                <Text style={styles.outlineText}>❌ Nicht erledigt</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
    heading: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
    card: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: "#f5f5f5",
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 4,
    },
    name: { fontSize: 14, color: "#666", marginBottom: 4 },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
    description: { fontSize: 15, marginBottom: 12 },
    image: { width: "100%", height: 280, borderRadius: 12, marginBottom: 12, backgroundColor: "#ddd" },
    row: { flexDirection: "row", gap: 10 },
    flex: { flex: 1 },
    button: { padding: 14, borderRadius: 12, backgroundColor: "#000", alignItems: "center" },
    buttonText: { color: "#fff", fontWeight: "bold" },
    buttonOutline: { padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "center", backgroundColor: "#fff" },
    outlineText: { fontWeight: "bold" },
});