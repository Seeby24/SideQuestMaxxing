import { useState } from "react";
import { router } from "expo-router";
import { Text, TextInput, View, StyleSheet, Pressable, } from "react-native";
import { supabase } from "@/lib/supabase";
import { Alert } from "react-native";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function register() {
        if (!username || !email || !password) {
            Alert.alert("Fehler", "Bitte alle Felder ausfüllen");
            console.log("Bitte alle Felder ausfüllen");
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username,
                },
            },
        });

        if (error) {
            Alert.alert("Fehler", error.message);
            console.log(error);
            return;
        }

        console.log("Registrierung erfolgreich");

        router.replace("/");
    }

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Registrieren</Text>

            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />

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

            <Pressable style={styles.button} onPress={register}>
                <Text style={styles.buttonText}>
                    Registrieren
                </Text>
            </Pressable>

            <Pressable onPress={() => router.push("/login")}>
                <Text style={styles.link}>
                    Ich habe bereits ein Konto
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