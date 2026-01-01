import { useRouter } from "expo-router";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";


export default function Login() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.innerContainer}>
          <Image
            source={require("../assets/images/signup.png")} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Image
            source={require("../assets/images/splash11.png")} 
            style={{
              width: 300,
              height: 60,
            }}
            resizeMode="contain"
          />


          <View style={styles.form}>
            <TextInput placeholder="Email" style={styles.input} keyboardType="email-address" autoCapitalize="none" />
            <TextInput
              placeholder="Password"
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace("/(tabs)")}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={styles.link}>Don’t have an account? Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: 270,        
    height: 270,       
    marginTop: 60,     
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
    color: "#1e293b",
  },
  form: {
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#f9fafb",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4f46e5",
    padding: 16,
    borderRadius: 12,
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
    marginTop: 24,
    color: "#6366f1",
    fontSize: 15,
  },
});