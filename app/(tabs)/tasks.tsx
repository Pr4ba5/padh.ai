import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { storage } from "../utils/storge";

type Task = {
  id: string;
  title: string;
  subject: string;
  difficulty: "Easy" | "Medium" | "Hard";
  dueDate: string;
  completed: boolean;
};

const TASK_KEY = "TASKS";

const TasksScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"pending" | "done" | "all">("pending");

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy"); 

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const saved = await storage.get(TASK_KEY);
    if (saved) setTasks(saved);
  };

  const saveTasks = async (newTasks: Task[]) => {
    setTasks(newTasks);
    await storage.set(TASK_KEY, newTasks);
  };

  const addTask = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Task title is required");
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      subject: subject.trim(),
      difficulty,
      dueDate: new Date().toDateString(),
      completed: false,
    };

    const updated = [newTask, ...tasks];
    await saveTasks(updated);

    // Reset form
    setTitle("");
    setSubject("");
    setDifficulty("Easy");
  };

  const toggleTask = async (id: string) => {
    const updated = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    await saveTasks(updated);
  };

  const deleteTask = async (id: string) => {
    const updated = tasks.filter((task) => task.id !== id);
    await saveTasks(updated);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return !task.completed;
    if (filter === "done") return task.completed;
    return true;
  });

  const renderItem = ({ item }: { item: Task }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          onPress={() => toggleTask(item.id)}
          style={styles.checkbox}
        >
          {item.completed && <Text style={{ color: "#2563eb" }}>✓</Text>}
        </TouchableOpacity>

        <Text style={[styles.title, item.completed && styles.completed]}>
          {item.title}
        </Text>
      </View>

      <Text style={styles.subject}>{item.subject || "No subject"}</Text>

      <View style={styles.row}>
        <Text style={[styles.badge, item.difficulty === "Medium" && { backgroundColor: "#fef3c7" }, item.difficulty === "Hard" && { backgroundColor: "#fecaca" }]}>
          {item.difficulty}
        </Text>
        <Text style={styles.date}>Due: {item.dueDate}</Text>
        <TouchableOpacity onPress={() => deleteTask(item.id)}>
          <Text style={styles.delete}>DLT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header */}
        <Text style={styles.header}>Tasks</Text>
        <Text style={styles.subHeader}>
          {tasks.filter((t) => !t.completed).length} pending,{" "}
          {tasks.filter((t) => t.completed).length} completed
        </Text>

        {/* Filter Tabs */}
        <View style={styles.tabs}>
          {(["pending", "done", "all"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setFilter(t)}
              style={[styles.tab, filter === t && styles.activeTab]}
            >
              <Text style={filter === t && { fontWeight: "600" }}>
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Task List */}
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 160 }} 
          showsVerticalScrollIndicator={false}
        />


        <View style={styles.addBox}>
          <TextInput
            placeholder="Task title *"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            autoFocus={false}
          />
          <TextInput
            placeholder="Subject (optional)"
            value={subject}
            onChangeText={setSubject}
            style={styles.input}
          />

    
          <View style={styles.difficultyRow}>
            {(["Easy", "Medium", "Hard"] as const).map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => setDifficulty(level)}
                style={[
                  styles.levelBtn,
                  difficulty === level && styles.activeLevel,
                ]}
              >
                <Text
                  style={
                    difficulty === level && { fontWeight: "600", color: "#166534" }
                  }
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

        
          <TouchableOpacity style={styles.addBtn} onPress={addTask}>
            <Text style={styles.addBtnText}>+ Add Task</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default TasksScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginTop: 12,
    paddingTop: 30
  },
  subHeader: {
    color: "#666",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  activeTab: {
    backgroundColor: "#dbeafe",
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  completed: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  subject: {
    color: "#666",
    marginTop: 6,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    justifyContent: "space-between",
  },
  badge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: "500",
    color: "#166534",
  },
  date: {
    color: "#666",
    fontSize: 13,
    flex: 1,
    marginLeft: 10,
  },
  delete: {
    fontSize: 20,
    paddingLeft: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#333",
    borderRadius: 6,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addBox: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#f9fafb",
    fontSize: 16,
  },
  difficultyRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  levelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginRight: 10,
  },
  activeLevel: {
    backgroundColor: "#dcfce7",
    borderColor: "#22c55e",
  },
  addBtn: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  addBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});