import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import appFirebase from "../credenciales";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const db = getFirestore(appFirebase);
const storage = getStorage(appFirebase);

export default function CreateNote(props) {
  const initialState = {
    titulo: "",
    detalle: "",
  };

  const [date, setDate] = useState(new Date(1598051730000));
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [estado, setEstado] = useState(initialState);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === "ios");
    setDate(currentDate);

    let tempDate = new Date(currentDate);
    let fDate =
      tempDate.getDate() +
      "/" +
      (tempDate.getMonth() + 1) +
      "/" +
      tempDate.getFullYear();
    let fTime = tempDate.getHours() + " : " + tempDate.getMinutes();
    setFecha(fDate);
    setHora(fTime);
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const handleChangeText = (value, name) => {
    setEstado({ ...estado, [name]: value });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(
        storage,
        `images/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      );
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error("Error uploading image: ", error);
      return null;
    }
  };

  const saveNote = async () => {
    try {
      if (estado.titulo === "" || estado.detalle === "" || hora === "" || fecha === "" || !image) {
        Alert.alert("Mensaje", "Debes rellenar todos los campos");
        return;
      }

      setLoading(true); // Mostrar el loader

      let imageUrl = "";
      if (image) {
        imageUrl = await uploadImage(image);
      }

      const nota = {
        titulo: estado.titulo,
        detalle: estado.detalle,
        fecha: fecha,
        hora: hora,
        imageUrl: imageUrl,
      };

      await addDoc(collection(db, "notas"), nota);
      Alert.alert("Éxito", "Guardado con éxito");
      props.navigation.navigate("Notas");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Ocultar el loader
    }
  };

  return (
    <ScrollView>
    <View style={styles.contenedorPadre}>
      <View style={styles.tarjeta}>
        <View style={styles.contenedor}>
          <TextInput
            placeholder="Título"
            style={styles.textoInput}
            value={estado.titulo}
            onChangeText={(value) => handleChangeText(value, "titulo")}
          />
          <TextInput
            placeholder="Detalle"
            multiline={true}
            numberOfLines={4}
            style={styles.textoInput}
            value={estado.detalle}
            onChangeText={(value) => handleChangeText(value, "detalle")}
          />

          {/* Contenedor de fecha */}
          <View style={styles.inputDate}>
            <Text style={styles.textoDate} onPress={() => showMode("date")}>
              {" "}
              {fecha || "Establezca una fecha"}
            </Text>
          </View>

          {/* Contenedor de hora */}
          <View style={styles.inputDate}>
            <Text
              style={styles.textoDate}
              value={hora}
              onPress={() => showMode("time")}
            >
              {hora || "Establezca una hora"}
            </Text>
          </View>

          {show && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode={mode}
              is24Hour={true}
              display="default"
              onChange={onChange}
              minimumDate={new Date("2024-07-26")}
            />
          )}

          {/* Componente para seleccionar la imagen */}
          <TouchableOpacity style={styles.botonDate} onPress={pickImage}>
            <Text style={styles.subtitle}>Seleccionar Imagen</Text>
          </TouchableOpacity>
          {image && (
            <Image
              source={{ uri: image }}
              style={{ width: 200, height: 200 }}
            />
          )}

          <View>
            <TouchableOpacity style={styles.botonEnviar} onPress={saveNote} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.textoBtnEnviar}>Guardar una nueva nota</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedorPadre: {
    backgroundColor: "white",
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
  },
  tarjeta: {
    width: "90%",
  },
  contenedor: {},
  textoInput: {
    borderColor: "slategray",
    borderWidth: 1,
    borderColor: "gray",
    color: "gray",
    padding: 5,
    marginTop: 10,
    borderRadius: 6,
  },
  inputDate: {
    width: "100%",
    flexWrap: "wrap",
    flexDirection: "row",
  },
  botonDate: {
    backgroundColor: "#0c83369e",
    borderRadius: 5,
    padding: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  textoDate: {
    color: "gray",
    borderColor: "gray",
    borderColor: "slategray",
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
  },
  subtitle: {
    color: "white",
  },
  botonEnviar: {
    backgroundColor: "#6283e5",
    borderRadius: 6,
    marginTop: 10,
    padding: 10,
    alignItems: "center",
  },
  textoBtnEnviar: {
    textAlign: "center",
    color: "white",
  },
});
