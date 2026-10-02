import { Tabs } from "expo-router";
import { Ionicons } from '@react-native-vector-icons/ionicons';

export default function TabsLayout() {
    return (
        <Tabs  screenOptions={{ headerShown: false }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="quest"
                options={{
                    title: "Quests",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="compass" size={size} color={color} />
                    )
                }}
            />

            <Tabs.Screen
                name="crew"
                options={{
                    title: "Crew",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profil",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />

            

        </Tabs>
    );
}