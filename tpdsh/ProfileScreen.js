import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Switch,
  ScrollView,
} from "react-native";

const ProfileScreen = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <ScrollView
      style={[styles.container, darkMode && styles.darkContainer]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.title, darkMode && styles.darkText]}>TapDash</Text>
        <Text style={[styles.subtitle, darkMode && styles.darkText]}>
          Player Profile
        </Text>
      </View>

      {/* PROFILE CARD */}
      <View style={[styles.card, darkMode && styles.darkCard]}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150" }}
          style={styles.avatar}
        />
        <Text style={[styles.name, darkMode && styles.darkText]}>
          Player One
        </Text>
        <Text style={[styles.username, darkMode && styles.darkText]}>
          @tapdash_user
        </Text>
      </View>

      {/* SETTINGS SECTION */}
      <View style={[styles.settings, darkMode && styles.darkCard]}>
        <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>
          Settings
        </Text>

        {/* Dark Mode */}
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, darkMode && styles.darkText]}>
            Dark Mode
          </Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>

        {/* Sound */}
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, darkMode && styles.darkText]}>
            Sound
          </Text>
          <Switch value={soundEnabled} onValueChange={setSoundEnabled} />
        </View>

        {/* Edit Profile */}
        <TouchableOpacity
          style={styles.settingButton}
          onPress={() => alert("Edit Profile coming soon!")}
        >
          <Text style={styles.settingButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.settingButton, { backgroundColor: "#ff4d4d" }]}
          onPress={() => alert("Logged out!")}
        >
          <Text style={styles.settingButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  header: {
    alignItems: "center",
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  subtitle: {
    fontSize: 16,
    color: "#777",
  },
  card: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 16,
    alignItems: "center",
    padding: 20,
    elevation: 5,
  },
  darkCard: {
    backgroundColor: "#1E1E1E",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  username: {
    color: "gray",
  },
  settings: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#000",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  settingLabel: {
    fontSize: 16,
    color: "#000",
  },
  settingButton: {
    backgroundColor: "#3B82F6",
    marginTop: 15,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  settingButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  darkText: {
    color: "#fff",
  },
});