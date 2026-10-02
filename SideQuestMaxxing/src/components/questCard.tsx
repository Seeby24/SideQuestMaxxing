import { View, StyleSheet, Text } from "react-native";


type QuestCardProps = {
    quest: any;
};


export default function QuestCard({ quest }: QuestCardProps) {
    return (

        <View style={styles.card}>

            <Text style={styles.category}>
                {quest.category}
            </Text>

            <Text style={styles.title}>
                {quest.title}
            </Text>

            <Text style={styles.description}>
                {quest.description}
            </Text>

            <View style={styles.info}>
                <Text>{quest.difficulty}</Text>
                <Text>+{quest.points} Punkte</Text>
            </View>

        </View>

    )

}

const styles = StyleSheet.create({
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

    category: {
        fontSize: 14,
        marginBottom: 10,
        textTransform: "uppercase",
    },

    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },

    description: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 20,
    },

    info: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },

})
