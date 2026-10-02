import { useCallback, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import { getLevelInfo } from "@/lib/level";
import LevelName from "@/components/levelName";
import { ACHIEVEMENTS, loadAchievementStats } from "@/lib/achievements";

export default function Profile() {
    const [userInfo, setUserInfo] = useState<any>(null);
    const [credentials, setCredentials] = useState<any>(null);
    const [unlocked, setUnlocked] = useState(0);

    useFocusEffect(
        useCallback(() => {
            async function getProfile() {
                const { data: userData, error: userError } =
                    await supabase.auth.getUser();

                if (userError || !userData.user) {
                    console.log(userError);
                    return;
                }

                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", userData.user.id)
                    .single();

                if (error) {
                    console.log(error);
                    return;
                }

                setUserInfo(data);
                setCredentials(userData.user);

                const stats = await loadAchievementStats();
                if (stats) {
                    setUnlocked(ACHIEVEMENTS.filter((a) => a.check(stats)).length);
                }
            }

            getProfile();
        }, [])
    );

    if (!userInfo || !credentials) {
        return (
            <View style={styles.loading}>
                <Text>User wird geladen...</Text>
            </View>
        );
    }

    const { level, xpInLevel, xpForNext, isMax } = getLevelInfo(userInfo.points);
    const progress = isMax ? 100 : (xpInLevel / xpForNext) * 100;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >

            <View style={styles.card}>
                <Text style={styles.heading}>
                    Deine Daten
                </Text>

                <Text style={styles.text}>
                    👤 Name: {userInfo.username}
                </Text>

                <Text style={styles.text}>
                    📧 Email: {credentials.email}
                </Text>

                <Text style={styles.text}>
                    📅 Mitglied seit:{" "}
                    {new Date(userInfo.created_at).toLocaleDateString("de-CH")}
                </Text>
            </View>

            <View style={styles.card}>

                <Text style={styles.heading}>
                    Dein Fortschritt
                </Text>

                <View style={styles.levelRow}>
                    <LevelName level={level} />
                </View>

                <Text style={styles.points}>
                    ⭐ {userInfo.points} XP
                </Text>

                <View style={styles.progressBackground}>
                    <View
                        style={[
                            styles.progress,
                            {
                                width: `${progress}%`,
                            },
                        ]}
                    />
                </View>

                <Text style={styles.progressText}>
                    {isMax
                        ? "Max-Level erreicht 👑"
                        : `${xpForNext - xpInLevel} XP bis Level ${level + 1}`}
                </Text>
            </View>

            <Pressable
                style={styles.card}
                onPress={() => router.push("/achievements")}
            >
                <Text style={styles.heading}>
                    🏆 Achievements
                </Text>

                <Text style={styles.achievementCount}>
                    {unlocked} / {ACHIEVEMENTS.length}
                </Text>

                <Text style={styles.text}>
                    Tippe, um deine Achievements zu sehen →
                </Text>
            </Pressable>

            {userInfo.is_admin && (
                <Pressable
                    style={[styles.button, { marginBottom: 10 }]}
                    onPress={() => router.push("/admin")}
                >
                    <Text style={styles.buttonText}>🛠 Fotos prüfen</Text>
                </Pressable>
            )}

            <Pressable
                style={styles.button}
                onPress={() => supabase.auth.signOut()}
            >
                <Text style={styles.buttonText}>Abmelden</Text>
            </Pressable>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    content: {
        padding: 20,
        paddingTop: 70,
        paddingBottom: 40,
    },

    loading: {
        flex: 1,
        padding: 20,
        paddingTop: 70,
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

    heading: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 15,
    },

    text: {
        fontSize: 16,
        marginBottom: 8,
    },

    levelHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    points: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 15,
    },

    progressBackground: {
        height: 12,
        backgroundColor: "#ddd",
        borderRadius: 10,
        overflow: "hidden",
    },

    progress: {
        height: "100%",
        backgroundColor: "#000",
        borderRadius: 10,
    },

    progressText: {
        marginTop: 8,
        fontSize: 14,
        color: "#666",
    },

    achievementCount: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 10,
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
    levelRow: {
    alignSelf: "flex-start",
    marginBottom: 15,
},
});