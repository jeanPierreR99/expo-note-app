import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import appFirebase from '../credenciales';
import { getFirestore, doc, deleteDoc, getDoc } from 'firebase/firestore';

const db = getFirestore(appFirebase);

export default function DetailsNote(props) {
  const [nota, setNota] = useState({});
  const [loading, setLoading] = useState(true);

  const getOneNote = async (id) => {
    try {
      const docRef = doc(db, 'notas', id);
      const docSnap = await getDoc(docRef);
      setNota(docSnap.data());
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOneNote(props.route.params.notaId);
  }, [props.route.params.notaId]);

  const deleteNote = async (id) => {
    await deleteDoc(doc(db, 'notas', id));
    Alert.alert('Éxito', 'Nota eliminada con éxito');
    props.navigation.navigate('Notas');
  };

  if (loading) {
    return <Text style={styles.loadingText}>Cargando datos...</Text>;
  }

  return (
    <ScrollView>
    <View style={styles.contenedor}>
      {nota.imageUrl && <Image source={{ uri: nota.imageUrl }} style={styles.imagen} />}
      <Text style={styles.texto}>Título: <Text style={{color:"black", fontWeight:300}}>{nota.titulo}</Text></Text>
      <Text style={styles.texto}>Detalle: <Text style={{color:"black", fontWeight:300}}>{nota.detalle}</Text></Text>
      <Text style={styles.texto}>Fecha: <Text style={{color:"black", fontWeight:300}}>{nota.fecha}</Text></Text>
      <Text style={styles.texto}>Hora: <Text style={{color:"black", fontWeight:300}}>{nota.hora}</Text></Text>
      <TouchableOpacity style={styles.botonEliminar} onPress={() => deleteNote(props.route.params.notaId)}>
        <Text style={styles.textoEliminar}>Eliminar</Text>
      </TouchableOpacity>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    margin: 20,
    width: '90%',
    padding: 10,
  },
  texto: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  botonEliminar: {
    backgroundColor: '#ed0e0eb8',
    borderRadius: 6,
    marginTop: 20,
  },
  textoEliminar: {
    textAlign: 'center',
    padding: 10,
    color: 'white',
  },
  imagen: {
    width: '100%',
    height:250 ,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
});
