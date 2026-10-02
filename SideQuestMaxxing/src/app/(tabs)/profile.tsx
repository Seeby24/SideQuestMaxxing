import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

export default function Profile() {
    const [userInfo, setUserInfo] = useState<any>(null);
    const [credentials, setCredentials] = useState<any>(null);

    useEffect(() => {
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
        }

        getProfile();
    }, []);

    if (!userInfo || !credentials) {
        return (
            <View style={styles.container}>
                <Text>User wird geladen...</Text>
            </View>
        );
    }

    const xpForNextLevel = 500;
    const currentLevelXp = userInfo.points % xpForNextLevel;
    const progress = (currentLevelXp / xpForNextLevel) * 100;
    const xpUntilNextLevel = xpForNextLevel - currentLevelXp;

    return (
        <View style={styles.container}>

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

                <View style={styles.levelHeader}>
                    <Text style={styles.heading}>
                        Dein Fortschritt
                    </Text>

                    <Text style={styles.levelBadge}>
                        Level {userInfo.level}
                    </Text>
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
                    {xpUntilNextLevel} XP bis Level {userInfo.level + 1}
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.heading}>
                    🏆 Achievements
                </Text>

                <Text style={styles.achievementCount}>
                    0 / 35
                </Text>

                <Text style={styles.text}>
                    Schliesse Quests ab, um neue Achievements freizuschalten!
                </Text>
            </View>
            <Pressable style={styles.button}onPress={() => supabase.auth.signOut()}>
                <Text style={styles.buttonText}>Abmelden</Text>
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

    welcome: {
        marginBottom: 20,
    },

    welcomeTitle: {
        fontSize: 28,
        fontWeight: "bold",
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

    levelBadge: {
        backgroundColor: "#000",
        color: "#fff",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        fontWeight: "bold",
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
});
