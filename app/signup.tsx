import { useRouter } from "expo-router";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Signup() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Logo Image at the Top */}
      <Image
        source={require("../assets/images/Prinsu_there.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Title */}
      <Text style={styles.title}>Create Account</Text>

      {/* Form Fields */}
      <TextInput placeholder="Name" style={styles.input} />
      <TextInput placeholder="Email" style={styles.input} keyboardType="email-address" autoCapitalize="none" />
      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        autoCapitalize="none"
      />

      {/* Sign Up Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/(tabs)")}
      >
        <Text style={styles.buttonText}>Sign up</Text>
      </TouchableOpacity>

      {/* Login Link */}
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "flex-start",    // Changed from "center" → starts from top
    alignItems: "center",            // Keeps form centered horizontally
    backgroundColor: "#fff",
  },
  logo: {
    width: 220,
    height: 220,
    marginTop: 60,         // Gives nice space from top of screen
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 30,
    color: "#1e293b",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#f9fafb",
    fontSize: 16,
  },
  button: {
    width: "100%",
    backgroundColor: "#4f46e5",
    padding: 15,
    borderRadius: 10,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    textAlign: "center",
    marginTop: 20,
    color: "#4f46e5",
    fontSize: 15,
  },
});