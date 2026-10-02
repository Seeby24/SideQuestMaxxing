import { useState } from "react";
import { router } from "expo-router";
import { Text, TextInput, View, StyleSheet, Pressable, } from "react-native";
import { supabase } from "@/lib/supabase";
import { Alert } from "react-native";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function login() {
        if (!email || !password) {
            Alert.alert("Bitte alle Felder ausfüllen")
            console.log("Bitte alle Felder ausfüllen");
            return;
        }

        const { data, error } =
            await supabase.auth.signInWithPassword({
                email,
                password,
            });

        if (error) {
            Alert.alert("Fehler", error.message);
            return;
        }

        console.log("Login erfolgreich");

        router.replace("/");
    }

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Login</Text>

            <TextInput
                style={styles.input}
                placeholder="E-Mail"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Passwort"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <Pressable style={styles.button} onPress={login}>
                <Text style={styles.buttonText}>
                    Einloggen
                </Text>
            </Pressable>

            <Pressable onPress={() => router.push("/register")}>
                <Text style={styles.link}>
                    Noch kein Konto? Registrieren
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
    },
    heading: {
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 30,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
    },
    button: {
        padding: 15,
        borderRadius: 12,
        backgroundColor: "#000",
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    link: {
        textAlign: "center",
        marginTop: 20,
    },
});