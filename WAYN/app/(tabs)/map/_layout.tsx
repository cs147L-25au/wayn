import { Stack } from "expo-router";

export default function MapLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="giftSelection"
        options={({ route }) => ({
          headerShown: false,
          presentation: "card",
          // Default to slide_from_right, but use param if provided
          animation:
            (route.params as any)?.transition === "slide_from_left"
              ? "slide_from_left"
              : "slide_from_right",
        })}
      />
      <Stack.Screen
        name="collaboratorSelection"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="merchantSelection"
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="giftCardCustomization"
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="paymentConfirmation"
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="giftSendAnimation"
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="audioCompose"
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
    </Stack>
  );
}
