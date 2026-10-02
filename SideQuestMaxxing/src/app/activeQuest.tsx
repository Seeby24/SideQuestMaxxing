import { router, useLocalSearchParams } from "expo-router";
import { Text, View, StyleSheet, Pressable, Alert, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";
import QuestCard from "@/components/questCard";

type Status = "none" | "pending" | "rejected" | "approved";

export default function ActiveQuest() {
  const { id } = useLocalSearchParams();
  const [quest, setQuest] = useState<any>(null);
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [status, setStatus] = useState<Status>("none");
  const [uploading, setUploading] = useState(false);

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

  const loadStatus = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data } = await supabase
      .from("submissions")
      .select("status")
      .eq("user_id", userData.user.id)
      .eq("quest_id", id)
      .order("created_at", { ascending: false })
      .limit(1);

    const latest = (data?.[0]?.status ?? "none") as Status;
    setStatus(latest);

    if (latest === "approved") {
      router.replace(`/finishedQuest?id=${id}`);
    }
  }, [id]);

  useEffect(() => {
    loadStatus();
    const timer = setInterval(loadStatus, 8000);
    return () => clearInterval(timer);
  }, [loadStatus]);

  function choosePhoto() {
    Alert.alert("Foto hinzufügen", "Woher soll das Foto kommen?", [
      { text: "Kamera", onPress: () => pickImage("camera") },
      { text: "Galerie", onPress: () => pickImage("gallery") },
      { text: "Abbrechen", style: "cancel" },
    ]);
  }

  async function pickImage(source: "camera" | "gallery") {
    if (source === "camera") {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Kamera", "Bitte erlaube den Kamerazugriff in den Einstellungen.");
        return;
      }
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      quality: 0.5,
      base64: true,
    };

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled) {
      setPhoto(result.assets[0]);
    }
  }

  async function submitPhoto() {
    if (!photo?.base64) return;

    setUploading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setUploading(false);
      router.replace("/login");
      return;
    }

    const userId = userData.user.id;
    const path = `${userId}/${id}-${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("proofs")
      .upload(path, decode(photo.base64), { contentType: "image/jpeg" });

    if (uploadError) {
      setUploading(false);
      Alert.alert("Fehler", uploadError.message);
      return;
    }

    const { error } = await supabase.from("submissions").insert({
      user_id: userId,
      quest_id: id,
      image_path: path,
    });

    setUploading(false);

    if (error) {
      Alert.alert("Fehler", error.message);
      return;
    }

    setPhoto(null);
    setStatus("pending");
  }

  function giveUp() {
    Alert.alert("Quest aufgeben?", "Danach kannst du eine neue Quest wählen.", [
      { text: "Abbrechen", style: "cancel" },
      {
        text: "Aufgeben",
        style: "destructive",
        onPress: async () => {
          const { data: userData } = await supabase.auth.getUser();
          if (!userData.user) return;

          const { error } = await supabase
            .from("profiles")
            .update({ active_quest_id: null })
            .eq("id", userData.user.id);

          if (error) {
            console.log(error);
            return;
          }

          router.replace("/");
        },
      },
    ]);
  }

  if (!quest) {
    return (
      <View style={styles.container}>
        <Text>Quest wird geladen...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <Text style={styles.heading}>Deine aktive Quest</Text>

      <QuestCard quest={quest} />

      {status === "pending" && (
        <Text style={styles.notice}>
          ⏳ Dein Foto wurde abgeschickt und wird geprüft.
        </Text>
      )}

      {status === "rejected" && !photo && (
        <Text style={styles.notice}>
          ❌ Dein Foto wurde abgelehnt. Bitte mach ein neues Foto.
        </Text>
      )}

      {photo && <Image source={{ uri: photo.uri }} style={styles.preview} />}

      {status !== "pending" &&
        (photo ? (
          <>
            <Pressable style={styles.refresh} onPress={submitPhoto} disabled={uploading}>
              <Text style={styles.buttonText}>
                {uploading ? "Wird gesendet..." : "Foto abschicken"}
              </Text>
            </Pressable>

            <Pressable style={styles.giveUp} onPress={choosePhoto}>
              <Text style={styles.giveUpText}>Anderes Foto wählen</Text>
            </Pressable>
          </>
        ) : (
          <Pressable style={styles.refresh} onPress={choosePhoto}>
            <Text style={styles.buttonText}>📷 Foto hinzufügen</Text>
          </Pressable>
        ))}

      <Pressable
        style={[styles.giveUp, status === "pending" && { opacity: 0.4 }]}
        onPress={giveUp}
        disabled={status === "pending"}
      >
        <Text style={styles.giveUpText}>Quest aufgeben</Text>
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
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  notice: {
    fontSize: 16,
    marginBottom: 15,
  },
  preview: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 15,
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
  giveUp: {
    marginTop: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  giveUpText: {
    fontWeight: "bold",
  },
});