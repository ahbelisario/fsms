import React, { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { ScreenStyles } from "@/src/styles/appStyles";

let DateTimePicker;
if (Platform.OS !== "web") {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
}

function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export default function DatePickerField({
  label,
  value,
  onChange,
  placeholder = "YYYY-MM-DD",
  disabled = false,
}) {
  const [show, setShow] = useState(false);

  /* ===================== WEB ===================== */
  if (Platform.OS === "web") {
    return (
      <View>
        {label && <Text style={ScreenStyles.label}>{label}</Text>}
        <input
          type="date"
          value={value || ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          style={{
            height: 22,
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #cbd5e1",
            fontSize: 13,
          }}
        />
      </View>
    );
  }

  /* ===================== MOBILE ===================== */
  const dateValue = value ? new Date(value) : new Date();

  function onPick(_, selectedDate) {
    setShow(false);
    if (selectedDate) {
      onChange(formatDate(selectedDate));
    }
  }

  return (
    <View>
      {label && <Text style={ScreenStyles.label}>{label}</Text>}

      <Pressable
        style={[
          ScreenStyles.input,
          { justifyContent: "center", opacity: disabled ? 0.6 : 1 },
        ]}
        disabled={disabled}
        onPress={() => setShow(true)}
      >
        <Text style={{ color: value ? "#0f172a" : "#64748b" }}>
          {value || placeholder}
        </Text>
      </Pressable>

      {show && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onPick}
        />
      )}
    </View>
  );
}
