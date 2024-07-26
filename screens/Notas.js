import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import appFirebase from '../credenciales';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { ListItem, Avatar } from '@rneui/themed';

const db = getFirestore(appFirebase);

export default function Notas(props) {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para obtener la lista de notas
  const getLista = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'notas'));
      const docs = [];
      querySnapshot.forEach((doc) => {
        const { titulo, detalle, fecha, hora, imageUrl } = doc.data();
        docs.push({
          id: doc.id,
          titulo,
          detalle,
          fecha,
          hora,
          imageUrl,
        });
      });
      setLista(docs);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log('Lectura: ' + error);
    }
  }, []);

  // Cargar datos cuando la pantalla recibe el foco
  useFocusEffect(
    useCallback(() => {
      getLista();
    }, [getLista])
  );

  return (
    <ScrollView style={{ backgroundColor: 'white' }}>
      <View>
        <TouchableOpacity
          style={styles.boton}
          onPress={() => props.navigation.navigate('Crear')}
        >
          <Text style={styles.textoBoton}>+</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <Text>Cargando datos ...</Text>
      ) : (
        <View style={styles.contenedor}>
          {lista.map((not) => (
            <ListItem
              bottomDivider
              key={not.id}
              onPress={() => {
                props.navigation.navigate('Detail', {
                  notaId: not.id,
                });
              }}
            >
              {not.imageUrl ? (
                <Avatar source={{ uri: not.imageUrl }} rounded size="medium" />
              ) : (
                <Avatar rounded size="medium" containerStyle={styles.noImage} />
              )}
              <ListItem.Content>
                <ListItem.Title style={styles.titulo}>
                  {not.titulo}
                </ListItem.Title>
                <ListItem.Subtitle>{not.fecha}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  boton: {
    backgroundColor: '#6283e5',
    borderRadius: "100%",
    width:50,
    height:50,
    margin: 20,
    justifyContent:"center",
    alignItems:"center"
  },
  textoBoton: {
    textAlign: 'center',
    color: 'white',
    fontSize:30,
    fontWeight:"bold",
    verticalAlign:"middle"
  },
  contenedor: {
    margin: 20,
    width: '90%',
    padding: 20,
  },
  titulo: {
    fontWeight: 'bold',
  },
  noImage: {
    backgroundColor: '#e0e0e0',
  },
});
