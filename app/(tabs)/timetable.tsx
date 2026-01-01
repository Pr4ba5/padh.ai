// app/(tabs)/timetable.tsx
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { storage } from "../utils/storge";

type Class = {
  id: string;
  subject: string;
  time: string; // e.g., "09:00 - 10:30"
  days: string[]; // e.g., ["Monday", "Wednesday"]
  venue?: string;
};

const TIMETABLE_KEY = "TIMETABLE";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TimetableScreen = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subject, setSubject] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    const saved = await storage.get(TIMETABLE_KEY);
    if (saved) setClasses(saved);
  };

  const saveClasses = async (newClasses: Class[]) => {
    setClasses(newClasses);
    await storage.set(TIMETABLE_KEY, newClasses);
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const addOrUpdateClass = async () => {
    if (!subject.trim()) {
      Alert.alert("Error", "Subject name is required");
      return;
    }
    if (selectedDays.length === 0) {
      Alert.alert("Error", "Please select at least one day");
      return;
    }
    if (!time.trim()) {
      Alert.alert("Error", "Class time is required");
      return;
    }

    const now = new Date().toISOString();

    if (editingId) {
      const updated = classes.map((c) =>
        c.id === editingId
          ? { ...c, subject: subject.trim(), time: time.trim(), days: selectedDays, venue: venue.trim() }
          : c
      );
      await saveClasses(updated);
      setEditingId(null);
    } else {
      const newClass: Class = {
        id: Date.now().toString(),
        subject: subject.trim(),
        time: time.trim(),
        days: selectedDays,
        venue: venue.trim() || undefined,
      };
      await saveClasses([...classes, newClass]);
    }

    setSubject("");
    setTime("");
    setVenue("");
    setSelectedDays([]);
  };

  const editClass = (cls: Class) => {
    setSubject(cls.subject);
    setTime(cls.time);
    setVenue(cls.venue || "");
    setSelectedDays(cls.days);
    setEditingId(cls.id);
  };

  const deleteClass = (id: string) => {
    Alert.alert("Delete Class", "Remove this class from your timetable?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const updated = classes.filter((c) => c.id !== id);
          await saveClasses(updated);
        },
      },
    ]);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSubject("");
    setTime("");
    setVenue("");
    setSelectedDays([]);
  };


  const classesByDay = DAYS.map((day) => ({
    day,
    classes: classes
      .filter((c) => c.days.includes(day))
      .sort((a, b) => a.time.localeCompare(b.time)),
  }));

  const today = new Date().toLocaleString("en-us", { weekday: "long" });

  const renderClassCard = (cls: Class) => (
    <View style={styles.classCard}>
      <View style={styles.classHeader}>
        <Text style={styles.subjectText}>{cls.subject}</Text>
        <TouchableOpacity onPress={() => deleteClass(cls.id)}>
          <Text style={styles.delete}>🗑</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.timeText}>{cls.time}</Text>
      {cls.venue ? <Text style={styles.venueText}>Room: {cls.venue}</Text> : null}
      <TouchableOpacity style={styles.editBtn} onPress={() => editClass(cls)}>
        <Text style={styles.editBtnText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <Text style={styles.header}>My Timetable</Text>
        <Text style={styles.subHeader}>Weekly schedule</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {classesByDay.find((d) => d.day === today)?.classes.length > 0 && (
            <View style={styles.todaySection}>
              <Text style={styles.todayLabel}>Today - {today}</Text>
              {classesByDay
                .find((d) => d.day === today)!
                .classes.map((cls) => renderClassCard(cls))}
            </View>
          )}

          {classesByDay.map(({ day, classes: dayClasses }) => {
            if (dayClasses.length === 0) return null;
            if (day === today) return null; 

            return (
              <View key={day} style={styles.daySection}>
                <Text style={styles.dayLabel}>{day}</Text>
                {dayClasses.map((cls) => renderClassCard(cls))}
              </View>
            );
          })}

          {classes.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No classes added yet</Text>
              <Text style={styles.emptySub}>Start building your weekly timetable 👇</Text>
            </View>
          )}

          <View style={{ height: 160 }} />
        </ScrollView>

        {/* Add/Edit Form */}
        <View style={styles.addBox}>
          <Text style={styles.formTitle}>
            {editingId ? "Edit Class" : "Add New Class"}
          </Text>

          <TextInput
            placeholder="Subject name *"
            value={subject}
            onChangeText={setSubject}
            style={styles.input}
          />

          <TextInput
            placeholder="Time (e.g. 09:00 - 10:30) *"
            value={time}
            onChangeText={setTime}
            style={styles.input}
          />

          <TextInput
            placeholder="Room / Venue (optional)"
            value={venue}
            onChangeText={setVenue}
            style={styles.input}
          />

          {/* Day Selector */}
          <Text style={styles.daySelectorLabel}>Days *</Text>
          <View style={styles.daysRow}>
            {DAYS.map((day) => (
              <TouchableOpacity
                key={day}
                onPress={() => toggleDay(day)}
                style={[
                  styles.dayBtn,
                  selectedDays.includes(day) && styles.activeDay,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    selectedDays.includes(day) && styles.activeDayText,
                  ]}
                >
                  {day.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonRow}>
            {editingId && (
              <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.addBtn} onPress={addOrUpdateClass}>
              <Text style={styles.addBtnText}>
                {editingId ? "Update Class" : "+ Add Class"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default TimetableScreen;

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
    paddingTop: 40
  },
  subHeader: {
    color: "#2847e1ff",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  todaySection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  todayLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2563eb",
    marginBottom: 12,
  },
  daySection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  dayLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },
  classCard: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 10,
  },
  classHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  subjectText: {
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
  },
  timeText: {
    fontSize: 15,
    color: "#2563eb",
    fontWeight: "500",
    marginTop: 6,
  },
  venueText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  delete: {
    fontSize: 20,
  },
  editBtn: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#e0e7ff",
    borderRadius: 8,
  },
  editBtnText: {
    color: "#4338ca",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "500",
  },
  emptySub: {
    fontSize: 15,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
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
  formTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1f2937",
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
  daySelectorLabel: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 8,
    color: "#444",
  },
  daysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  dayBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  activeDay: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  dayText: {
    fontSize: 14,
    color: "#444",
  },
  activeDayText: {
    color: "#fff",
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    marginRight: 10,
  },
  cancelBtnText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 16,
  },
  addBtn: {
    flex: 2,
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