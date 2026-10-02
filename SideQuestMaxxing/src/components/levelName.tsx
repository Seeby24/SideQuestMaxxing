import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

type Tier = {
    icon: string;
    title: string;
    color: string;
    glow?: string;
    glowRadius?: number;
    pulse?: boolean;
    rainbow?: boolean;
};

const RAINBOW = ["#ff1744", "#ff9100", "#ffc400", "#00c853", "#2979ff", "#d500f9", "#ff1744"];

function getTier(level: number): Tier {
    if (level >= 50) return { icon: "👑", title: "MAXXED", color: "#ff1744", glow: "#ffc400", glowRadius: 8, rainbow: true };
    if (level >= 35) return { icon: "🔥", title: "Legende", color: "#d50000", glow: "#ff5252", glowRadius: 8, pulse: true };
    if (level >= 21) return { icon: "🛡️", title: "Veteran", color: "#7b1fa2", glow: "#ce93d8", glowRadius: 6 };
    if (level >= 10) return { icon: "⚔️", title: "Abenteurer", color: "#c78a00", glow: "#ffd54f", glowRadius: 6 };
    if (level >= 6) return { icon: "🧭", title: "Entdecker", color: "#546e7a" };
    return { icon: "🌱", title: "Anfänger", color: "#8d6e63" };
}

export default function LevelName({ level, size = 16 }: { level: number; size?: number }) {
    const tier = getTier(level);
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!tier.pulse && !tier.rainbow) return;

        const loop = Animated.loop(
            tier.rainbow
                ? Animated.timing(anim, {
                      toValue: 1,
                      duration: 4000,
                      easing: Easing.linear,
                      useNativeDriver: false,
                  })
                : Animated.sequence([
                      Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: false }),
                      Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: false }),
                  ])
        );

        loop.start();
        return () => loop.stop();
    }, [tier.pulse, tier.rainbow]);

    const color = tier.rainbow
        ? anim.interpolate({
              inputRange: RAINBOW.map((_, i) => i / (RAINBOW.length - 1)),
              outputRange: RAINBOW,
          })
        : tier.color;

    const opacity = tier.pulse
        ? anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] })
        : 1;

    return (
        <Animated.View
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: 20,
                borderWidth: 2,
                borderColor: color,
                backgroundColor: "#fff",
                opacity,
                shadowColor: tier.glow ?? "transparent",
                shadowOpacity: tier.glow ? 0.9 : 0,
                shadowRadius: tier.glowRadius ?? 0,
                shadowOffset: { width: 0, height: 0 },
            }}
        >
            <Animated.Text style={{ fontSize: size }}>{tier.icon}</Animated.Text>

            <Animated.Text
                style={{
                    color,
                    fontSize: size,
                    fontWeight: "bold",
                    textShadowColor: tier.glow ?? "transparent",
                    textShadowRadius: tier.glowRadius ? tier.glowRadius / 2 : 0,
                    textShadowOffset: { width: 0, height: 0 },
                }}
            >
                Level {level} · {tier.title}
            </Animated.Text>
        </Animated.View>
    );
}