import { useEffect } from "react";
import { View, Text } from "react-native"

import { supabase } from "@/lib/supabase";


export default function Crew(){

        useEffect(() => {
        async function getQuests() {
            const { data, error } = await supabase
                .from("quests")
                .select("*");

            console.log("QUESTS:", data);
            console.log("ERROR:", error);
        }

        getQuests();
    }, []);

    return(
        <View>
            <Text>Hallo</Text>
        </View>
    )
}