import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  Button,
  Alert,
} from "react-native";
import Modal from "react-native-modal";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";

const { width, height } = Dimensions.get("window");

const PollModal = ({ isVisible, onClose, onSubmit }) => {
    const [pollTitle, setPollTitle] = useState("");
    const [options, setOptions] = useState([""]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const handleOptionChange = (text, index) => {
    const newOptions = [...options];
    newOptions[index] = text;
    setOptions(newOptions);
  };

  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    if (pollTitle.trim() === "" || options.some(option => option.trim() === "") || options.length < 2) {
      Alert.alert("Error", "Please provide at least two options.");
      return;
    }
    
    onSubmit({ title: pollTitle, options });
    // Reset the state to clear the form
    setPollTitle("");
    setOptions([""]);
    onClose();
};

  return (
    <Modal isVisible={isVisible} animationType="fade" onBackdropPress={onClose}>
      <View style={styles.modalContainer}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          }}
        >
          <TextInput
            style={[styles.input, styles.inputTitle]}
            placeholder="Input Title"
            value={pollTitle}
            onChangeText={setPollTitle}
          />
          <FlatList
            data={options}
            renderItem={({ item, index }) => (
              <View style={styles.optionContainer}>
                <TextInput
                  key={index}
                  style={styles.input}
                  placeholder={`Option ${index + 1}`}
                  value={item}
                  onChangeText={(text) => handleOptionChange(text, index)}
                />
                <TouchableOpacity
                  style={styles.deleteOptionButton}
                  onPress={() => removeOption(index)}
                >
                  <FontAwesome6 name="trash" size={20} color="#FF6347" />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
          <TouchableOpacity style={styles.addOptionButton} onPress={addOption}>
            <Text style={styles.addOptionText}>+ Add Option</Text>
          </TouchableOpacity>
          <Button title="Create Poll" onPress={handleSubmit} />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "#1c1c1c",
    borderRadius: 20,
    padding: 20,
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#2c2c2c",
    color: "#FFF",
  },
  inputTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteOptionButton: {
    marginLeft: 10,
  },
  addOptionButton: {
    alignSelf: "center",
    marginBottom: 20,
  },
  addOptionText: {
    color: "#1e90ff",
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: "#1e90ff",
    textAlign: "center",
  },
});

export default PollModal;