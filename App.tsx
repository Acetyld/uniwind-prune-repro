import "./global.css";

import { FlashList } from "@shopify/flash-list";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { NitroModules } from "react-native-nitro-modules";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

// Number of rows in the hidden list. Each row has 8 styled nodes, all of them register
// (spacing, font and colour classes depend on CSS variables).
const HIDDEN_ROWS = 300;
const ROWS = Array.from({ length: 2000 }, (_, i) => i);

function Row({ index }: { index: number }) {
    return (
        <View className="flex-row items-center gap-3 border-b border-gray-200 px-4 py-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                <Text className="text-sm font-semibold text-white">{index % 100}</Text>
            </View>
            <View className="flex-1 gap-1">
                <Text className="text-base font-medium text-gray-900">Item {index}</Text>
                <Text className="text-sm text-gray-500">Group {index % 40}, subtitle</Text>
            </View>
            <Text className="text-xs text-gray-400">#{index}</Text>
        </View>
    );
}

function entryCount(): number | string {
    try {
        const diagnostics = NitroModules.createHybridObject<any>("UniwindDiagnostics");
        return diagnostics.getEntriesForDependencies([1, 2, 3, 4, 5, 6, 7, 8, 9]).classNames.length;
    } catch {
        return "n/a";
    }
}

// A UI-thread animation: every frame is a Fabric mount, so every frame runs the mount hook.
function Spinner() {
    const x = useSharedValue(0);
    useEffect(() => {
        x.value = withRepeat(withTiming(1, { duration: 800, easing: Easing.linear }), -1, true);
    }, [x]);
    const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * 200 }] }));
    return <Animated.View className="h-2 w-10 rounded bg-red-500" style={style} />;
}

export default function App() {
    // "Hidden tab": a list that stays mounted but is not visible, like an inactive tab.
    const [hidden, setHidden] = useState(false);
    const [entries, setEntries] = useState<number | string>(0);

    useEffect(() => {
        const id = setInterval(() => setEntries(entryCount()), 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <View className="flex-1 bg-white pt-16">
            <View className="gap-2 px-4 pb-3">
                <Text className="text-base font-semibold text-gray-900">Registered entries: {entries}</Text>
                <Pressable className="rounded bg-gray-900 px-3 py-2" onPress={() => setHidden((h) => !h)}>
                    <Text className="text-white">{hidden ? "Unmount" : "Mount"} {HIDDEN_ROWS} hidden rows</Text>
                </Pressable>
                <Spinner />
            </View>
            {hidden && (
                <View className="absolute h-0 w-0 overflow-hidden">
                    {ROWS.slice(0, HIDDEN_ROWS).map((i) => (
                        <Row key={i} index={i} />
                    ))}
                </View>
            )}
            <FlashList data={ROWS} renderItem={({ item }) => <Row index={item} />} />
        </View>
    );
}
