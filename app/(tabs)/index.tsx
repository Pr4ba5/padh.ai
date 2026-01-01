// app/(tabs)/index.tsx  → Home Dashboard
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { storage } from "../utils/storge"; // Adjust path if needed

type Task = { id: string; title: string; completed: boolean; dueDate: string };
type Note = { id: string; title: string; updatedAt: string };
type Class = { id: string; subject: string; time: string; days: string[] };

const TASK_KEY = "TASKS";
const NOTES_KEY = "NOTES";
const TIMETABLE_KEY = "TIMETABLE";

const HomeScreen = () => {
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [todayClasses, setTodayClasses] = useState<Class[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);

  const today = new Date().toLocaleString("en-us", { weekday: "long" });
  const dateStr = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [tasks, notes, classes] = await Promise.all([
      storage.get(TASK_KEY) || [],
      storage.get(NOTES_KEY) || [],
      storage.get(TIMETABLE_KEY) || [],
    ]);

    // Pending tasks
    const pending = tasks.filter((t: Task) => !t.completed);
    setPendingTasks(pending.slice(0, 5)); // Show max 5

    // Today's classes
    const todayClasses = classes.filter((c: Class) => c.days.includes(today));
    setTodayClasses(todayClasses.sort((a: Class, b: Class) => a.time.localeCompare(b.time)));

    // Recent notes (latest 3)
    const sortedNotes = notes.sort((a: Note, b: Note) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    setRecentNotes(sortedNotes.slice(0, 3));
  };

  const Greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{Greeting()} User</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>

        {/* Today's Classes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Classes</Text>
          {todayClasses.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No classes today</Text>
              <Text style={styles.emptySub}>Better option is go travel somewhere haha</Text>
            </View>
          ) : (
            todayClasses.map((cls) => (
              <View key={cls.id} style={styles.classCard}>
                <Text style={styles.classTime}>{cls.time}</Text>
                <Text style={styles.classSubject}>{cls.subject}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Tasks</Text>
            <Text style={styles.countBadge}>{pendingTasks.length}</Text>
          </View>

          {pendingTasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>All caught up</Text>
              <Text style={styles.emptySub}>Great job staying on top of things.</Text>
            </View>
          ) : (
            pendingTasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <Text style={styles.taskTitle}>• {task.title}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Notes</Text>
          {recentNotes.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No notes yet</Text>
              <Text style={styles.emptySub}>Start jotting down ideas in the Notes tab</Text>
            </View>
          ) : (
            recentNotes.map((note) => (
              <View key={note.id} style={styles.noteCard}>
                <Text style={styles.noteTitle}>{note.title || "Untitled"}</Text>
                <Text style={styles.noteDate}>
                  {new Date(note.updatedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.quoteCard}>
          <Text style={styles.quote}>
            "The expert in anything was once a beginner."
          </Text>
          <Text style={styles.quoteAuthor}>— Helen Hayes</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1e293b",
  },
  date: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 6,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
  },
  countBadge: {
    marginLeft: 10,
    backgroundColor: "#ef4444",
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: "600",
  },
  classCard: {
    backgroundColor: "#eff6ff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
  },
  classTime: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2563eb",
  },
  classSubject: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 4,
  },
  taskCard: {
    backgroundColor: "#fefce8",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 16,
    color: "#854d0e",
    fontWeight: "500",
  },
  noteCard: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
  },
  noteDate: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 6,
  },
  emptyCard: {
    backgroundColor: "#f8fafc",
    padding: 24,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
  },
  emptySub: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 6,
    textAlign: "center",
  },
  quoteCard: {
    marginHorizontal: 20,
    marginTop: 32,
    padding: 24,
    backgroundColor: "#2563eb",
    borderRadius: 16,
    alignItems: "center",
  },
  quote: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    lineHeight: 28,
  },
  quoteAuthor: {
    fontSize: 14,
    color: "#dbeafe",
    marginTop: 12,
    fontStyle: "italic",
  },
});