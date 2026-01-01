// app/(tabs)/mentor.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Bot, Send, Trash2 } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const STORAGE_KEY = "@padhai_ai_messages";
const OPENAI_API_KEY = "Hass been removed";

export default function MentorScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      }
    } catch (e) {
      console.log("Load failed");
    }
  };

  const saveMessages = async (msgs: Message[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
    } catch (e) {
      console.log("Save failed, sorry.");
    }
  };

  const callOpenAI = async (question: string): Promise<string> => {
    if (!OPENAI_API_KEY) {
      return "API key missing. Add EXPO_PUBLIC_OPENAI_API_KEY to your .env file in project root.";
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", 
          messages: [
            {
              role: "system",
              content: //prompt for taking out desired response from our gpt model
                "You are a friendly, clear, and patient AI study mentor for students. Explain concepts simply, give examples, and encourage learning.",
            },
            { role: "user", content: question },
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return `Error: ${data.error?.message || "Something went wrong"}`;
      }

      return data.choices[0]?.message?.content || "No response.";
    } catch (error) {
      return "Network error — check your internet connection.";
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    saveMessages(updated);
    setInput("");
    setLoading(true);

    const aiResponse = await callOpenAI(userMsg.content);

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
    };

    const final = [...updated, assistantMsg];
    setMessages(final);
    saveMessages(final);
    setLoading(false);
  };

  const clearChat = () => {
    Alert.alert("Clear Chat", "Delete all messages?", [
      { text: "Cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          setMessages([]);
          await AsyncStorage.removeItem(STORAGE_KEY);
        },
      },
    ]);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.assistantBubble]}>
      <Text style={[styles.messageText, item.role === "user" && { color: "#fff" }]}>
        {item.content}
      </Text>
      <Text style={[styles.time, item.role === "user" && { color: "#eee" }]}>
        {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Bot size={28} color="#2563eb" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.title}>AI Mentor</Text>
              <Text style={styles.subtitle}>Powered by padh.ai</Text>
            </View>
          </View>
          {messages.length > 0 && (
            <TouchableOpacity onPress={clearChat}>
              <Trash2 size={22} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>

        {/* Empty State */}
        {messages.length === 0 && !loading && (
          <View style={styles.empty}>
            <Bot size={80} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Hello! I'm your AI Mentor</Text>
            <Text style={styles.emptyText}>You can ask me anything about your studies.. </Text>
          </View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Loading */}
        {loading && (
          <View style={styles.loadingBubble}>
            <ActivityIndicator color="#64748b" />
            <Text style={{ marginLeft: 8, color: "#64748b" }}>Thinking...</Text>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask a question..."
            placeholderTextColor="#94a3b8"
            multiline
            editable={!loading}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={loading || !input.trim()}
            style={[styles.sendBtn, (!input.trim() || loading) && { backgroundColor: "#cbd5e1" }]}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Styles remain exactly the same as before
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#1e293b" },
  subtitle: { fontSize: 14, color: "#64748b" },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 20, fontWeight: "600", marginTop: 20, color: "#1e293b" },
  emptyText: { fontSize: 16, color: "#64748b", textAlign: "center", marginTop: 12 },
  bubble: {
    maxWidth: "80%",
    padding: 14,
    borderRadius: 18,
    marginVertical: 6,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#2563eb",
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f5f9",
    borderBottomLeftRadius: 6,
  },
  messageText: { fontSize: 16, lineHeight: 22 },
  time: { fontSize: 12, marginTop: 6, opacity: 0.7 },
  loadingBubble: {
    flexDirection: "row",
    alignSelf: "flex-start",
    backgroundColor: "#f1f5f9",
    padding: 14,
    borderRadius: 18,
    marginLeft: 16,
    marginVertical: 8,
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#f1f5f9",
  },
  input: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  }
});