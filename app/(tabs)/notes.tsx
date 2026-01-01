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

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

const NOTES_KEY = "NOTES";

const NotesScreen = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);


  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const saved = await storage.get(NOTES_KEY);
    if (saved) {
      // Sortedds by most recently updated
      setNotes(saved.sort((a: Note, b: Note) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ));
    }
  };

  const saveNotes = async (newNotes: Note[]) => {
    setNotes(newNotes);
    await storage.set(NOTES_KEY, newNotes);
  };

  const addOrUpdateNote = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Note title is required");
      return;
    }

    const now = new Date().toISOString();

    if (editingId) {
      //fpr Updating existing note
      const updated = notes.map((note) =>
        note.id === editingId
          ? { ...note, title: title.trim(), content: content.trim(), updatedAt: now }
          : note
      );
      await saveNotes(updated);
      setEditingId(null);
    } else {
      // Addingg new note
      const newNote: Note = {
        id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        createdAt: now,
        updatedAt: now,
      };
      await saveNotes([newNote, ...notes]);
    }

    // Reset form
    setTitle("");
    setContent("");
  };

  const editNote = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note.id);
  };

  const deleteNote = (id: string) => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updated = notes.filter((note) => note.id !== id);
            await saveNotes(updated);
          },
        },
      ]
    );
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
  };

  const renderItem = ({ item }: { item: Note }) => (
    <View style={styles.card}>
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle}>{item.title}</Text>
        <TouchableOpacity onPress={() => deleteNote(item.id)}>
          <Text style={styles.delete}>🗑</Text>
        </TouchableOpacity>
      </View>

      {item.content ? (
        <Text style={styles.noteContent} numberOfLines={4}>
          {item.content}
        </Text>
      ) : (
        <Text style={styles.placeholder}>No content</Text>
      )}

      <Text style={styles.date}>
        {new Date(item.updatedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>

      <TouchableOpacity style={styles.editBtn} onPress={() => editNote(item)}>
        <Text style={styles.editBtnText}>Edit Note</Text>
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
        <Text style={styles.header}>My Notes</Text>
        <Text style={styles.subHeader}>{notes.length} notes</Text>

      
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No notes yet</Text>
              <Text style={styles.emptySub}>Add your first note below 👇</Text>
            </View>
          }
        />

        <View style={styles.addBox}>
          <Text style={styles.formTitle}>
            {editingId ? "Edit Note" : "New Note"}
          </Text>

          <TextInput
            placeholder="Note title *"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          <TextInput
            placeholder="Write your notes here..."
            value={content}
            onChangeText={setContent}
            style={[styles.input, styles.contentInput]}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.buttonRow}>
            {editingId && (
              <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.addBtn} onPress={addOrUpdateNote}>
              <Text style={styles.addBtnText}>
                {editingId ? "Update Note" : "+ Add Note"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NotesScreen;

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
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginRight: 10,
  },
  noteContent: {
    fontSize: 15,
    color: "#444",
    marginTop: 10,
    lineHeight: 22,
  },
  placeholder: {
    fontSize: 15,
    color: "#999",
    fontStyle: "italic",
    marginTop: 10,
  },
  date: {
    fontSize: 13,
    color: "#888",
    marginTop: 12,
  },
  delete: {
    fontSize: 20,
  },
  editBtn: {
    marginTop: 12,
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  editBtnText: {
    color: "#2563eb",
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
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
  contentInput: {
    height: 120,
    paddingTop: 14,
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