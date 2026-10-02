import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export default function RootLayout() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setLoading(false);
        });

        const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
            setSession(s);
        });

        return () => sub.subscription.unsubscribe();
    }, []);

    if (loading) return null;

    return (
        <Stack
            screenOptions={{
                headerRight: () => (
                    <Pressable onPress={() => router.replace("/")} style={{ marginRight: 15 }}>
                        <Ionicons name="home-outline" size={24} color="black" />
                    </Pressable>
                ),
            }}
        >
            <Stack.Protected guard={!!session}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="achievements" options={{ title: "Achievements" }} />
                <Stack.Screen name="admin" options={{ title: "Admin" }} />
                <Stack.Screen name="questDetail" />
                <Stack.Screen name="activeQuest" />
                <Stack.Screen name="finishedQuest" />
            </Stack.Protected>

            <Stack.Protected guard={!session}>
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="register" options={{ headerShown: false }} />
            </Stack.Protected>
        </Stack>
    );
}