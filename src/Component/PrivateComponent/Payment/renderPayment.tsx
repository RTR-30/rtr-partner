import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

const RenderPayment = ({ item }: any) => {
    
  return (
    <View style={styles.row}>
      {/* Amount */}
      <Text style={[styles.cell, styles.amount]}>
        ₹{item.amount}
      </Text>

      {/* Payment Method */}
      <Text style={[styles.cell, styles.method]}>
        {item.payment_method}
      </Text>

      {/* Date & Time */}
      <View style={styles.dateContainer}>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString("en-IN")}
        </Text>

        <Text style={styles.time}>
          {new Date(item.created_at).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );
};

export default RenderPayment;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  cell: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },

  amount: {
    fontWeight: "700",
    color: "#16A34A",
  },

  method: {
    textTransform: "uppercase",
    fontWeight: "600",
    color: "#2563EB",
  },

  dateContainer: {
    flex: 1.3,
    alignItems: "flex-end",
  },

  date: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
  },

  time: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
});